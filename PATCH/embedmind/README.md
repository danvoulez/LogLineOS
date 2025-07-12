# 🧠 Embedmind - O Córtex Semântico do LogLineOS

Este módulo é responsável por gerar embeddings vetoriais para todos os artefatos do sistema (spans, contratos, etc.). Isso permite buscas semânticas, análise de similaridade e raciocínio baseado em contexto.

- **Local-First**: Prioriza o uso de modelos de embedding compilados para WASM, garantindo soberania e privacidade.
- **Indexação Contínua**: Gera e atualiza vetores em tempo real à medida que novos spans são criados.
- **Busca Vetorial Nativa**: Fornece uma syscall para busca de similaridade, `syscall.vector.search`.