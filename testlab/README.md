# 🧪 Testlab - Garantia de Qualidade do LogLineOS

Este módulo contém a suíte de testes declarativos para o LogLineOS. Em vez de scripts de teste, escrevemos contratos `.test.logline` que descrevem o comportamento esperado.

- **Testes como Contratos**: Cada caso de teste é um contrato LogLine, permitindo que os testes sejam tão auditáveis quanto o código que testam.
- **Execução Nativa**: O `test_runner` é um contrato que executa outros contratos de teste, usando as mesmas primitivas do sistema.
- **Assertivas Declarativas**: As expectativas são definidas com a cláusula `expect`, que compara o resultado real com o esperado.