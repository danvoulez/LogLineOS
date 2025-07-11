/**
 * LogLine UI Runtime - Theming Module
 * 
 * Implementa funcionalidades de temas e tokens visuais para spans
 * permitindo aplicação de temas dinâmicos a partir de arquivos .logline.
 * 
 * Versão: 1.0.0
 * Data: 11/07/2025
 * LogLineOS - Sistema Operacional Declarativo
 */

// Cache de temas carregados
const themeCache = new Map();

/**
 * Manipula um span do tipo set_theme
 * @param {Object} span - O span contendo a operação set_theme
 * @param {HTMLElement} container - O container DOM onde o span será renderizado
 * @returns {Promise<HTMLElement>} - Elemento DOM para o span (vazio)
 */
async function handleSetTheme(span, container) {
  if (!span.theme) {
    console.error('❌ Erro ao executar set_theme: propriedade theme é obrigatória', span);
    return renderFallback(span, container);
  }

  try {
    // Carregar os tokens do tema
    const themeTokens = await loadTheme(span.theme);
    
    // Aplicar os tokens ao DOM
    applyThemeToDOM(themeTokens);
    
    // Atualizar o tema no estado para outros componentes usarem
    window.uiState.app.currentTheme = span.theme;
    window.uiState.app.themeTokens = themeTokens;
    triggerStateUpdate();
    
    logToConsole(`🎨 Tema aplicado: ${span.theme}`, 'info');
    
    // Criar um elemento invisível para representar o span no DOM
    const element = document.createElement('span');
    element.style.display = 'none';
    element.dataset.themeOperation = 'set_theme';
    element.dataset.themePath = span.theme;
    
    container.appendChild(element);
    return element;
  } catch (error) {
    console.error(`❌ Erro ao carregar tema ${span.theme}:`, error);
    return renderFallback({
      ...span,
      error: error.message
    }, container);
  }
}

/**
 * Carrega um arquivo de tema .logline
 * @param {string} themePath - Caminho para o arquivo de tema
 * @returns {Promise<Array>} - Array de tokens do tema
 */
async function loadTheme(themePath) {
  // Verificar se o tema já está em cache
  if (themeCache.has(themePath)) {
    return themeCache.get(themePath);
  }
  
  try {
    const themeData = await loadLogLineFile(themePath);
    
    if (!Array.isArray(themeData)) {
      throw new Error(`Arquivo de tema ${themePath} não contém um array válido`);
    }
    
    // Validar formato dos tokens
    const tokens = themeData.filter(token => 
      token.type === 'token' && 
      typeof token.name === 'string' && 
      token.value !== undefined
    );
    
    if (tokens.length === 0) {
      throw new Error(`Arquivo de tema ${themePath} não contém tokens válidos`);
    }
    
    // Armazenar em cache
    themeCache.set(themePath, tokens);
    
    return tokens;
  } catch (error) {
    console.error(`❌ Erro ao carregar tema ${themePath}:`, error);
    throw error;
  }
}

/**
 * Aplica tokens de tema ao DOM como variáveis CSS
 * @param {Array} themeTokens - Array de tokens do tema
 */
function applyThemeToDOM(themeTokens) {
  // Criar ou obter o elemento de estilos para variáveis CSS
  let styleElement = document.getElementById('logline-theme-variables');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'logline-theme-variables';
    document.head.appendChild(styleElement);
  }
  
  // Construir as variáveis CSS
  let cssVariables = ':root {\n';
  
  themeTokens.forEach(token => {
    cssVariables += `  --${token.name}: ${token.value};\n`;
  });
  
  cssVariables += '}\n';
  
  // Aplicar ao elemento de estilo
  styleElement.textContent = cssVariables;
  
  // Aplicar ao atributo data-theme no body se houver um token theme_name
  const themeNameToken = themeTokens.find(token => token.name === 'theme_name');
  if (themeNameToken) {
    document.body.setAttribute('data-theme', themeNameToken.value);
  }
}

/**
 * Cria um token .logline para um tema
 * @param {string} themePath - Caminho para salvar o arquivo de tema
 * @param {Array} tokens - Array de tokens para o tema
 */
async function createThemeFile(themePath, tokens) {
  try {
    // Validar tokens
    if (!Array.isArray(tokens) || tokens.length === 0) {
      throw new Error('Array de tokens vazio ou inválido');
    }
    
    // Garantir que cada token tem formato correto
    const validTokens = tokens.map(token => ({
      type: 'token',
      name: token.name,
      value: token.value
    }));
    
    // Converter para JSON formatado
    const themeContent = JSON.stringify(validTokens, null, 2);
    
    // Aqui você implementaria a lógica para salvar em um arquivo
    // Como estamos em ambiente browser, vamos simular isso
    console.log(`Seria salvo em ${themePath}:\n${themeContent}`);
    
    // Se estivéssemos em um ambiente Node.js, seria algo como:
    // await fs.writeFile(themePath, themeContent, 'utf8');
    
    // Atualizar cache
    themeCache.set(themePath, validTokens);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar arquivo de tema ${themePath}:`, error);
    throw error;
  }
}
