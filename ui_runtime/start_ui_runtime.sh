#!/bin/bash

# Caminho para o diretório do UI Runtime
UI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verifica se Python está instalado
if command -v python3 &> /dev/null; then
    echo "Iniciando servidor HTTP com Python 3..."
    cd "$UI_DIR"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Iniciando servidor HTTP com Python..."
    cd "$UI_DIR"
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    echo "Iniciando servidor HTTP com Node.js serve..."
    cd "$UI_DIR"
    npx serve
else
    echo "Erro: Não foi possível encontrar Python ou Node.js para iniciar um servidor HTTP."
    echo "Por favor, instale Python ou Node.js e tente novamente."
    exit 1
fi

# Abre o navegador após um pequeno delay para garantir que o servidor esteja rodando
(
    sleep 2
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:8000
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:8000
    elif command -v start &> /dev/null; then
        # Windows
        start http://localhost:8000
    fi
) &

echo "LogLine UI Runtime está rodando em http://localhost:8000"
echo "Pressione Ctrl+C para encerrar o servidor"
