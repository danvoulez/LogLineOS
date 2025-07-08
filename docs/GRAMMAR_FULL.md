# LogLine Full Grammar

Below is the concise grammar (23 essential tokens) and an illustrative example.

```
Logline := Bloco+
Bloco   := "- type:" Tipo "\n" (Propriedade | Bloco)*
Prop    := "  " Chave ":" Valor

Tipo    := "text" | "markdown" | "container" | "button" \
         | "input" | "loop" | "when" | "image"

Chave   := [a-z_]+ ("." [a-z_]+)*
Valor   := [^\n]+ | "{{" Expressao "}}"

Expressao := CaminhoDado | ChamadaContrato
CaminhoDado := [a-z_]+ ("." [a-z_]+)*
ChamadaContrato := [a-z_]+ "(" Parametros ")"
```

Example in nine lines:

```logline
- type: container
  id: main
  children:
    - type: text
      content: "Olá {{user.name}}!"
    - type: button
      on.click: sendMessage("{{input.text}}")
```

Key reading points:

1. Hierarchy by two-space indentation
2. `{{ }}` for data or contracts
3. Basic types cover most UIs
4. One file equals one block tree
5. Renderer walks the tree depth-first

The extended syntax allows optional properties such as `when`, `bind` and `style`.
