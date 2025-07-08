# LogLine Language Specification

LogLine uses a concise YAML-inspired syntax to describe interactive blocks. A program is a tree of blocks.

```
Logline := Block+
Block   := "- type:" Type "\n" (Property | Block)*
Property := "  " Key ":" Value

Type     := "text" | "markdown" | "container" | "button" | "input" | "loop" | "when" | "image"
Key      := [a-z_]+ ("." [a-z_]+)*
Value    := any text or `{{ expression }}`
```

Expressions inside `{{` `}}` can reference environment values or call plugins using
`plugin.method(arg1, arg2)` syntax.

