/**
 * LogLine UI Runtime - State Module
 * 
 * Implementa funcionalidades de reatividade simbólica para spans
 * permitindo leitura e escrita de estado (state) de forma declarativa.
 * 
 * Versão: 1.0.0
 * Data: 11/07/2025
 * LogLineOS - Sistema Operacional Declarativo
 */

/**
 * Manipula um span do tipo set_state
 * @param {Object} span - O span contendo a operação set_state
 * @param {HTMLElement} container - O container DOM onde o span será renderizado
 * @returns {HTMLElement} - Elemento DOM para o span (vazio)
 */
function handleSetState(span, container) {
  if (!span.key) {
    console.error('❌ Erro ao executar set_state: propriedade key é obrigatória', span);
    return renderFallback(span, container);
  }

  let value = span.value;
  
  // Se o valor for uma string, verificar se é uma referência a um caminho no estado
  if (typeof value === 'string' && value.startsWith('$')) {
    const statePath = value.substring(1);
    value = getValueByPath(window.uiState, statePath);
  }
  
  // Interpolar valor se for uma string com placeholders
  if (typeof value === 'string' && value.includes('{{')) {
    value = interpolate(value, window.uiState);
  }
  
  // Definir o valor no estado
  setValueByPath(window.uiState, span.key, value);
  
  // Notificar a mudança de estado
  triggerStateUpdate();
  
  logToConsole(`🔄 Estado atualizado: ${span.key} = ${JSON.stringify(value)}`, 'info');
  
  // Criar um elemento invisível para representar o span no DOM
  const element = document.createElement('span');
  element.style.display = 'none';
  element.dataset.stateOperation = 'set_state';
  element.dataset.stateKey = span.key;
  
  container.appendChild(element);
  return element;
}

/**
 * Manipula um span do tipo get_state
 * @param {Object} span - O span contendo a operação get_state
 * @param {HTMLElement} container - O container DOM onde o span será renderizado
 * @returns {HTMLElement} - Elemento DOM para o span (pode conter valor renderizado)
 */
function handleGetState(span, container) {
  if (!span.key) {
    console.error('❌ Erro ao executar get_state: propriedade key é obrigatória', span);
    return renderFallback(span, container);
  }
  
  // Obter o valor do estado
  const value = getValueByPath(window.uiState, span.key);
  
  // Criar elemento para representar o span
  const element = document.createElement(span.tag || 'div');
  element.dataset.stateOperation = 'get_state';
  element.dataset.stateKey = span.key;
  element.className = 'state-value ' + (span.className || '');
  
  // Se assign_to estiver definido, armazenar o valor em outro caminho do estado
  if (span.assign_to) {
    setValueByPath(window.uiState, span.assign_to, value);
    triggerStateUpdate();
    
    // Para assign_to, o span é invisível
    element.style.display = 'none';
  } else {
    // Se não for assign_to, renderizar o valor
    if (value !== null && value !== undefined) {
      // Renderizar de acordo com o tipo de dado
      if (typeof value === 'object') {
        element.textContent = JSON.stringify(value);
      } else {
        element.textContent = String(value);
      }
    } else {
      element.textContent = span.fallback || '';
    }
    
    // Aplicar estilos se fornecidos
    if (span.tokens) {
      applyTokensToElement(element, span.tokens);
    }
  }
  
  // Registrar observador para atualizar quando o estado mudar
  document.addEventListener('uiStateUpdated', () => {
    const updatedValue = getValueByPath(window.uiState, span.key);
    
    if (span.assign_to) {
      setValueByPath(window.uiState, span.assign_to, updatedValue);
    } else if (element) {
      if (typeof updatedValue === 'object') {
        element.textContent = JSON.stringify(updatedValue);
      } else {
        element.textContent = updatedValue !== null && updatedValue !== undefined
          ? String(updatedValue)
          : (span.fallback || '');
      }
    }
  });
  
  container.appendChild(element);
  return element;
}

/**
 * Aplica tokens CSS a um elemento
 * Versão melhorada que suporta variáveis CSS
 * @param {HTMLElement} element - O elemento DOM a receber os tokens
 * @param {Object} tokens - Os tokens CSS a serem aplicados
 */
function applyTokensToElement(element, tokens) {
  if (!tokens || typeof tokens !== 'object') {
    return;
  }
  
  for (const [property, value] of Object.entries(tokens)) {
    // Converter camel_case para camelCase para propriedades CSS
    const cssProp = property.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    
    // Interpolar valor se for string
    const finalValue = typeof value === 'string' ? interpolate(value, window.uiState) : value;
    
    element.style[cssProp] = finalValue;
  }
}
