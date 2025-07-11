# LogLineOS ## Características

- 💯 **100% Declarativo**: Todas as UIs e lógica são definidas em arquivos `.logline`
- 🚀 **Zero Dependencies**: Não usa React, Vue, Angular ou outras bibliotecas externas
- 📦 **Componentes Reutilizáveis**: Defina componentes uma vez, use em vários lugares
- 🔄 **Reversível**: Toda operação é declarada em arquivos, facilitando debug e auditoria
- ⚡ **Extensível**: Adicione novas operações apenas criando novos handlers
- 📊 **Visualização de Dados**: Suporte avançado para exibição de tabelas e dados formatados
- 🖼️ **Suporte a Mídia**: Manipulação de imagens e vídeos com recursos avançados
- 📤 **Upload de Arquivos**: Suporte completo para upload e gerenciamento de arquivosime 4.0

Um runtime 100% declarativo para interfaces web com o LogLineOS, agora implementando o padrão dispatcher/handler.

## Arquitetura

O UI Runtime 4.0.0 implementa uma arquitetura totalmente declarativa baseada no padrão dispatcher/handler, onde:

1. **Dispatcher**: Roteia operações para handlers específicos
2. **Handlers**: Arquivos .logline que implementam cada operação
3. **Main.js**: Código mínimo que carrega e interpreta os arquivos declarativos

## Características

- 💯 **100% Declarativo**: Todas as UIs e lógica são definidas em arquivos `.logline`
- 🚀 **Zero Dependencies**: Não usa React, Vue, Angular ou outras bibliotecas externas
- 📦 **Componentes Reutilizáveis**: Defina componentes uma vez, use em vários lugares
- � **Reversível**: Toda operação é declarada em arquivos, facilitando debug e auditoria
- ⚡ **Extensível**: Adicione novas operações apenas criando novos handlers

## Camadas do Sistema

### 🧠 Dispatcher (Roteamento declarativo)

- **Roteamento central** via arquivo `dispatcher.logline`
- **Resolução dinâmica** de handlers para cada operação
- **Fluxo unidirecional** de dados e operações

### 🛠️ Handlers (Implementações modulares)

- **Cada operação tem seu próprio handler** declarativo
- **Interpolação de variáveis** para passagem de parâmetros
- **Independência total** entre handlers

## Estrutura de Arquivos

```
ui_runtime/
├── index.html                 # Ponto de entrada HTML
├── init.js                    # Inicializador do sistema
├── runtime_config.js          # Configuração avançada do runtime
├── main.js                    # Interpretador minimalista
├── state_runtime.js           # Gerenciamento de estado
├── theme_runtime.js           # Sistema de temas
├── test_runtime.js            # Sistema de testes
├── dispatcher.logline         # Roteador de operações
├── handlers/                  # Implementações das operações
│   ├── navigate_handler.logline
│   ├── set_state_handler.logline
│   ├── set_theme_handler.logline
│   ├── assert_exists_handler.logline
│   ├── assert_text_handler.logline
│   ├── assert_visible_handler.logline
│   ├── assert_state_handler.logline
│   ├── fetch_data_handler.logline
│   ├── format_data_handler.logline
│   ├── log_handler.logline
│   ├── validate_form_handler.logline
│   ├── update_ui_element_handler.logline
│   ├── alert_handler.logline
│   ├── debug_panel_handler.logline
│   ├── media_handler.logline
│   ├── image_handler.logline
│   ├── data_table_handler.logline
│   ├── file_upload_handler.logline
│   ├── trigger_file_input_handler.logline
│   └── remove_file_handler.logline
├── ui/                        # Arquivos de interface
│   ├── theme_default.logline
│   ├── theme_dark.logline
│   ├── ui_tests.logline
│   └── demo_all_features.logline
```

## Fluxo de Execução

1. O usuário interage com um componente que dispara uma operação
2. O runtime consulta o `dispatcher.logline` para encontrar o handler adequado
3. O handler é carregado e executado, com interpolação de variáveis
4. Operações são executadas sem lógica imperativa no JavaScript

## Como Usar

1. Clone este repositório
2. Use o script `start_demo.sh` para iniciar o servidor local
3. Explore a interface de demonstração

```bash
# Iniciar o servidor
./start_demo.sh

# Acesse a interface no navegador
# http://localhost:8000/index.html
```

### Exemplos de Uso

#### Definição no Dispatcher
```json
[
  {
    "operation": "set_state", 
    "handler": "handlers/set_state_handler.logline"
  },
  {
    "operation": "navigate",
    "handler": "handlers/navigate_handler.logline"
  }
]
```

#### Handler de Navegação
```json
[
  {
    "type": "span",
    "component": "syscall",
    "operation": "load_file",
    "file": "{{action.target}}",
    "target": "main-content"
  }
]
```

#### Uso de Operações
```json
{
  "type": "span", 
  "operation": "navigate",
  "target": "dashboard.logline"
}
```

## Criando Novos Handlers

Para adicionar novas operações ao sistema:

1. Adicione a operação no `dispatcher.logline`:

```json
[
  {
    "operation": "minha_operacao",
    "handler": "handlers/minha_operacao_handler.logline"
  }
]
```

2. Crie um novo handler em `handlers/minha_operacao_handler.logline`:

```json
[
  {
    "type": "span",
    "component": "syscall",
    "operation": "alguma_funcao_do_sistema",
    "param1": "{{action.param1}}",
    "param2": "{{action.param2}}"
  }
]
```

3. Use a operação em seus arquivos `.logline`:

```json
{
  "type": "span",
  "operation": "minha_operacao",
  "param1": "valor1",
  "param2": "valor2"
}
```

## API de Renderização

A função principal para iniciar o runtime é:

```javascript
bootstrapLogLineUI(entryFile);
```

Onde `entryFile` é o caminho para o arquivo `.logline` inicial.

## Layouts Compostos

Você pode definir layouts compostos usando a estrutura:

```json
{
  "type": "layout",
  "layout": {
    "sidebar": {
      "component": "sidebar.logline"
    },
    "main": {
      "component": "content.logline"
    }
  }
}
```

## Componentes Visuais

Os componentes visuais são renderizados diretamente pelo runtime:

```json
[
  {
    "type": "span",
    "component": "text_block",
    "content": "Olá, {{user.name}}",
    "style": {
      "color": "blue",
      "fontSize": "18px"
    }
  },
  {
    "type": "span",
    "component": "button",
    "content": "Clique Aqui",
    "action": {
      "operation": "navigate",
      "target": "outra_pagina.logline"
    }
  }
]
```

## Princípios do Design

- ✅ **Zero dependências** - Nenhum framework externo
- ✅ **100% declarativo** - Toda lógica definida em arquivos `.logline`
- ✅ **Modularidade extrema** - Cada operação é um handler separado
- ✅ **Dispatcher central** - Roteamento unificado de operações
- ✅ **Interpolação transparente** - Variáveis interpoladas em qualquer parte
- ✅ **Reversibilidade total** - Toda operação pode ser analisada e revertida
- ✅ **Auditabilidade** - Fluxo de execução totalmente rastreável

## Vantagens da Arquitetura Dispatcher/Handler

1. **Extensibilidade**: Adicionar novas operações sem modificar o runtime
2. **Depuração facilitada**: Cada handler é um arquivo isolado
3. **Versionamento**: Handlers podem ser atualizados independentemente
4. **Compartilhamento**: Handlers podem ser compartilhados entre projetos
5. **Testabilidade**: Cada handler pode ser testado isoladamente
6. **Documentação**: Autodocumentação pelo arquivo dispatcher

## Sistema de Configuração Avançada

O UI Runtime agora conta com um sistema de configuração avançada e modular:

### runtime_config.js

Arquivo de configuração principal do UI Runtime com as seguintes características:

- **Multi-ambiente**: configurações para development, staging e production
- **Recursos configuráveis**: habilite/desabilite recursos específicos
- **Integrações opcionais**: PostgreSQL, Supabase, Firebase e outros
- **Personalização de UI**: temas, animações, responsividade
- **Performance**: lazy loading, cache, compressão de imagens
- **Segurança**: CSP, sanitização, validação
- **Logging**: níveis, destinos, rotação de logs
- **Internacionalização**: idiomas, formatos de data/hora/número

### init.js

Sistema de inicialização que:

- Carrega configurações na ordem correta
- Inicializa o estado global da UI
- Carrega recursos opcionais conforme necessário
- Gerencia erros de inicialização
- Emite eventos de ciclo de vida da aplicação

### Integração com PostgreSQL (Opcional)

- Movida para pasta própria: `/postgres_integration/`
- Configuração dedicada: `postgres_config.js`
- Ativada via parâmetro de URL: `?db=postgres`

## Próximos Passos

- [x] Criar mais handlers para operações comuns
- [x] Sistema de configuração avançada e modular
- [x] Separação da integração com PostgreSQL
- [ ] Implementar validação de esquema para handlers
- [x] Adicionar mecanismo de cache para handlers
- [ ] Criar ferramenta de inspeção de handlers
- [ ] Desenvolver sistema de versionamento de handlers
- [ ] Implementar sistema de rotas para SPA
- [x] Adicionar suporte a i18n para internacionalização
- [ ] Desenvolver sistema de plugins para extensibilidade

## Licença

Este projeto está licenciado sob a licença MIT.
