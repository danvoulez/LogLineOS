# Engine Variants

This project ships with a simple Go-based interpreter, but LogLine can run on many backends. Below are some design ideas explored by the community.

## Bytecode VM (Rust)
- Compile LogLine contracts into compact bytecode.
- Execute with a small Rust virtual machine.
- Suitable for microcontrollers and high‑throughput systems.

## JavaScript Runtime
- Parse LogLine to a JSON AST executed by Node.js.
- Leverages npm packages for rapid prototyping.
- Ideal for web-facing apps where JS is already present.

## WebAssembly Kernel
- Translate LogLine blocks directly into WASM.
- The same engine runs in browsers or servers.
- Enables sandboxed execution and strong portability.

## Serverless Deployment
- Package workflows as cloud functions (e.g., AWS Lambda).
- Spin up on demand with minimal cold-start times.

Each architecture has trade-offs between speed, size and portability. The Go interpreter in this repo serves as a reference implementation.
