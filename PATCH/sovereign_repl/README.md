# 🖥️ Sovereign REPL - A Interface de Comando do LogLineOS

Este módulo implementa o REPL (Read-Eval-Print Loop) oficial do LogLineOS. Diferente de um shell tradicional, cada comando inserido aqui não é uma execução imperativa, mas a criação de um "Assunto" (`console_affair`) que é processado pelo motor de regras do sistema.

- **100% Span-Based**: Cada comando, output e erro é um span na timeline.
- **Soberania**: Não depende de `bash`, `zsh` ou qualquer shell externo. A lógica de parsing e execução é interna ao LogLineOS.
- **Histórico Auditável**: O histórico de comandos não é um mero arquivo de texto, mas uma consulta na timeline de `console_affair`s.