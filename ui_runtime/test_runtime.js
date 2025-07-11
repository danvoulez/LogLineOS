/**
 * LogLine UI Runtime - Test Module
 * 
 * Implementa funcionalidades de testes assertivos para spans,
 * permitindo validações declarativas da UI em tempo de execução.
 * 
 * Versão: 1.0.0
 * Data: 11/07/2025
 * LogLineOS - Sistema Operacional Declarativo
 */

// Armazena resultados de testes para relatórios
const testResults = [];

/**
 * Executa um span de teste
 * @param {Object} span - O span contendo a operação de teste
 * @param {HTMLElement} container - O container DOM onde o span será renderizado
 * @returns {HTMLElement} - Elemento DOM para o span
 */
function executeTestSpan(span, container) {
  if (!span.operation || !span.operation.startsWith('assert_')) {
    console.error('❌ Erro ao executar teste: operação inválida', span);
    return renderFallback(span, container);
  }
  
  const operation = span.operation;
  const testId = span.test_id || `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  let result = {
    test_id: testId,
    operation,
    selector: span.selector,
    expected: span.expected,
    timestamp: new Date().toISOString(),
    success: false,
    message: ''
  };
  
  try {
    // Executar o teste com base na operação
    switch (operation) {
      case 'assert_exists':
        result = assertExists(span, result);
        break;
        
      case 'assert_visible':
        result = assertVisible(span, result);
        break;
        
      case 'assert_text':
        result = assertText(span, result);
        break;
        
      case 'assert_value':
        result = assertValue(span, result);
        break;
        
      case 'assert_state':
        result = assertState(span, result);
        break;
        
      default:
        result.message = `Operação de teste não suportada: ${operation}`;
    }
  } catch (error) {
    result.success = false;
    result.message = error.message;
    result.error = error.stack;
  }
  
  // Armazenar resultado
  testResults.push(result);
  
  // Salvar em arquivo JSONL se configurado
  if (window.ENV?.FEATURES?.testResultsOutput) {
    appendTestResultToFile(result);
  }
  
  // Criar elemento para representar o resultado do teste
  const element = document.createElement('div');
  element.className = `test-result test-${result.success ? 'success' : 'failure'}`;
  element.style.display = 'none';
  element.dataset.testId = testId;
  element.dataset.testOperation = operation;
  
  // Se estamos em modo debug, mostrar o resultado visualmente
  if (window.uiState.app.debug) {
    const visualResult = createVisualTestResult(result);
    container.appendChild(visualResult);
  } else {
    container.appendChild(element);
  }
  
  return element;
}

/**
 * Realiza o teste de existência de um elemento
 * @param {Object} span - O span contendo a operação assert_exists
 * @param {Object} result - O resultado parcial do teste
 * @returns {Object} - O resultado atualizado do teste
 */
function assertExists(span, result) {
  if (!span.selector) {
    result.message = 'Seletor não especificado';
    return result;
  }
  
  try {
    const elements = document.querySelectorAll(span.selector);
    result.success = elements.length > 0;
    result.message = result.success ? 
      `Elemento(s) encontrado(s): ${elements.length}` : 
      'Elemento não encontrado';
    result.actual = elements.length;
  } catch (error) {
    result.success = false;
    result.message = `Erro ao buscar elemento: ${error.message}`;
  }
  
  return result;
}

/**
 * Realiza o teste de visibilidade de um elemento
 * @param {Object} span - O span contendo a operação assert_visible
 * @param {Object} result - O resultado parcial do teste
 * @returns {Object} - O resultado atualizado do teste
 */
function assertVisible(span, result) {
  if (!span.selector) {
    result.message = 'Seletor não especificado';
    return result;
  }
  
  try {
    const element = document.querySelector(span.selector);
    
    if (!element) {
      result.success = false;
      result.message = 'Elemento não encontrado';
      return result;
    }
    
    // Verificar se o elemento está visível
    const style = window.getComputedStyle(element);
    const isVisible = style.display !== 'none' && 
                      style.visibility !== 'hidden' && 
                      style.opacity !== '0';
    
    result.success = isVisible;
    result.message = isVisible ? 
      'Elemento está visível' : 
      'Elemento existe mas não está visível';
    result.actual = isVisible;
  } catch (error) {
    result.success = false;
    result.message = `Erro ao verificar visibilidade: ${error.message}`;
  }
  
  return result;
}

/**
 * Realiza o teste de conteúdo de texto de um elemento
 * @param {Object} span - O span contendo a operação assert_text
 * @param {Object} result - O resultado parcial do teste
 * @returns {Object} - O resultado atualizado do teste
 */
function assertText(span, result) {
  if (!span.selector) {
    result.message = 'Seletor não especificado';
    return result;
  }
  
  if (!span.expected) {
    result.message = 'Valor esperado não especificado';
    return result;
  }
  
  try {
    const element = document.querySelector(span.selector);
    
    if (!element) {
      result.success = false;
      result.message = 'Elemento não encontrado';
      return result;
    }
    
    const actualText = element.textContent.trim();
    const expectedText = span.expected.trim();
    
    // Verificar correspondência exata ou parcial
    const isExactMatch = span.exact !== false;
    const isMatch = isExactMatch ? 
      actualText === expectedText : 
      actualText.includes(expectedText);
    
    result.success = isMatch;
    result.message = isMatch ? 
      'Texto corresponde ao esperado' : 
      `Texto não corresponde ao esperado. Atual: "${actualText}"`;
    result.actual = actualText;
  } catch (error) {
    result.success = false;
    result.message = `Erro ao verificar texto: ${error.message}`;
  }
  
  return result;
}

/**
 * Realiza o teste de valor de um campo de formulário
 * @param {Object} span - O span contendo a operação assert_value
 * @param {Object} result - O resultado parcial do teste
 * @returns {Object} - O resultado atualizado do teste
 */
function assertValue(span, result) {
  if (!span.selector) {
    result.message = 'Seletor não especificado';
    return result;
  }
  
  if (!span.expected) {
    result.message = 'Valor esperado não especificado';
    return result;
  }
  
  try {
    const element = document.querySelector(span.selector);
    
    if (!element) {
      result.success = false;
      result.message = 'Elemento não encontrado';
      return result;
    }
    
    const actualValue = element.value;
    const expectedValue = span.expected;
    
    result.success = actualValue === expectedValue;
    result.message = result.success ? 
      'Valor corresponde ao esperado' : 
      `Valor não corresponde ao esperado. Atual: "${actualValue}"`;
    result.actual = actualValue;
  } catch (error) {
    result.success = false;
    result.message = `Erro ao verificar valor: ${error.message}`;
  }
  
  return result;
}

/**
 * Realiza o teste de um valor no estado da aplicação
 * @param {Object} span - O span contendo a operação assert_state
 * @param {Object} result - O resultado parcial do teste
 * @returns {Object} - O resultado atualizado do teste
 */
function assertState(span, result) {
  if (!span.path) {
    result.message = 'Caminho do estado não especificado';
    return result;
  }
  
  if (!span.expected) {
    result.message = 'Valor esperado não especificado';
    return result;
  }
  
  try {
    const actualValue = getValueByPath(window.uiState, span.path);
    let expectedValue = span.expected;
    
    // Converter valores para comparação
    if (typeof actualValue === 'number' && typeof expectedValue === 'string') {
      if (!isNaN(Number(expectedValue))) {
        expectedValue = Number(expectedValue);
      }
    }
    
    // Verificar igualdade
    let isEqual = false;
    if (typeof actualValue === 'object' && actualValue !== null) {
      isEqual = JSON.stringify(actualValue) === JSON.stringify(expectedValue);
    } else {
      isEqual = actualValue === expectedValue;
    }
    
    result.success = isEqual;
    result.message = isEqual ? 
      `Estado em '${span.path}' corresponde ao esperado` : 
      `Estado em '${span.path}' não corresponde ao esperado. Atual: ${JSON.stringify(actualValue)}`;
    result.actual = actualValue;
    result.path = span.path;
  } catch (error) {
    result.success = false;
    result.message = `Erro ao verificar estado: ${error.message}`;
  }
  
  return result;
}

/**
 * Cria um elemento visual para exibir o resultado de um teste
 * @param {Object} result - O resultado do teste
 * @returns {HTMLElement} - O elemento visual
 */
function createVisualTestResult(result) {
  const container = document.createElement('div');
  container.className = `test-result-visual test-${result.success ? 'success' : 'failure'}`;
  container.style.padding = '8px 12px';
  container.style.marginBottom = '8px';
  container.style.borderRadius = '4px';
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '14px';
  
  if (result.success) {
    container.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
    container.style.border = '1px solid #2ecc71';
    container.style.color = '#27ae60';
  } else {
    container.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
    container.style.border = '1px solid #e74c3c';
    container.style.color = '#c0392b';
  }
  
  // Criar cabeçalho com ícone
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '4px';
  
  const icon = document.createElement('span');
  icon.textContent = result.success ? '✅' : '❌';
  icon.style.marginRight = '6px';
  
  const title = document.createElement('span');
  title.textContent = `${result.operation}: ${result.success ? 'PASSOU' : 'FALHOU'}`;
  
  header.appendChild(icon);
  header.appendChild(title);
  container.appendChild(header);
  
  // Criar detalhes
  const details = document.createElement('div');
  details.style.fontSize = '12px';
  details.style.marginTop = '4px';
  
  // Adicionar seletor
  if (result.selector) {
    const selectorEl = document.createElement('div');
    selectorEl.textContent = `Seletor: ${result.selector}`;
    details.appendChild(selectorEl);
  }
  
  // Adicionar mensagem
  const messageEl = document.createElement('div');
  messageEl.textContent = result.message;
  details.appendChild(messageEl);
  
  // Adicionar valor esperado vs. atual (se falhou)
  if (!result.success && result.expected !== undefined) {
    const expectedEl = document.createElement('div');
    expectedEl.textContent = `Esperado: ${JSON.stringify(result.expected)}`;
    details.appendChild(expectedEl);
    
    if (result.actual !== undefined) {
      const actualEl = document.createElement('div');
      actualEl.textContent = `Atual: ${JSON.stringify(result.actual)}`;
      details.appendChild(actualEl);
    }
  }
  
  container.appendChild(details);
  return container;
}

/**
 * Adiciona um resultado de teste ao arquivo JSONL
 * @param {Object} result - O resultado do teste a ser registrado
 */
function appendTestResultToFile(result) {
  // Em um ambiente browser, precisamos usar alguma API para salvar
  // Como alternativa, podemos enviar para um endpoint ou armazenar em localStorage
  try {
    // Adicionar ao localStorage para persistência temporária
    const testLogKey = 'logline_test_results';
    let existingResults = localStorage.getItem(testLogKey);
    let resultsArray = existingResults ? JSON.parse(existingResults) : [];
    
    resultsArray.push(result);
    
    // Limitar o tamanho para evitar estouro de armazenamento
    if (resultsArray.length > 1000) {
      resultsArray = resultsArray.slice(-1000); // Manter apenas os últimos 1000
    }
    
    localStorage.setItem(testLogKey, JSON.stringify(resultsArray));
    
    logToConsole(`📝 Resultado de teste registrado: ${result.test_id}`, 'info');
  } catch (error) {
    console.error('❌ Erro ao salvar resultado de teste:', error);
  }
}

/**
 * Obtém um relatório dos testes executados
 * @returns {Object} - O relatório de testes
 */
function getTestReport() {
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = testResults.filter(r => !r.success).length;
  
  return {
    total: testResults.length,
    passed: passedTests,
    failed: failedTests,
    success_rate: testResults.length ? (passedTests / testResults.length * 100).toFixed(2) : 0,
    timestamp: new Date().toISOString(),
    results: testResults
  };
}
