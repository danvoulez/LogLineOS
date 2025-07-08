# LogLine Motor Pipeline

This document summarises the original vision behind the **LogLine Motor**
(seen in the archived planning document) and how each contract works together
purely through `.logline` files.

1. **Parsing** – `contracts/parser.logline`
   describes how source files are converted into an AST. A small WASM module
   can implement the tokeniser and syntax checks but the orchestration is
   declarative.

2. **Span Generation** – `contracts/generator.logline`
   walks the AST and produces spans that capture every operation. Spans are
   append-only JSON lines stored under `spans/` for auditability.

3. **WASM Emission** – `contracts/emitter.logline`
   turns spans into WebAssembly so workflows can run anywhere with a WASM host.

4. **Bootstrap** – `contracts/bootstrap.logline`
   wires these pieces together, loading the parser, generator and emitter. It
   also registers simple execution rules and produces an example span.

The goal of this pipeline is a fully declarative engine where new capabilities
can be introduced just by editing or adding `.logline` contracts. No Go or Rust
changes are required once the WASM helpers are available.
