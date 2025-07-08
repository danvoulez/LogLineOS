package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/api"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
)

func main() {
	if len(os.Args) < 3 {
		log.Panicln("Usage: logline <kernel.wasm> <bootstrap.logline>")
	}
	kernelPath := os.Args[1]

	ctx := context.Background()
	r := wazero.NewRuntimeWithConfig(ctx, wazero.NewRuntimeConfig().WithCoreFeatures(api.CoreFeaturesV2).WithCompilationCache(wazero.NewCompilationCache()))
	defer r.Close(ctx)

	_, err := r.NewHostModuleBuilder("env").
		NewFunctionBuilder().WithFunc(logString).Export("log_message").
		NewFunctionBuilder().WithFunc(readFile).Export("file_read").
		Instantiate(ctx)
	if err != nil {
		log.Panicf("failed to instantiate host module: %v", err)
	}

	wasi_snapshot_preview1.MustInstantiate(ctx, r)

	kernelBytes, err := os.ReadFile(kernelPath)
	if err != nil {
		log.Panicf("failed to read kernel: %v", err)
	}

	log.Println("runner: starting kernel")
	_, err = r.InstantiateWithConfig(ctx, kernelBytes, wazero.NewModuleConfig().WithStdout(os.Stdout).WithStderr(os.Stderr).WithArgs(os.Args...))
	if err != nil {
		log.Panicf("failed to run kernel: %v", err)
	}
}

func logString(ctx context.Context, module api.Module, offset, byteCount uint32) {
	buf, ok := module.Memory().Read(offset, byteCount)
	if !ok {
		log.Panic("log_message: invalid memory")
	}
	fmt.Printf("[KERNEL] %s\n", string(buf))
}

func readFile(ctx context.Context, module api.Module, offset, count uint32) uint64 {
	path, ok := module.Memory().Read(offset, count)
	if !ok {
		log.Panic("file_read: invalid memory")
	}
	data, err := os.ReadFile(string(path))
	if err != nil {
		log.Printf("file_read error: %v", err)
		return 0
	}
	res, err := module.ExportedFunction("allocate_buffer").Call(ctx, uint64(len(data)))
	if err != nil {
		log.Panicf("file_read allocate failed: %v", err)
	}
	ptr := res[0]
	if !module.Memory().Write(uint32(ptr), data) {
		log.Panic("file_read: write failed")
	}
	return (ptr << 32) | uint64(len(data))
}
