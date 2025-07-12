package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type WSHandler struct {
	Auth   *Auth
	Logger *Logger
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *WSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		token = r.Header.Get("Authorization")
	}
	tenant, ok := h.Auth.Validate(token)
	if !ok {
		http.Error(w, "unauthorized", http.StatusForbidden)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("ws upgrade:", err)
		return
	}
	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			break
		}
		t := msg["type"].(string)
		switch t {
		case "ping":
			resp := map[string]interface{}{"type": "pong", "ts": time.Now().UTC()}
			conn.WriteJSON(resp)
			h.Logger.Record(tenant, map[string]interface{}{"type": "ping", "ts": time.Now().UTC()})
		case "commit":
			contract, _ := msg["contract"].(string)
			env, _ := msg["env"].(map[string]interface{})
			res := ExecuteContract(contract, env)
			span := map[string]interface{}{"type": "commit", "contract": contract, "ts": time.Now().UTC(), "duration_ms": res.DurationMS, "error": res.Error}
			h.Logger.Record(tenant, span)
			conn.WriteJSON(span)
		default:
			errSpan := map[string]interface{}{"type": "error", "reason": "invalid_type", "ts": time.Now().UTC()}
			h.Logger.Record(tenant, errSpan)
			conn.WriteJSON(errSpan)
		}
	}
	conn.Close()
}
