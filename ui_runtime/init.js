/**
 * LogLineOS UI Runtime - Inicialização
 * 
 * Este arquivo carrega as configurações necessárias na ordem correta
 * e inicializa o sistema de UI Runtime do LogLineOS.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 LogLineOS UI Runtime - Inicializando...');
  
  // Inicializar estado global da UI
  window.uiState = {
    app: {
      initialized: false,
      loading: true,
      error: null,
      online: navigator.onLine,
    },
    user: null,
    data: {},
    ui: {
      currentView: null,
      modal: null,
      toast: null,
      sidebar: {
        open: true,
      },
      debug: {
        visible: false,
      },
    },
  };
  
  // Carregar configurações
  loadConfigurations()
    .then(() => {
      console.log('✅ Configurações carregadas com sucesso');
      initializeRuntime();
    })
    .catch(error => {
      console.error('❌ Erro ao carregar configurações:', error);
      showErrorScreen('Erro ao carregar configurações');
    });
});

/**
 * Carrega os arquivos de configuração na ordem correta
 */
function loadConfigurations() {
  return new Promise((resolve, reject) => {
    // Carregar configuração principal do runtime
    loadScript('/ui_runtime/runtime_config.js')
      .then(() => {
        // Verificar se o banco de dados está configurado
        const urlParams = new URLSearchParams(window.location.search);
        const dbParam = urlParams.get('db') || window.RUNTIME_CONFIG?.INTEGRATIONS?.DATABASE_PROVIDER;
        
        // Se o banco de dados for PostgreSQL, carregar a configuração correspondente
        if (dbParam === 'postgres') {
          return loadScript('/postgres_integration/postgres_config.js');
        }
        return Promise.resolve();
      })
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

/**
 * Carrega um script JavaScript dinamicamente
 * @param {string} src - Caminho para o arquivo JavaScript
 * @returns {Promise} - Promise resolvida quando o script é carregado
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar o script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Inicializa o runtime LogLineOS
 */
function initializeRuntime() {
  console.log('🚀 Inicializando LogLineOS UI Runtime...');
  
  // Carregar o script principal
  loadScript('/ui_runtime/main.js')
    .then(() => {
      console.log('✅ Script principal carregado');
      
      // Marcar como inicializado
      window.uiState.app.initialized = true;
      window.uiState.app.loading = false;
      
      // Disparar evento de inicialização completa
      const event = new CustomEvent('loglineos:initialized', { 
        detail: { 
          config: window.RUNTIME_CONFIG?.ACTIVE,
          timestamp: new Date().toISOString()
        } 
      });
      document.dispatchEvent(event);
    })
    .catch(error => {
      console.error('❌ Erro ao carregar script principal:', error);
      showErrorScreen('Erro ao carregar script principal');
    });
}

/**
 * Exibe uma tela de erro quando ocorre uma falha na inicialização
 * @param {string} message - Mensagem de erro
 */
function showErrorScreen(message) {
  const appRoot = document.getElementById('app') || document.body;
  
  // Limpar conteúdo existente
  while (appRoot.firstChild) {
    appRoot.removeChild(appRoot.firstChild);
  }
  
  // Criar elemento de erro
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-container';
  errorContainer.style = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 20px;
    text-align: center;
    color: #d32f2f;
    background-color: #ffebee;
    font-family: sans-serif;
  `;
  
  // Título do erro
  const errorTitle = document.createElement('h1');
  errorTitle.textContent = 'Erro de Inicialização';
  errorTitle.style = 'margin-bottom: 10px;';
  
  // Mensagem de erro
  const errorMessage = document.createElement('p');
  errorMessage.textContent = message || 'Ocorreu um erro ao inicializar o LogLineOS UI Runtime';
  errorMessage.style = 'margin-bottom: 20px;';
  
  // Botão para tentar novamente
  const retryButton = document.createElement('button');
  retryButton.textContent = 'Tentar Novamente';
  retryButton.style = `
    padding: 10px 20px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  `;
  retryButton.onclick = () => window.location.reload();
  
  // Montar elementos
  errorContainer.appendChild(errorTitle);
  errorContainer.appendChild(errorMessage);
  errorContainer.appendChild(retryButton);
  appRoot.appendChild(errorContainer);
  
  // Atualizar estado
  window.uiState.app.error = message;
  window.uiState.app.loading = false;
}
