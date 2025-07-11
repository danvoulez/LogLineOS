# 🌍 LogLineOS 1.0 — O Primeiro Sistema Operacional Declarativo

**LogLineOS** é o primeiro sistema operacional construído 100% com contratos `.logline`, sem código imperativo, sem container, sem banco, sem dependência.  
Cada ação do sistema é um *span rastreável*. Cada motor é descritivo. Cada app é uma sequência auditável.

---

## 🧠 O que é o LogLineOS?

Um sistema onde:

- 🧾 Tudo é escrito em `.logline` (YAML)
- 📜 Não existe script — só contrato
- 🔁 Execuções são reversíveis
- 🧱 Estados são spans `.jsonl`
- 🌐 APIs, UIs e dispositivos são extensões simbólicas

---

## 📁 Estrutura do Projeto

```
loglineos_1.0_release/
├── contracts/
│   ├── bootstrap.logline
│   ├── execution.logline
│   ├── parser.logline
│   ├── generator.logline
│   ├── emitter.logline
│   ├── core/
│   │   ├── parser/logline_parser.logline
│   │   ├── codegen/wasm_emitter.logline
│   │   └── runtime/span_generator.logline
│   └── stdlib/
│       ├── core.logline
│       └── iot.logline
├── domains/
│   ├── iot/light_control.logline
│   └── monitoring/config.logline
├── examples/
│   ├── contract_example.logline
│   ├── ui.logline
│   └── device.logline
├── spans/
│   └── logline.main.jsonl
├── scripts/start.sh
└── VERSION.logline
```

---

## 🚀 Como usar

1. Certifique-se de ter Go e Rust instalados
2. Execute `make run` ou `./scripts/start.sh` para compilar o kernel WASM e iniciar o runner

---

## 🔩 Motores Inclusos

- `bootstrap.logline` – inicia e valida o sistema
- `execution.logline` – ciclo completo de execução de spans
- `parser.logline` – transforma `.logline` em AST
- `generator.logline` – transforma AST em spans
- `emitter.logline` – compila para WebAssembly

---

## 🧱 Fundamentos Técnicos

- Spans `.jsonl` são atômicos, rastreáveis e reversíveis
- Todo contrato é auditável antes da execução
- Cada domínio (`iot`, `web`, `monitoring`) pode estender o sistema
- Lógica WASM e LLM são motores acopláveis, não bases do sistema

---

## 💡 Exemplos prontos

- Controle de porta IoT
- Interface declarativa
- Pipeline completo de parsing → spans → wasm

---

## 🧙 Filosofia

> "**Nada é script. Tudo é contrato.**"

O LogLineOS nasce como uma nova forma de pensar infraestrutura, lógica e presença computacional.  
Nenhuma ação ocorre fora de um contrato. Nenhum estado existe fora de spans.

---

## 🏁 Versão

Este é o release **LogLineOS 1.0.0**

Composto por:
- 24 contratos `.logline`
- 2 domínios (`iot`, `monitoring`)
- 5 exemplos funcionais
- 0 dependências externas

---
## 🧠 UI Runtime

O diretório `ui_runtime/` é o motor visual oficial do LogLineOS. Ele executa e renderiza contratos `.logline` diretamente no navegador de forma canônica.

Para testar:

```bash
cd ui_runtime && ./start_demo.sh
```

Edite os contratos visuais e recarregue a página para vê-los através do `runtime.mjs`. Este runtime será utilizado por aplicações do ecossistema, como `minicontratos/` e `voulezvous.tv`.

## 🕒 Timeline

O diretório `timeline/` guarda a linha do tempo factual do sistema. Cada instância registra spans em arquivos `.jsonl` e pode sincronizar com PostgreSQL, mas seu uso é opcional e modular. Ele pode ser removido ou movido para outro repositório sem afetar o restante do LogLineOS.


## 🌐 Gateway
O diretorio `gateway/` e o ponto de entrada universal para os apps. Ele valida chaves de API, roteia para scripts backend, gera heartbeats e fornece fallback se o app falhar.

Para iniciar:

```bash
./gateway/launch_gateway.sh
```

Depois de iniciar, teste com:

```bash
curl -H "Authorization: Bearer abc123" http://localhost:8080/voulezvous/ping_app
```
## 📬 Contato

Desenvolvido por [dan@voulezvous.ai]  
Para fazer parte da fundação, envie seu primeiro `affair.logline`.

---

## Histórico do MotorCodex

Abaixo segue a documentação original do projeto **MotorCodex**, um runtime minimalista para a linguagem LogLine escrito em Go. Ele permanece como referência de implementação e exemplos de uso.

# MotorCodex

MotorCodex is a minimal runtime for the **LogLine** language. LogLine uses a YAML-like syntax to describe interactive UIs and workflows. This repository provides a reference implementation written in Go along with example workflows, a chronicler for span logging and a basic plugin system.

## Features

- Parses LogLine blocks and properties
- Supports nested containers, conditional blocks and loops
- Simple expression evaluation with `{{ }}` syntax including plugin calls
- Plugin registry with an example HTTP plugin
- Built-in syscall plugin for user input and file operations
- New syscalls for compiling and executing WebAssembly modules
- Chronicler that records execution spans to `spans.jsonl`
- Meta contract factory for generating new contracts interactively
- Example program demonstrating usage

## Getting Started

1. Ensure you have Go installed (1.18 or later).
2. Build the program:

```bash
go build
```

3. Run the example:

```bash
./motorcodex examples/example.logline
```

Expected output:

```
Hello Alice!
Item: a
Item: b
Item: c
```

## LogLine Grammar (simplified)

```
Logline := Block+
Block   := "- type:" Type "\n" (Property | Block)*
Property := "  " Key ":" Value

Type     := "text" | "markdown" | "container" | "button" | "input" | "loop" | "when" | "image"
Key      := [a-z_]+ ("." [a-z_]+)*
Value    := any text or `{{ expression }}`
```

## Architecture

- `parser` – converts `.logline` files into a tree of `Block` structures.
- `runtime` – walks the tree and prints the content with basic expression replacement.
- `main.go` – command line entry point.

## Future Work

This implementation is intentionally small. More advanced engines could include:

- Bytecode compilation for faster execution
- Plugin system for custom block types
- Integration with a persistent registry

Additional documentation can be found in the `docs/` directory:
* [`docs/GRAMMAR_FULL.md`](docs/GRAMMAR_FULL.md) – the complete language grammar.
* [`docs/MOTOR_PIPELINE.md`](docs/MOTOR_PIPELINE.md) – how the core contracts compose the engine purely with `.logline` files.
* [`docs/TEXT_ENGINE_OVERVIEW.md`](docs/TEXT_ENGINE_OVERVIEW.md) – running the text engine with only contracts.
* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – alternative engine concepts.
* [`docs/ENGINE_OPTIONS.md`](docs/ENGINE_OPTIONS.md) and [`docs/OTHER_MOTORS.md`](docs/OTHER_MOTORS.md) – further runtime ideas.
* [`docs/ALT_ARCHITECTURES.md`](docs/ALT_ARCHITECTURES.md) – additional kernel designs.
* [`docs/KERNELIZATION.md`](docs/KERNELIZATION.md) – using the new WASM syscalls.
Example workflow files are described in [`docs/EXAMPLES.md`](docs/EXAMPLES.md).

## Kernelization Example

Try the `kernelization_test.logline` contract to compile and run a WASM module:

```bash
go build
./motorcodex examples/kernelization_test.logline
```

