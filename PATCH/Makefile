# ==============================================================================
# Makefile de Produção para LogLineOS v3.0
# ==============================================================================

# Nome do binário do motor
BINARY_NAME=logline

# Versão do Lançamento
VERSION ?= $(shell cat VERSION.logline | grep version | awk -F '"' '{print $$4}')
RELEASE_NAME=loglineos-$(VERSION)
RELEASE_ARCHIVE=$(RELEASE_NAME).tar.gz

# Diretório de build
BUILD_DIR=./build

# --- Comandos Principais ---

.PHONY: all build test clean run package

all: build

# Compila o motor Go
build:
	@echo ">> Compilando o motor LogLineOS v$(VERSION)..."
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/logline

# Roda a suíte de testes declarativa
test: build
	@echo ">> Executando a suíte de testes institucionais..."
	@$(BUILD_DIR)/$(BINARY_NAME) run testlab/test_runner.logline

# Limpa os artefatos de build e pacotes
clean:
	@echo ">> Limpando artefatos de build..."
	@rm -rf $(BUILD_DIR)
	@rm -f *.tar.gz

# Executa o servidor em modo de desenvolvimento
run: build
	@echo ">> Iniciando o servidor LogLineOS em modo de desenvolvimento..."
	@./$(BUILD_DIR)/$(BINARY_NAME) run server/server_entry.logline

# Cria o pacote de distribuição para produção
package: clean build
	@echo ">> Criando o pacote de lançamento: $(RELEASE_ARCHIVE)..."
	@mkdir -p $(BUILD_DIR)/$(RELEASE_NAME)
	# Copia o binário
	@cp $(BUILD_DIR)/$(BINARY_NAME) $(BUILD_DIR)/$(RELEASE_NAME)/
	# Copia todos os diretórios de contratos essenciais
	@cp -R api_gateway server timeline llm_guardian constitution audit docs dispatcher state_builder sovereign_repl testlab embedmind migrations config $(BUILD_DIR)/$(RELEASE_NAME)/
	# Cria o arquivo tarball
	@(cd $(BUILD_DIR) && tar -czf ../$(RELEASE_ARCHIVE) $(RELEASE_NAME))
	@echo ">> Pacote de lançamento criado em: $(RELEASE_ARCHIVE)"

help:
	@echo "Uso: make [target]"
	@echo "  build    - Compila o motor."
	@echo "  test     - Roda a suíte de testes."
	@echo "  run      - Inicia o servidor em modo de desenvolvimento."
	@echo "  package  - Cria um pacote .tar.gz para deploy."
	@echo "  clean    - Remove todos os artefatos de build."