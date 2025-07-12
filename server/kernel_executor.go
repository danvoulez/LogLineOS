package main

import (
	"motorcodex/parser"
	"motorcodex/runtime"
	"motorcodex/tracer"
	"os"
	"time"
)

type ExecResult struct {
	DurationMS int64                  `json:"duration_ms"`
	Error      string                 `json:"error,omitempty"`
	Output     map[string]interface{} `json:"output,omitempty"`
}

func ExecuteContract(path string, env map[string]interface{}) ExecResult {
	start := time.Now()
	f, err := os.Open(path)
	if err != nil {
		return ExecResult{Error: err.Error()}
	}
	defer f.Close()
	blocks, err := parser.Parse(f)
	if err != nil {
		return ExecResult{Error: err.Error()}
	}
	chronicler, _ := tracer.NewChronicler("kernel", os.DevNull)
	runtime.Run(blocks, runtime.Env(env), chronicler)
	chronicler.Close()
	return ExecResult{DurationMS: time.Since(start).Milliseconds()}
}
