package main

import (
	"fmt"
	"os"

	"motorcodex/parser"
	"motorcodex/plugin"
	"motorcodex/runtime"
	"motorcodex/tracer"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: motorcodex <file.logline>")
		os.Exit(1)
	}
	f, err := os.Open(os.Args[1])
	if err != nil {
		panic(err)
	}
	defer f.Close()

	blocks, err := parser.Parse(f)
	if err != nil {
		panic(err)
	}

	plugin.Register("http", &plugin.HTTPPlugin{})

	chronicler, _ := tracer.NewChronicler("trace-1", "spans.jsonl")
	defer chronicler.Close()

	env := runtime.Env{
		"user.name":   "Alice",
		"input.text":  "hello",
		"list":        []interface{}{"a", "b", "c"},
		"show_button": true,
	}

	runtime.Run(blocks, env, chronicler)
}
