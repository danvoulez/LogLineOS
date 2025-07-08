package plugin

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
)

type SyscallPlugin struct{}

func (s *SyscallPlugin) Execute(method string, args ...interface{}) (interface{}, error) {
	switch method {
	case "input":
		fmt.Print("? ")
		reader := bufio.NewReader(os.Stdin)
		text, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		return text[:len(text)-1], nil
	case "input.choice":
		if len(args) < 1 {
			return nil, errors.New("input.choice requires options")
		}
		opts, ok := args[0].([]interface{})
		if !ok {
			return nil, errors.New("options must be array")
		}
		for i, o := range opts {
			fmt.Printf("%d: %v\n", i+1, o)
		}
		fmt.Print("? ")
		reader := bufio.NewReader(os.Stdin)
		text, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		return text[:len(text)-1], nil
	case "file_write":
		if len(args) < 2 {
			return nil, errors.New("file_write path content")
		}
		path, ok1 := args[0].(string)
		content, ok2 := args[1].(string)
		if !ok1 || !ok2 {
			return nil, errors.New("invalid args")
		}
		return path, os.WriteFile(path, []byte(content), 0644)
	case "compile_logline_to_wasm":
		if len(args) < 2 {
			return nil, errors.New("compile_logline_to_wasm requires source_path and output_path")
		}
		src, ok1 := args[0].(string)
		outPath, ok2 := args[1].(string)
		if !ok1 || !ok2 {
			return nil, errors.New("invalid args")
		}
		data, err := os.ReadFile(src)
		if err != nil {
			return nil, err
		}
		// very naive parsing of a single wasm_function block
		body := ""
		lines := strings.Split(string(data), "\n")
		for i, ln := range lines {
			if strings.HasPrefix(strings.TrimSpace(ln), "body:") {
				body = strings.Join(lines[i+1:], "\n")
				break
			}
		}
		wat := "(module (func $main (export \"main\") (param i32) (result i32)\n" + body + "\n))"
		watPath := filepath.Join(filepath.Dir(outPath), "temp.wat")
		if err := os.WriteFile(watPath, []byte(wat), 0644); err != nil {
			return nil, err
		}
		cmd := exec.Command("wat2wasm", watPath, "-o", outPath)
		if out, err := cmd.CombinedOutput(); err != nil {
			return nil, fmt.Errorf("wat2wasm failed: %v: %s", err, string(out))
		}
		os.Remove(watPath)
		return outPath, nil
	case "execute_wasm":
		if len(args) < 3 {
			return nil, errors.New("execute_wasm path function args")
		}
		path, _ := args[0].(string)
		fn, _ := args[1].(string)
		argList, ok := args[2].([]interface{})
		if !ok {
			return nil, errors.New("args must be array")
		}
		wasmBytes, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		ctx := context.Background()
		r := wazero.NewRuntime(ctx)
		defer r.Close(ctx)
		wasi_snapshot_preview1.MustInstantiate(ctx, r)
		module, err := r.InstantiateWithConfig(ctx, wasmBytes, wazero.NewModuleConfig())
		if err != nil {
			return nil, err
		}
		var params []uint64
		for _, a := range argList {
			switch v := a.(type) {
			case int:
				params = append(params, uint64(v))
			case int32:
				params = append(params, uint64(uint32(v)))
			case string:
				if iv, err := strconv.Atoi(v); err == nil {
					params = append(params, uint64(iv))
				}
			}
		}
		f := module.ExportedFunction(fn)
		if f == nil {
			return nil, fmt.Errorf("function not found: %s", fn)
		}
		res, err := f.Call(ctx, params...)
		if err != nil {
			return nil, err
		}
		if len(res) > 0 {
			return int32(res[0]), nil
		}
		return nil, nil
	case "exit":
		os.Exit(0)
		return nil, nil
	default:
		return nil, fmt.Errorf("unknown syscall: %s", method)
	}
}

func init() {
	Register("syscall", &SyscallPlugin{})
}
