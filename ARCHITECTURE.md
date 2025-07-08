# Alternative Engines

While the current prototype is written in Go, other architectures could improve performance or flexibility:

1. **Rust-based Bytecode VM**
   - Compile LogLine scripts into custom bytecode.
   - Leverage Rust's memory safety and speed.
   - Suitable for embedding in other applications.

2. **JavaScript Runtime**
   - Translate LogLine into a JSON AST and execute in Node.js.
   - Benefit from vast npm ecosystem and quick iteration.

3. **WASM Execution**
   - Compile LogLine to WebAssembly for cross-platform use.
   - Allows running the same engine in browsers and servers.

Each approach has trade-offs in complexity and performance. See the main code for the reference Go implementation.
