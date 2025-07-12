# 🌍 LogLineOS v3.0 — O Sistema Operacional Declarativo

**LogLineOS** é o primeiro sistema operacional construído 100% com contratos `.logline`, operando sobre uma arquitetura de "Assuntos" (Affairs) com estado, com múltiplos runtimes e governança institucional.

---

## 🚀 Guia Rápido de Deploy

1.  **Pré-requisitos**: Go (1.18+), PostgreSQL, `make`.
2.  **Configuração**:
    - Crie um arquivo `.env` na raiz do projeto.
    - Adicione as variáveis `POSTGRES_PASSWORD` e `OPENAI_API_KEY`.
3.  **Compilar e Empacotar**:
    ```bash
    make package
    ```
4.  **Deploy**:
    - Copie o arquivo `loglineos-X.Y.Z.tar.gz` para o servidor de produção.
    - Descompacte: `tar -xzf loglineos-X.Y.Z.tar.gz`.
    - Configure o serviço `systemd` (veja `server/systemd/loglineos.service`).
    - Inicie o serviço: `sudo systemctl start loglineos`.

## 🏛️ Filosofia

- **Nada é script. Tudo é contrato.**
- Cada ação do sistema é um *span rastreável*.
- Cada estado é uma *projeção da história*.

---