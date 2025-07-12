package main

import (
	"bufio"
	"os"
	"strings"
	"sync"
)

type Auth struct {
	tokens map[string]string
	mu     sync.RWMutex
}

func LoadAuth(path string) (*Auth, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	a := &Auth{tokens: make(map[string]string)}
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		token := line
		tenant := parseTenant(token)
		a.tokens[token] = tenant
	}
	return a, scanner.Err()
}

func parseTenant(token string) string {
	if strings.HasPrefix(token, "Bearer_") {
		p := strings.SplitN(strings.TrimPrefix(token, "Bearer_"), "_", 2)
		if len(p) > 0 {
			return strings.ToLower(p[0])
		}
	}
	return "default"
}

func (a *Auth) Validate(token string) (string, bool) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	tenant, ok := a.tokens[token]
	return tenant, ok
}
