/**
 * LogLine UI Runtime
 * 
 * Interpretador minimalista de arquivos .logline para renderização de interfaces web
 * com uma abordagem 100% declarativa usando o padrão dispatcher/handler.
 * 
 * Versão: 4.0.0
 * Data: 11/07/2025
 * LogLineOS - Sistema Operacional Declarativo
 */

// Importar módulos específicos
document.write('<script src="state_runtime.js"></script>');
document.write('<script src="theme_runtime.js"></script>');
document.write('<script src="test_runtime.js"></script>');

// Cache para evitar carregar o mesmo arquivo várias vezes
const logLineCache = new Map();

// Verificar se o estado global já foi inicializado
if (!window.uiState) {
  // Estado global da UI (será substituído pelo init.js se já estiver carregado)
  window.uiState = {
    app: {
      currentPage: null,
      isAuthenticated: false,
      debug: false,
      theme: 'light',
      initialized: true
    },
    user: {
      name: '',
      email: '',
      preferences: {}
    },
    form: {},
    data: {},
    alerts: [],
    config: window.RUNTIME_CONFIG?.ACTIVE || {}
  };

  console.log('⚠️ Estado global inicializado em main.js (init.js não detectado)');
} else {
  console.log('✅ Estado global já inicializado por init.js');
}

/**
 * Função principal que inicia o runtime LogLine UI
 * @param {string} entryFile - Caminho para o arquivo .logline inicial
 */
async function bootstrapLogLineUI(entryFile) {
  try {
    console.log(`🚀 Inicializando LogLine UI Runtime com ${entryFile}`);
    
    // Elementos principais do layout
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Carregar o layout principal
    const mainLayout = await loadLogLineFile(entryFile);
    
    if (!mainLayout || !Array.isArray(mainLayout)) {
      throw new Error(`Arquivo principal não contém um array válido de spans: ${entryFile}`);
    }
    
    // Processar layout principal para encontrar definições de layout
    const layoutDefinition = findLayoutDefinition(mainLayout);
    
    // Limpar containers
    sidebar.innerHTML = '';
    mainContent.innerHTML = '';
    
    if (layoutDefinition) {
      console.log('📐 Layout composto encontrado, processando...');
      await renderCompositeLayout(layoutDefinition, sidebar, mainContent);
    } else {
      console.log('📄 Layout simples encontrado, renderizando spans diretamente...');
      // Se não houver definição de layout, renderizar todos os spans no conteúdo principal
      await renderSpans(mainLayout, mainContent);
    }
    
    console.log('✅ LogLine UI Runtime inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar LogLine UI:', error);
    showErrorInUI('Falha ao inicializar a interface', error, mainContent || document.body);
  }
}

/**
 * Procura por uma definição de layout em um array de spans
 * @param {Array} spans - Array de spans a serem analisados
 * @return {Object|null} Definição de layout ou null se não encontrado
 */
function findLayoutDefinition(spans) {
  const layoutSpan = spans.find(span => 
    span.type === 'layout' || 
    (span.type === 'span' && span.component === 'layout') ||
    span.layout
  );
  
  if (layoutSpan) {
    return layoutSpan.layout || layoutSpan;
  }
  
  return null;
}

/**
 * Renderiza um layout composto com sidebar e conteúdo principal
 * @param {Object} layoutDefinition - Definição do layout composto
 * @param {HTMLElement} sidebarContainer - Container para a sidebar
 * @param {HTMLElement} mainContainer - Container para o conteúdo principal
 */
async function renderCompositeLayout(layoutDefinition, sidebarContainer, mainContainer) {
  try {
    // Renderizar sidebar se definido
    if (layoutDefinition.sidebar && layoutDefinition.sidebar.component) {
      const sidebarSpans = await loadLogLineFile(layoutDefinition.sidebar.component);
      if (Array.isArray(sidebarSpans)) {
        await renderSpans(sidebarSpans, sidebarContainer);
      }
    }
    
    // Renderizar conteúdo principal se definido
    if (layoutDefinition.main && layoutDefinition.main.component) {
      const mainSpans = await loadLogLineFile(layoutDefinition.main.component);
      if (Array.isArray(mainSpans)) {
        await renderSpans(mainSpans, mainContainer);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao renderizar layout composto:', error);
    showErrorInUI('Falha ao renderizar layout', error, mainContainer);
  }
}

/**
 * Carrega um arquivo .logline e retorna seu conteúdo parseado
 * @param {string} filePath - Caminho para o arquivo .logline
 * @param {boolean} useCache - Se deve usar o cache (default: true)
 * @return {Promise<Array|Object>} Conteúdo do arquivo parseado
 */
async function loadLogLineFile(filePath, useCache = true) {
  // Verificar se o arquivo já está em cache e se o cache deve ser usado
  if (useCache && logLineCache.has(filePath)) {
    const cached = logLineCache.get(filePath);
    const now = Date.now();
    const cacheTTL = window.RUNTIME_CONFIG?.ACTIVE?.DISPATCHER?.HANDLER_CACHE_TTL || 3600;
    
    // Verificar se o cache ainda é válido
    if (!cached.timestamp || now - cached.timestamp < cacheTTL * 1000) {
      console.log(`📁 Usando versão em cache de ${filePath}`);
      return cached.data;
    } else {
      console.log(`📁 Cache expirado para ${filePath}, recarregando...`);
    }
  }
  
  try {
    console.log(`📁 Carregando arquivo ${filePath}`);
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const content = await response.text();
    let parsed;
    
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Falha ao parsear arquivo ${filePath}: ${parseError.message}`);
    }
    
    // Armazenar em cache com timestamp
    if (useCache) {
      logLineCache.set(filePath, {
        data: parsed,
        timestamp: Date.now()
      });
    }
    
    return parsed;
  } catch (error) {
    console.error(`❌ Erro ao carregar ${filePath}:`, error);
    throw error;
  }
}

/**
 * Valida um handler para garantir que ele seja válido
 * @param {Array} handler - Handler a ser validado
 * @param {string} operation - Nome da operação
 */
function validateHandler(handler, operation) {
  if (!Array.isArray(handler)) {
    throw new Error(`Handler inválido para operação ${operation}: não é um array`);
  }
  
  // Verificar se há pelo menos um span
  if (handler.length === 0) {
    throw new Error(`Handler vazio para operação ${operation}`);
  }
  
  // Verificar se todos os spans têm tipo
  for (let i = 0; i < handler.length; i++) {
    const span = handler[i];
    if (!span.type) {
      throw new Error(`Span inválido no handler ${operation} (índice ${i}): tipo não especificado`);
    }
  }
}

/**
 * Renderiza um array de spans em um container
 * @param {Array} spans - Array de spans a serem renderizados
 * @param {HTMLElement} container - Container onde os spans serão renderizados
 */
async function renderSpans(spans, container) {
  if (!Array.isArray(spans)) {
    console.error('❌ renderSpans esperava um array:', spans);
    showErrorInUI('Formato inválido', new Error('Spans deve ser um array'), container);
    return;
  }
  
  for (const span of spans) {
    await renderSpan(span, container);
  }
}

/**
 * Renderiza um único span em um container
 * @param {Object} span - Span a ser renderizado
 * @param {HTMLElement} container - Container onde o span será renderizado
 */
async function renderSpan(span, container) {
  try {
    if (!span || typeof span !== 'object') {
      throw new Error('Span inválido');
    }
    
    // Verificar condições if/visible_if
    if (span.if !== undefined) {
      const shouldRender = evaluateCondition(span.if, window.uiState);
      if (!shouldRender) {
        // Condição falsa, não renderizar
        console.debug(`Span ignorado por condição 'if': ${JSON.stringify(span.if)}`);
        return null;
      }
    }
    
    if (span.visible_if !== undefined) {
      const isVisible = evaluateCondition(span.visible_if, window.uiState);
      if (!isVisible) {
        // Criar elemento oculto
        const hiddenElement = document.createElement('div');
        hiddenElement.style.display = 'none';
        hiddenElement.dataset.hiddenByCondition = true;
        container.appendChild(hiddenElement);
        console.debug(`Span oculto por condição 'visible_if': ${JSON.stringify(span.visible_if)}`);
        return hiddenElement;
      }
    }
    
    // Usar o dispatcher para encaminhar para o handler correto
    if (span.operation) {
      await handleOperationViaDispatcher(span, container);
      return;
    }
    
    // Renderizar componente de UI
    await renderUIComponent(span, container);
    
  } catch (error) {
    console.error('❌ Erro ao renderizar span:', error, span);
    showErrorInUI('Erro ao renderizar componente', error, container);
  }
}

/**
 * Encaminha uma operação através do dispatcher
 * @param {Object} span - Span com a operação a ser executada
 * @param {HTMLElement} container - Container onde os resultados serão renderizados
 */
async function handleOperationViaDispatcher(span, container) {
  try {
    console.log(`🔄 Processando operação: ${span.operation}`);
    
    // Determinar caminho do dispatcher com base na configuração
    const dispatcherPath = window.RUNTIME_CONFIG?.ACTIVE?.DISPATCHER?.PATH || 'dispatcher.logline';
    
    // Carregar o dispatcher
    const dispatcher = await loadLogLineFile(dispatcherPath);
    
    if (!Array.isArray(dispatcher)) {
      throw new Error(`O arquivo ${dispatcherPath} não contém um array válido`);
    }
    
    // Encontrar o handler correto para a operação
    const handlerEntry = dispatcher.find(entry => entry.operation === span.operation);
    
    if (!handlerEntry || !handlerEntry.handler) {
      throw new Error(`Handler não encontrado para operação: ${span.operation}`);
    }
    
    // Determinar caminho base dos handlers com base na configuração
    const handlersBasePath = window.RUNTIME_CONFIG?.ACTIVE?.DISPATCHER?.HANDLERS_PATH || '';
    
    // Carregar o handler
    const handlerFile = handlerEntry.handler.startsWith(handlersBasePath) ? 
      handlerEntry.handler : 
      `${handlersBasePath}${handlerEntry.handler}`;
      
    // Verificar se deve usar cache para handlers
    const useHandlerCache = window.RUNTIME_CONFIG?.ACTIVE?.DISPATCHER?.HANDLER_CACHE !== false;
    
    // Carregar o handler (com ou sem cache)
    const handler = await loadLogLineFile(handlerFile, useHandlerCache);
    
    if (!Array.isArray(handler)) {
      throw new Error(`O handler ${handlerFile} não contém um array válido`);
    }
    
    // Validar handler se configurado
    if (window.RUNTIME_CONFIG?.ACTIVE?.DISPATCHER?.VALIDATE_HANDLERS) {
      validateHandler(handler, span.operation);
    }
    
    // Criar um contexto para o handler com a ação atual
    const context = {
      action: span
    };
    
    // Executar o handler com o contexto
    console.log(`⚡ Executando handler: ${handlerFile}`);
    
    // Renderizar os spans do handler com interpolação de variáveis
    for (const handlerSpan of handler) {
      // Criar uma cópia do span com variáveis interpoladas
      const processedSpan = JSON.parse(JSON.stringify(handlerSpan));
      
      // Interpolar todas as strings no span com o contexto
      interpolateSpanStrings(processedSpan, context);
      
      // Renderizar o span processado
      await renderSpan(processedSpan, container);
    }
    
    console.log(`✅ Operação ${span.operation} concluída`);
    
  } catch (error) {
    console.error(`❌ Erro ao executar operação ${span.operation}:`, error);
    showErrorInUI(`Falha ao executar operação ${span.operation}`, error, container);
  }
}

/**
 * Renderiza um componente de UI
 * @param {Object} span - Span do componente a ser renderizado
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
async function renderUIComponent(span, container) {
  try {
    const componentType = span.component || span.type;
    
    if (!componentType) {
      throw new Error('Tipo de componente não especificado');
    }
    
    console.log(`🎨 Renderizando componente: ${componentType}`);
    
    // Componentes básicos
    switch (componentType) {
      case 'text_block':
        renderTextBlock(span, container);
        break;
        
      case 'input_box':
        renderInputBox(span, container);
        break;
        
      case 'button':
        renderButton(span, container);
        break;
        
      case 'container':
        await renderContainer(span, container);
        break;
        
      case 'include':
        await renderInclude(span, container);
        break;
        
      default:
        // Para componentes desconhecidos, carregar um handler específico
        await renderUnknownComponent(componentType, span, container);
    }
  } catch (error) {
    console.error(`❌ Erro ao renderizar componente ${span.component || span.type}:`, error);
    renderFallback(span, container);
  }
}

/**
 * Tenta renderizar um componente desconhecido carregando um handler específico
 * @param {string} componentType - Tipo do componente
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
async function renderUnknownComponent(componentType, span, container) {
  try {
    // Tentar carregar um handler específico para o componente
    const handlerFile = `handlers/${componentType}_handler.logline`;
    const handler = await loadLogLineFile(handlerFile);
    
    if (Array.isArray(handler)) {
      // Criar um contexto para o handler com o span atual
      const context = {
        component: span
      };
      
      // Executar o handler com o contexto
      for (const handlerSpan of handler) {
        // Criar uma cópia do span com variáveis interpoladas
        const processedSpan = JSON.parse(JSON.stringify(handlerSpan));
        
        // Interpolar todas as strings no span com o contexto
        interpolateSpanStrings(processedSpan, context);
        
        // Renderizar o span processado
        await renderSpan(processedSpan, container);
      }
      
      return;
    }
    
    throw new Error(`Handler não encontrado para componente: ${componentType}`);
  } catch (error) {
    console.error(`❌ Erro ao carregar handler para ${componentType}:`, error);
    renderFallback(span, container);
  }
}

/**
 * Interpola todas as strings em um span com valores do contexto
 * @param {Object} span - Span a ser processado
 * @param {Object} context - Contexto com valores para interpolação
 */
function interpolateSpanStrings(span, context) {
  for (const key in span) {
    if (typeof span[key] === 'string') {
      span[key] = interpolate(span[key], context);
    } else if (typeof span[key] === 'object' && span[key] !== null) {
      interpolateSpanStrings(span[key], context);
    }
  }
}

/**
 * Interpola variáveis em uma string com valores do contexto
 * @param {string} template - String com placeholders {{variável}}
 * @param {Object} context - Contexto com valores para interpolação
 * @returns {string} String interpolada
 */
function interpolate(template, context) {
  if (!template || typeof template !== 'string') {
    return template;
  }
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    // Remover espaços em branco
    const trimmedPath = path.trim();
    
    // Obter valor pelo caminho
    const value = getValueByPath(context, trimmedPath);
    
    // Retornar valor ou string vazia se for undefined/null
    return value !== undefined && value !== null ? value : '';
  });
}

/**
 * Obtém um valor de um objeto pelo caminho (path)
 * @param {Object} obj - Objeto a ser consultado
 * @param {string} path - Caminho para o valor (ex: "user.preferences.theme")
 * @returns {*} Valor encontrado ou undefined
 */
function getValueByPath(obj, path) {
  if (!obj || !path) {
    return undefined;
  }
  
  // Se o caminho já for um array, usá-lo diretamente
  const parts = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Verificar se o caminho existe
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    
    current = current[part];
  }
  
  return current;
}

/**
 * Define um valor em um objeto pelo caminho (path)
 * @param {Object} obj - Objeto a ser modificado
 * @param {string} path - Caminho para o valor (ex: "user.preferences.theme")
 * @param {*} value - Valor a ser definido
 */
function setValueByPath(obj, path, value) {
  if (!obj || !path) {
    return;
  }
  
  // Se o caminho já for um array, usá-lo diretamente
  const parts = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  // Percorrer todos os níveis exceto o último
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    // Criar o caminho se não existir
    if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  // Definir o valor no último nível
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

/**
 * Emite evento de atualização do estado
 */
function triggerStateUpdate() {
  const event = new CustomEvent('uiStateUpdated', {
    detail: { timestamp: Date.now() }
  });
  
  document.dispatchEvent(event);
}

/**
 * Renderiza um componente de texto
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
function renderTextBlock(span, container) {
  const textBlock = document.createElement('div');
  textBlock.className = 'text-block';
  
  // Interpolar conteúdo com variáveis
  const content = span.content || '';
  textBlock.textContent = interpolate(content, window.uiState);
  
  // Aplicar estilo
  if (span.style) {
    applyStyles(textBlock, span.style);
  }
  
  container.appendChild(textBlock);
  return textBlock;
}

/**
 * Renderiza um componente de entrada de texto
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
function renderInputBox(span, container) {
  const input = document.createElement('input');
  input.className = 'input-box';
  input.type = span.inputType || 'text';
  
  // Interpolar placeholder com variáveis
  if (span.prompt) {
    input.placeholder = interpolate(span.prompt, window.uiState);
  }
  
  // Vincular ao estado se tiver um nome
  if (span.name) {
    input.name = span.name;
    const path = span.statePath || `form.${span.name}`;
    
    // Definir valor inicial do estado
    const value = getValueByPath(window.uiState, path) || span.value || '';
    input.value = value;
    
    // Atualizar estado quando o valor mudar
    input.addEventListener('input', (event) => {
      setValueByPath(window.uiState, path, event.target.value);
      triggerStateUpdate();
    });
  } else if (span.value) {
    input.value = span.value;
  }
  
  // Aplicar estilo
  if (span.style) {
    applyStyles(input, span.style);
  }
  
  // Adicionar ação se definida
  if (span.action) {
    input.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        // Criar um span de operação a partir da ação
        const operationSpan = {
          type: 'span',
          operation: span.action.operation,
          ...span.action
        };
        
        await handleOperationViaDispatcher(operationSpan, container);
      }
    });
  }
  
  container.appendChild(input);
  return input;
}

/**
 * Renderiza um componente de botão
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
function renderButton(span, container) {
  const button = document.createElement('button');
  button.className = 'button';
  
  // Interpolar label com variáveis
  const label = span.label || span.content || 'Botão';
  button.textContent = interpolate(label, window.uiState);
  
  // Aplicar estilo
  if (span.style) {
    applyStyles(button, span.style);
  }
  
  // Adicionar ação se definida
  if (span.action) {
    button.addEventListener('click', async () => {
      // Criar um span de operação a partir da ação
      const operationSpan = {
        type: 'span',
        operation: span.action.operation,
        ...span.action
      };
      
      await handleOperationViaDispatcher(operationSpan, container);
    });
  }
  
  container.appendChild(button);
  return button;
}

/**
 * Renderiza um componente de container
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
async function renderContainer(span, container) {
  const containerElement = document.createElement('div');
  containerElement.className = 'container';
  
  // Aplicar estilo
  if (span.style) {
    applyStyles(containerElement, span.style);
  }
  
  container.appendChild(containerElement);
  
  // Renderizar filhos
  if (span.children && Array.isArray(span.children)) {
    await renderSpans(span.children, containerElement);
  }
  
  return containerElement;
}

/**
 * Renderiza um componente de inclusão
 * @param {Object} span - Span do componente
 * @param {HTMLElement} container - Container onde o componente será renderizado
 */
async function renderInclude(span, container) {
  try {
    if (!span.source) {
      throw new Error('Span de inclusão sem fonte definida');
    }
    
    const spans = await loadLogLineFile(span.source);
    
    if (!Array.isArray(spans)) {
      throw new Error('Arquivo incluído não contém um array de spans válido');
    }
    
    await renderSpans(spans, container);
    
  } catch (error) {
    console.error('❌ Erro ao incluir arquivo:', error);
    showErrorInUI(`Falha ao incluir ${span.source}`, error, container);
  }
}

/**
 * Avalia uma condição com base no estado atual
 * @param {string|Object|Array} conditionExpr - Expressão de condição
 * @param {Object} state - Estado atual
 * @returns {boolean} Resultado da avaliação
 */
function evaluateCondition(conditionExpr, state) {
  try {
    // Implementação básica para suportar condições simples
    if (typeof conditionExpr === 'string') {
      return Boolean(getValueByPath(state, conditionExpr));
    }
    
    if (typeof conditionExpr === 'boolean') {
      return conditionExpr;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao avaliar condição:', error, conditionExpr);
    return false;
  }
}

/**
 * Renderiza um fallback visual para um span desconhecido ou inválido
 * @param {Object} span - Span desconhecido ou inválido
 * @param {HTMLElement} container - Container onde o fallback será renderizado
 */
function renderFallback(span, container) {
  const fallback = document.createElement('div');
  fallback.className = 'fallback-container';
  fallback.style.padding = '8px';
  fallback.style.margin = '8px 0';
  fallback.style.border = '1px dashed #ff6b6b';
  fallback.style.borderRadius = '4px';
  fallback.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
  
  const title = document.createElement('div');
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '4px';
  title.textContent = `Componente não suportado: ${span.component || span.type || 'desconhecido'}`;
  
  const details = document.createElement('pre');
  details.style.fontSize = '12px';
  details.style.margin = '0';
  details.style.overflow = 'auto';
  details.style.maxHeight = '100px';
  details.textContent = JSON.stringify(span, null, 2);
  
  fallback.appendChild(title);
  fallback.appendChild(details);
  container.appendChild(fallback);
}

/**
 * Aplica estilos CSS a um elemento
 * @param {HTMLElement} element - Elemento a receber os estilos
 * @param {Object} styles - Objeto com os estilos a serem aplicados
 */
function applyStyles(element, styles) {
  if (!styles || typeof styles !== 'object') {
    return;
  }
  
  for (const [property, value] of Object.entries(styles)) {
    element.style[property] = value;
  }
}

/**
 * Exibe uma mensagem de erro na UI
 * @param {string} message - Mensagem de erro
 * @param {Error} error - Objeto de erro
 * @param {HTMLElement} container - Container onde o erro será exibido
 */
function showErrorInUI(message, error, container) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-container';
  errorContainer.style.padding = '12px';
  errorContainer.style.margin = '12px 0';
  errorContainer.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
  errorContainer.style.border = '1px solid #e74c3c';
  errorContainer.style.borderRadius = '4px';
  errorContainer.style.color = '#c0392b';
  
  const errorTitle = document.createElement('div');
  errorTitle.style.fontWeight = 'bold';
  errorTitle.style.marginBottom = '8px';
  errorTitle.textContent = message;
  
  const errorDetail = document.createElement('div');
  errorDetail.style.fontSize = '14px';
  errorDetail.textContent = error.message || 'Erro desconhecido';
  
  const errorStack = document.createElement('pre');
  errorStack.style.fontSize = '12px';
  errorStack.style.marginTop = '8px';
  errorStack.style.whiteSpace = 'pre-wrap';
  errorStack.style.display = 'none';
  errorStack.textContent = error.stack || '';
  
  // Botão para expandir/colapsar stack trace
  const toggleButton = document.createElement('button');
  toggleButton.style.fontSize = '12px';
  toggleButton.style.marginTop = '8px';
  toggleButton.style.padding = '4px 8px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.textContent = 'Mostrar detalhes';
  
  toggleButton.addEventListener('click', () => {
    if (errorStack.style.display === 'none') {
      errorStack.style.display = 'block';
      toggleButton.textContent = 'Ocultar detalhes';
    } else {
      errorStack.style.display = 'none';
      toggleButton.textContent = 'Mostrar detalhes';
    }
  });
  
  errorContainer.appendChild(errorTitle);
  errorContainer.appendChild(errorDetail);
  errorContainer.appendChild(toggleButton);
  errorContainer.appendChild(errorStack);
  container.appendChild(errorContainer);
}

// Exporte as funções para uso global
window.bootstrapLogLineUI = bootstrapLogLineUI;
window.loadLogLineFile = loadLogLineFile;
window.renderSpan = renderSpan;
window.handleOperationViaDispatcher = handleOperationViaDispatcher;
