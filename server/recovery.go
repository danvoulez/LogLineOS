package main

import (
	"log"
	"time"
)

type Heartbeat struct {
	last time.Time
	ch   chan struct{}
}

func NewHeartbeat() *Heartbeat {
	return &Heartbeat{last: time.Now(), ch: make(chan struct{})}
}

func (h *Heartbeat) Start() {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		for range ticker.C {
			if time.Since(h.last) > 60*time.Second {
				log.Println("heartbeat timeout")
			}
		}
	}()
}

func (h *Heartbeat) Beat() {
	h.last = time.Now()
}

func Recovery(next func()) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("panic recovered: %v", r)
			go next()
		}
	}()
	next()
}
