BINARY_NAME=logline
RUNTIME_SRC=runner/main.go
KERNEL_SRC=kernel-rs
KERNEL_WASM=build/kernel.wasm

build: check-tools
	@echo ">> Building kernel";
	@(cd $(KERNEL_SRC) && cargo build --release --target wasm32-wasi)
	@mkdir -p build
	@cp $(KERNEL_SRC)/target/wasm32-wasi/release/logline_kernel.wasm $(KERNEL_WASM)
	@echo ">> Building runner";
	@go build -o build/$(BINARY_NAME) $(RUNTIME_SRC)

run: build
	@echo ">> Starting LogLineOS"
	@./build/$(BINARY_NAME) $(KERNEL_WASM) contracts/bootstrap.logline

check-tools:
	@command -v cargo >/dev/null
	@command -v go >/dev/null

clean:
	rm -rf build

.PHONY: build run clean check-tools


# Start the official visual runtime
ui-demo:
	cd ui_runtime && ./start_demo.sh

.PHONY: ui-demo
