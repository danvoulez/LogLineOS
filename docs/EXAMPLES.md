# Example Workflows

This repository ships with a couple of example `.logline` files.

`examples/example.logline` demonstrates containers, loops and a plugin call.

```
- type: container
  children:
    - type: text
      content: "Hello {{user.name}}!"
    - type: loop
      for: list
      children:
        - type: text
          content: "Item: {{item}}"
    - type: text
      content: "Public IP: {{http.get(\"https://ifconfig.me/ip\")}}"
```

You can run it with:

```bash
make run workflow=examples/example.logline
```
The `ui_runtime/` directory contains a standalone browser runtime for visual contracts. You can try it with:

```bash
cd ui_runtime && ./start_demo.sh
```

Then open `http://localhost:8000/index.html?file=../examples/ui_runtime_demo.logline` to render the example `examples/ui_runtime_demo.logline`.
