# 🧠 LLM Guardian - O Executor Semântico do LogLineOS

Este módulo é o intérprete de intenções do sistema. Ele recebe objetivos em linguagem natural ou simbólica e os traduz em uma sequência de spans executáveis e seguros.

- **Intenção Primeiro**: Opera sobre `goal_affair`, um processo para realizar um objetivo.
- **Segurança Constitucional**: Antes de executar, submete todos os spans propostos à `constitution/` para validação.
- **Fallback Controlado**: Usa LLMs como uma ferramenta de último recurso, não como a primeira opção, garantindo previsibilidade e controle de custos.