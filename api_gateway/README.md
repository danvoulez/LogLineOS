# 🔐 API Gateway v3.0 - LogLineOS

Este módulo é a interface HTTP oficial para o LogLineOS, implementado como um sistema de "Assuntos" (Affairs) com estado.

## Filosofia

- **Processos, não Eventos**: Cada chamada de API não apenas dispara um evento; ela cria um "Assunto" — um contrato vivo com seu próprio ciclo de vida (`created` -> `authenticating` -> `routing` -> `completed`).
- **Estado Explícito e Auditável**: O estado de cada requisição individual é rastreado em um único span que evolui, em vez de uma cadeia de eventos separados. Isso permite timeouts, recuperação e auditoria de processos individuais de forma trivial.
- **Regras como Transições de Estado**: As `execution_rule`s agora definem as transições de estado válidas para um "Assunto", agindo como uma State Machine formal e auditável.

## Ciclo de Vida de um "Assunto" de API

1.  `api_entry.logline` instancia um `api_affair` span com status `created`.
2.  Uma `execution_rule` reage ao estado `created`, atualiza o status para `authenticating` e chama `validate_token.logline`.
3.  `validate_token.logline` atualiza o status do "Assunto" para `authenticated` ou `failed`.
4.  Se `authenticated`, outra regra reage, atualiza o status para `routing` e chama `route_request.logline`.
5.  `route_request.logline` executa a lógica de negócio e atualiza o status para `completed` ou `failed`.
6.  Regras finais reagem aos estados terminais (`completed`, `failed`) para enviar a resposta HTTP apropriada ao cliente.