package main

import (
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Logger struct {
	mu      sync.Mutex
	baseDir string
	db      *sql.DB
	useDB   bool
}

func NewLogger(dir string, db *sql.DB) *Logger {
	return &Logger{baseDir: dir, db: db, useDB: db != nil}
}

func (l *Logger) appendFile(tenant string, span map[string]interface{}) error {
	path := filepath.Join(l.baseDir, tenant+".jsonl")
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	return enc.Encode(span)
}

func (l *Logger) appendDB(tenant string, span map[string]interface{}) error {
	if !l.useDB {
		return nil
	}
	b, err := json.Marshal(span)
	if err != nil {
		return err
	}
	_, err = l.db.Exec("INSERT INTO spans (tenant, span, ts) VALUES ($1, $2, $3)", tenant, string(b), time.Now().UTC())
	return err
}

func (l *Logger) Record(tenant string, span map[string]interface{}) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	if err := l.appendFile(tenant, span); err != nil {
		return err
	}
	return l.appendDB(tenant, span)
}
