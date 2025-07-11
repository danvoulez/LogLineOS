package main

import (
	"bytes"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type TenantConfig struct {
	Apps map[string]struct {
		APIKeys []string `json:"api_keys"`
	} `json:"apps"`
}

type Config struct {
	Tenants map[string]TenantConfig `json:"tenants"`
}

var (
	config       Config
	configLock   sync.RWMutex
	timelineMu   sync.Mutex
	timelinePath = filepath.Join("timeline", "requests.jsonl")
)

func loadConfig(path string) error {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	configLock.Lock()
	defer configLock.Unlock()
	return json.Unmarshal(data, &config)
}

func validateKey(tenant, app, key string) bool {
	configLock.RLock()
	defer configLock.RUnlock()
	t, ok := config.Tenants[tenant]
	if !ok {
		return false
	}
	a, ok := t.Apps[app]
	if !ok {
		return false
	}
	for _, k := range a.APIKeys {
		if k == key {
			return true
		}
	}
	return false
}

func appendSpan(span interface{}) {
	timelineMu.Lock()
	defer timelineMu.Unlock()
	f, err := os.OpenFile(timelinePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Println("open timeline:", err)
		return
	}
	defer f.Close()
	data, _ := json.Marshal(span)
	f.Write(data)
	f.Write([]byte("\n"))
}

func heartbeatLoop() {
	for {
		time.Sleep(60 * time.Second)
		span := map[string]interface{}{
			"type":           "heartbeat",
			"gateway_status": "ok",
			"timestamp":      time.Now().Format(time.RFC3339),
		}
		appendSpan(span)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 2 {
		http.Error(w, "invalid path", http.StatusNotFound)
		return
	}
	tenantID := parts[0]
	appID := parts[1]
	key := ""
	if auth := r.Header.Get("Authorization"); strings.HasPrefix(auth, "Bearer ") {
		key = strings.TrimPrefix(auth, "Bearer ")
	}
	if !validateKey(tenantID, appID, key) {
		span := map[string]interface{}{
			"type":         "error",
			"reason":       "invalid_api_key",
			"ip":           r.RemoteAddr,
			"timestamp":    time.Now().Format(time.RFC3339),
			"request_path": r.URL.Path,
		}
		appendSpan(span)
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(span)
		return
	}

	span := map[string]interface{}{
		"type":         "request",
		"tenant_id":    tenantID,
		"app_id":       appID,
		"request_path": r.URL.Path,
		"method":       r.Method,
		"ip":           r.RemoteAddr,
		"timestamp":    time.Now().Format(time.RFC3339),
	}
	appendSpan(span)

	script := filepath.Join("apps", appID, "handle_request.sh")
	if _, err := os.Stat(script); err != nil {
		fallback(w, "missing_app")
		return
	}
	body, _ := io.ReadAll(r.Body)
	cmd := execCmd(script, body, tenantID, appID, strings.Join(parts[2:], "/"))
	output, err := cmd.Output()
	if err != nil {
		fallback(w, "app_error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func execCmd(script string, body []byte, tenant, app, path string) *exec.Cmd {
	cmd := exec.Command(script)
	cmd.Env = append(os.Environ(),
		"TENANT_ID="+tenant,
		"APP_ID="+app,
		"PATH_INFO="+path,
	)
	cmd.Stdin = bytes.NewReader(body)
	return cmd
}

func fallback(w http.ResponseWriter, reason string) {
	resp := map[string]interface{}{
		"status":    "fallback",
		"reason":    reason,
		"timestamp": time.Now().Format(time.RFC3339),
	}
	appendSpan(map[string]interface{}{
		"type":      "fallback",
		"reason":    reason,
		"timestamp": time.Now().Format(time.RFC3339),
	})
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	if err := loadConfig(filepath.Join("config", "tenants.json")); err != nil {
		log.Fatal(err)
	}
	go heartbeatLoop()
	http.HandleFunc("/", handler)
	log.Println("Gateway listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
