# 🧬 State Builder - O Reconstrutor de Estado do LogLineOS

Este módulo é responsável por derivar o estado atual e consultável do sistema a partir da linha do tempo imutável de spans. Ele garante que, mesmo que a memória volátil seja perdida, o estado completo pode ser reconstruído com 100% de fidelidade a partir da história.

- **Fonte Única de Verdade**: O estado é sempre uma projeção da timeline, nunca uma fonte de verdade primária.
- **Reconstrução Auditável**: O processo de `rebuild_state` é, em si, um "Assunto" auditável.
- **Desempenho**: Mantém uma cópia materializada do estado (`state.bin`) para consultas rápidas, evitando a necessidade de varrer a timeline para cada leitura.