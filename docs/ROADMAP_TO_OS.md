# Roadmap from MotorCodex to LogLineOS

This document summarizes a three phase plan to evolve the current Go-based interpreter into a self-hosting declarative operating system written mostly in LogLine.

## Phase 1 – Kernel as WebAssembly
* Isolate the native runner so it only boots a `kernel.wasm` file.
* Provide minimal syscalls (`log_span`, `file_read`, `llm_inference`).
* Rewrite the core scheduler and executor in a language that compiles to WASM (e.g. Rust) to produce `kernel.wasm`.
* Define a stable syscall ABI via `contracts/kernel/syscall_abi.logline`.

## Phase 2 – Self-hosting Toolchain
* Implement the LogLine parser and code generator as contracts (`contracts/toolchain/parser.logline` etc.).
* Use a small bootstrap parser in the kernel to compile these contracts into `toolchain.wasm`.
* Once built, swap the bootstrap parser for the self-hosted toolchain so the system can update itself by submitting new contracts.

## Phase 3 – Autonomous Governance
* Add a `simulate` syscall that runs contracts on a forked span timeline.
* Deploy contracts that leverage LLM inference to propose and validate improvements (`system_refactor_agent.logline`).
* Formalize governance rules in `contracts/governance/foundation_charter.logline` so the OS can vote on and accept updates.

These phases move the project from a simple interpreter to a portable kernel capable of compiling and improving itself purely through LogLine contracts.
