# Alternative Kernel Architectures

While this repository provides a simple Go runner with a Rust-based WASM kernel, other architectures could offer different trade-offs.

## Native C Runtime
A minimal C runtime could reduce binary size and improve startup speed on constrained devices. Syscalls would be exposed via direct function pointers.

## Managed JVM Engine
Implementing the kernel in Java or Kotlin allows seamless integration with enterprise systems and makes use of the mature JVM tooling. Performance can be competitive with JIT compilation.

## GPU Accelerated Kernel
For workloads heavy on parallel computation, core contracts could be compiled to SPIR-V and executed on GPUs. This approach suits simulations or AI inference at scale.

Each approach impacts portability, security and maintenance. Exploring multiple engines helps validate the language across diverse environments.
