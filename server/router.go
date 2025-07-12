package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type Router struct {
	Auth   *Auth
	Logger *Logger
	Heart  *Heartbeat
}

func (rt *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/commit":
		rt.handleCommit(w, r)
	case "/query":
		rt.handleQuery(w, r)
	case "/login":
		rt.handleLogin(w, r)
	case "/heartbeat":
		rt.handleHeartbeat(w, r)
	case "/ws":
		ws := WSHandler{Auth: rt.Auth, Logger: rt.Logger}
		ws.ServeHTTP(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (rt *Router) tenantFromRequest(r *http.Request) (string, bool) {
	auth := r.Header.Get("Authorization")
	return rt.Auth.Validate(auth)
}

func (rt *Router) handleCommit(w http.ResponseWriter, r *http.Request) {
	tenant, ok := rt.tenantFromRequest(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusForbidden)
		rt.Logger.Record("unknown", map[string]interface{}{"type": "unauthorized", "ts": time.Now().UTC()})
		return
	}
	var body struct {
		Contract string                 `json:"contract"`
		Env      map[string]interface{} `json:"env"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	res := ExecuteContract(body.Contract, body.Env)
	span := map[string]interface{}{"type": "commit", "contract": body.Contract, "duration_ms": res.DurationMS, "error": res.Error, "ts": time.Now().UTC()}
	rt.Logger.Record(tenant, span)
	json.NewEncoder(w).Encode(span)
}

func (rt *Router) handleQuery(w http.ResponseWriter, r *http.Request) {
	tenant, ok := rt.tenantFromRequest(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusForbidden)
		return
	}
	spans := rt.Logger.fetch(tenant) // We'll implement fetch method below
	json.NewEncoder(w).Encode(spans)
}

func (l *Logger) fetch(tenant string) []map[string]interface{} {
	path := filepath.Join(l.baseDir, tenant+".jsonl")
	f, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer f.Close()
	var spans []map[string]interface{}
	dec := json.NewDecoder(f)
	for {
		var m map[string]interface{}
		if err := dec.Decode(&m); err != nil {
			break
		}
		spans = append(spans, m)
	}
	return spans
}

func (rt *Router) handleLogin(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}

func (rt *Router) handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	rt.Heart.Beat()
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "ts": time.Now().UTC()})
}
