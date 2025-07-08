# LogLine Text Engine

This document explains how the provided Go runtime processes LogLine files using only contracts written in the LogLine language. The goal is to demonstrate a minimal, fully declarative engine.

## Pipeline

1. **Parsing** – `contracts/parser.logline` reads a `.logline` file and produces an AST. It defines the grammar rules purely in LogLine form.
2. **Span Generation** – `contracts/generator.logline` walks the AST to emit JSONL spans capturing each operation.
3. **WASM Emission** – `contracts/emitter.logline` converts spans into a WASM module. Workflows compiled this way run on any WASM host.
4. **Execution** – `contracts/execution.logline` ties together parser, generator and emitter, providing a full compile-and-run pipeline without any external code.

## Running

```bash
go build
./motorcodex examples/example.logline
```

The runtime loads the contracts listed in `contracts/bootstrap.logline` which in turn call the parser, generator and emitter purely via LogLine actions. No Go code knows about the workflow details.

## Extending

To add new behaviour, create additional `.logline` files under `contracts/` and reference them from `bootstrap.logline`. The runtime will execute them through the declarative pipeline. This design keeps the engine small and auditable.

