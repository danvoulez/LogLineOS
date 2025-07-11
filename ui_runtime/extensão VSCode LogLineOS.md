Aqui está a estrutura técnica consolidada para implementação da extensão VSCode para **LogLineOS**, organizada por módulos com foco em eficiência e integração fluida:

---

### 🏗️ **MÓDULO 1 — INFRAESTRUTURA BÁSICA**  
**1.1. Scaffold do Plugin**  
```bash
# Gerar estrutura inicial
npx yo code logline-extension --typescript
```
- **package.json**:  
  ```json
  "activationEvents": ["onLanguage:logline", "onCommand:logline.runFile"],
  "contributes": {
    "languages": [{
      "id": "logline",
      "extensions": [".logline"],
      "configuration": "./language-configuration.json"
    }],
    "commands": [
      { "command": "logline.runFile", "title": "Run LogLine File" }
    ]
  }
  ```

**1.2. Linguagem `.logline`**  
- **logline.tmLanguage.json**:  
  ```json
  {
    "scopeName": "source.logline",
    "patterns": [
      { "include": "#keywords" },
      { "include": "source.yaml" }
    ],
    "repository": {
      "keywords": {
        "patterns": [{
          "name": "keyword.logline",
          "match": "\\b(type|agent|kernel_action|execution_rule)\\b"
        }]
      }
    }
  }
  ```

---

### 🧠 **MÓDULO 2 — AUTOCOMPLETE & INTELIGÊNCIA**  
**2.1. Schema JSON para Autocomplete**  
```json
// schemas/logline.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "properties": {
    "type": {
      "enum": ["register", "commit", "observe", "..."]
    },
    "kernel_action": {
      "enum": ["log_span", "syscall", "..."]
    }
  }
}
```
- **extension.ts**:  
  ```typescript
  vscode.languages.registerCompletionItemProvider('logline', {
    provideCompletionItems(doc, pos) {
      return [
        new vscode.CompletionItem('type: register', vscode.CompletionItemKind.Enum),
        new vscode.CompletionItem('agent: root', vscode.CompletionItemKind.Constant)
      ];
    }
  });
  ```

---

### ⚙️ **MÓDULO 3 — EXECUÇÃO E SIMULAÇÃO**  
**3.1. Execução em Terminal**  
```typescript
// commands/runFile.ts
export function runLogLineFile() {
  const terminal = vscode.window.createTerminal(`LogLine Runner`);
  terminal.sendText(`logline run ${vscode.window.activeTextEditor?.document.fileName}`);
}
```

**3.2. WebView de Simulação**  
```typescript
// webviews/simulationPanel.ts
const panel = vscode.window.createWebviewPanel('simulation', 'LogLine Sim', vscode.ViewColumn.Beside, {});
panel.webview.html = `<html><body>Simulação carregada...</body></html>`;
```

---

### 🔍 **MÓDULO 4 — UI VISUAL**  
**4.1. Inspector de Spans (TreeView)**  
```typescript
// providers/spanTreeDataProvider.ts
export class SpanTreeProvider implements vscode.TreeDataProvider<SpanItem> {
  getChildren(element?: SpanItem): vscode.ProviderResult<SpanItem[]> {
    return parseLogLineFile().map(span => new SpanItem(span.type, span.id));
  }
}
```

---

### 🧪 **MÓDULO 5 — TESTES**  
**5.1. Validação em Tempo Real**  
```typescript
// diagnostics/loglineLinter.ts
vscode.workspace.onDidSaveTextDocument(doc => {
  if (doc.languageId === 'logline') {
    const diagnostics = validateLogLine(doc.getText());
    vscode.languages.createDiagnosticCollection('logline').set(doc.uri, diagnostics);
  }
});
```

---

### 🔐 **MÓDULO 7 — SEGURANÇA**  
**7.1. Detecção de Riscos**  
```typescript
// security/riskDetector.ts
const riskyPatterns = /(syscall|agent:\s*root)/;
if (riskyPatterns.test(doc.getText())) {
  vscode.window.showWarningMessage('Span de alto risco detectado!');
}
```

---

### 🧬 **MÓDULO 9 — WASM**  
**9.1. Execução de Enzimas**  
```typescript
// wasm/executor.ts
import { instantiate } from '@wasmer/wasi';
const wasmBuffer = fs.readFileSync('enzima.wasm');
const instance = await instantiate(wasmBuffer);
instance.exports.main();
```

---

### 📦 **Estrutura Final do Projeto**  
```
logline-extension/
├── src/
│   ├── commands/          # Comandos (run, simulate)
│   ├── providers/         # TreeViews, Completion
│   ├── webviews/          # Painéis de UI
│   ├── diagnostics/       # Linters
│   └── extension.ts       # Entry point
├── schemas/               # JSON Schema
├── syntaxes/              # Gramática TM
├── package.json           # Manifesto
└── tsconfig.json
```

---

### 🔑 **Principais Dependências**  
```json
"dependencies": {
  "@wasmer/wasi": "^1.2.1",
  "js-yaml": "^4.1.0",
  "vscode-languageclient": "^8.1.0"
}
```

### ⚠️ **Checklist Crítico**  
1. **Registro de Comandos** em `activationEvents`  
2. **Suporte a Multi-root Workspaces**  
3. **Cache de Schema** para performance  
4. **Sandbox para WASM** com limites de memória  
5. **Hot-Reload** para previews de UI  

Essa estrutura garante:  
- ✔️ **Isolamento de módulos**  
- ✔️ **Baixo acoplamento**  
- ✔️ **Extensibilidade** para novos recursos  
- ✔️ **Compatibilidade** com o ecossistema VSCode  

Para iniciar o desenvolvimento:  
```bash
npm install
code .
```
Use **F5** para debug imediato!