# Kernelization Phase

This document describes how the runtime can compile a LogLine contract into WebAssembly and execute it via new syscalls.

## Compile and Execute

Two syscalls power this capability:

- `compile_logline_to_wasm` – converts a `.logline` file containing a `wasm_function` block into a `.wasm` module. It requires the external tool `wat2wasm` from the [WABT](https://github.com/WebAssembly/wabt) toolkit.
- `execute_wasm` – loads the compiled module using the [`wazero`](https://github.com/tetratelabs/wazero) runtime and invokes an exported function.

The example contract `examples/kernelization_test.logline` demonstrates the workflow:

1. Compile `examples/simple_add_one.logline` to `build/add_one.wasm`.
2. Execute the `main` function with argument `41`.
3. Assert that the returned value is `42`.

Run the interpreter on that file to verify WASM support:

```bash
./motorcodex examples/kernelization_test.logline
```

Ensure `wat2wasm` is available in your PATH before executing the test.
