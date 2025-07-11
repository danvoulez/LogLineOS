#!/bin/bash
# Script para iniciar o LogLine UI Runtime com o novo modelo dispatcher/handler

# Definir cores para o output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Título
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   LogLine UI Runtime 4.0                        ║${NC}"
echo -e "${BLUE}║              Dispatcher/Handler 100% Declarativo                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar requisitos
echo -e "${YELLOW}Verificando requisitos...${NC}"
if ! command -v python3 &> /dev/null
then
    echo -e "${RED}Python3 não encontrado! Tentando usar Python...${NC}"
    if ! command -v python &> /dev/null
    then
        echo -e "${RED}Python não encontrado! Por favor instale Python para continuar.${NC}"
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

# Obter o diretório atual
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Definir a porta
PORT=8000

# Verificar se a porta já está em uso
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}A porta $PORT já está em uso. Escolha outra porta ou encerre o processo que a está utilizando.${NC}"
    exit 1
fi

# Iniciar servidor HTTP simples
echo -e "${GREEN}Iniciando servidor HTTP na porta $PORT...${NC}"
echo -e "${YELLOW}Acesse a aplicação em http://localhost:$PORT/index.html${NC}"
echo ""
echo -e "${GREEN}Arquitetura:${NC}"
echo -e "  - ${YELLOW}Dispatcher Central${NC} (roteamento de operações)"
echo -e "  - ${YELLOW}Handlers Modulares${NC} (implementações em arquivos .logline)"
echo -e "  - ${YELLOW}Operações 100% Declarativas${NC} (sem código JavaScript imperativo)"
echo ""
echo -e "${BLUE}Para testar o novo modelo:${NC}"
echo -e "  Acesse http://localhost:$PORT/index.html?file=demo_all_features.logline"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para encerrar...${NC}"
echo ""

# Iniciar o servidor no diretório atual
cd "$SCRIPT_DIR"
$PYTHON_CMD -m http.server $PORT
