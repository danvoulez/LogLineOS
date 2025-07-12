# Changelog

## [3.0.0] - 2024-XX-XX - "Sovereign Dawn"

### Added
- **Dispatcher de Runtime**: Módulo central (`dispatcher/`) para roteamento semântico entre `core_runtime` e `ui_runtime`.
- **Timeline Persistente**: Módulo (`timeline/`) com integração PostgreSQL para armazenamento durável de spans.
- **State Builder**: Módulo (`state_builder/`) para reconstrução de estado derivado a partir da timeline.
- **LLM Guardian**: Módulo (`llm_guardian/`) para interpretação de intenções e fallback cognitivo.
- **Constituição**: Módulo (`constitution/`) para enforcement de regras institucionais.
- **REPL Soberano**: Módulo (`sovereign_repl/`) para uma CLI 100% baseada em spans.
- **Embedmind**: Módulo (`embedmind/`) para geração de embeddings vetoriais.
- **Testlab**: Módulo (`testlab/`) com suíte de testes declarativos.
- **Sistema de Migrações**: Módulo (`migrations/`) para gerenciamento de schema de banco de dados.
- **Gestão de Configuração**: Módulo (`config/`) para carregamento de segredos de variáveis de ambiente.

### Changed
- **Arquitetura**: Sistema consolidado sob a **Visão 3.0** de "Assuntos" (Affairs).
- **Bootstrap**: `server_entry.logline` agora orquestra todo o boot do sistema, incluindo migrações e carregamento de regras.