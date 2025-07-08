package tracer

import (
	"encoding/json"
	"log"
	"os"
	"time"
)

// LogLineEvent describes one execution span.
type LogLineEvent struct {
	Who     string                 `json:"who"`
	Did     string                 `json:"did"`
	This    string                 `json:"this"`
	When    time.Time              `json:"when"`
	Status  string                 `json:"status"`
	Details map[string]interface{} `json:"details,omitempty"`
	TraceID string                 `json:"trace_id"`
}

type Chronicler struct {
	traceID string
	file    *os.File
	enc     *json.Encoder
}

func NewChronicler(traceID, path string) (*Chronicler, error) {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	return &Chronicler{traceID: traceID, file: f, enc: json.NewEncoder(f)}, nil
}

func (c *Chronicler) Record(who, did, this, status string, details map[string]interface{}) {
	evt := LogLineEvent{
		Who:     who,
		Did:     did,
		This:    this,
		When:    time.Now().UTC(),
		Status:  status,
		Details: details,
		TraceID: c.traceID,
	}
	if err := c.enc.Encode(evt); err != nil {
		log.Printf("record event: %v", err)
	}
}

func (c *Chronicler) Close() {
	_ = c.file.Close()
}
