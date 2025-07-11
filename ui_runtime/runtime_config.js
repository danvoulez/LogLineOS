/**
 * LogLineOS UI Runtime - Configuração Avançada
 * 
 * Este arquivo contém todas as configurações para o UI Runtime do LogLineOS.
 * Versão: 4.0.0
 * Data: 11/07/2025
 * 
 * A configuração suporta múltiplos ambientes e integração com diversos
 * sistemas de back-end, incluindo PostgreSQL opcional via módulo externo.
 */

window.RUNTIME_CONFIG = {
  // Versão da configuração
  VERSION: '4.0.0',
  
  // Ambiente atual (development, staging, production)
  ENV: 'development',
  
  // Configurações de ambiente
  ENVIRONMENTS: {
    development: {
      API_URL: 'http://localhost:3000/api',
      ASSETS_URL: 'http://localhost:3000/assets',
      BACKEND_URL: 'https://api.voulezvous.ai',
      LOG_LEVEL: 'debug',  // debug, info, warn, error
      ENABLE_CACHE: true,
      CACHE_DURATION: 3600, // segundos
      HOT_RELOAD: true,
      LAYOUT_DEBUG: true,
      VALIDATE_SCHEMAS: true,
    },
    
    staging: {
      API_URL: 'https://staging-api.loglineos.com/api',
      ASSETS_URL: 'https://staging-cdn.loglineos.com/assets',
      BACKEND_URL: 'https://staging-api.voulezvous.ai',
      LOG_LEVEL: 'info',
      ENABLE_CACHE: true,
      CACHE_DURATION: 7200, // segundos
      HOT_RELOAD: false,
      LAYOUT_DEBUG: true,
      VALIDATE_SCHEMAS: true,
    },
    
    production: {
      API_URL: 'https://api.loglineos.com/api',
      ASSETS_URL: 'https://cdn.loglineos.com/assets',
      BACKEND_URL: 'https://api.voulezvous.ai',
      LOG_LEVEL: 'warn',
      ENABLE_CACHE: true,
      CACHE_DURATION: 86400, // segundos (24 horas)
      HOT_RELOAD: false,
      LAYOUT_DEBUG: false,
      VALIDATE_SCHEMAS: true,
    }
  },

  // Configurações de integração com sistemas de backend
  INTEGRATIONS: {
    // Configuração de qual sistema de dados usar
    DATABASE_PROVIDER: 'none', // 'none', 'postgres', 'supabase', 'firebase'
    
    // Configurações do Supabase (alternativa ao PostgreSQL)
    SUPABASE: {
      URL: 'https://zcsbfkatxfwafastugfq.supabase.co',
      ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjc2Jma2F0eGZ3YWZhc3R1Z2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5Mjc5NzUsImV4cCI6MjA2MzUwMzk3NX0.RRMj5lmP7ChjtWQ-jAgANc1757dTvn8AiOX8NsAaieU',
      FUNCTIONS_URL: 'https://zcsbfkatxfwafastugfq.functions.supabase.co',
      STORAGE_BUCKET: 'logline-assets',
      REALTIME_ENABLED: true,
    },
    
    // Configurações Firebase (outra alternativa)
    FIREBASE: {
      API_KEY: "AIzaSyBMZ6KNjmrnsasOl6ufHRtT3aVrtrBoKCQ",
      AUTH_DOMAIN: "loglineos.firebaseapp.com",
      PROJECT_ID: "loglineos",
      STORAGE_BUCKET: "loglineos.appspot.com",
      MESSAGING_SENDER_ID: "607573569277",
      APP_ID: "1:607573569277:web:8f50c3b1140ae29e3e2f3c",
      MEASUREMENT_ID: "G-HPLTVG3X5F",
    },
    
    // Outras integrações
    REST_API: {
      BASE_URL: 'https://api.loglineos.com',
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000,
      USE_INTERCEPTORS: true,
    }
  },
  
  // Configurações de autenticação
  AUTH: {
    ENABLED: true,
    PROVIDER: 'local', // local, oauth, jwt, supabase, firebase, cognito
    TOKEN_KEY: 'logline_auth_token',
    REFRESH_TOKEN_KEY: 'logline_refresh_token',
    SESSION_DURATION: 86400, // 24 horas em segundos
    AUTO_REFRESH: true,
    REFRESH_WINDOW: 3600, // 1 hora em segundos
    PERSIST_SESSION: true,
    REQUIRED_FOR_ROUTES: ['/admin', '/dashboard'],
    PUBLIC_ROUTES: ['/', '/login', '/register', '/forgot-password', '/reset-password'],
  },
  
  // Configurações de UI
  UI: {
    DEFAULT_THEME: 'theme_default.logline',
    AVAILABLE_THEMES: ['theme_default.logline', 'theme_dark.logline', 'theme_contrast.logline'],
    LOAD_ANIMATIONS: true,
    ANIMATION_DURATION: 300, // ms
    RESPONSIVE_BREAKPOINTS: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    },
    TOAST_DURATION: 5000, // ms
    TOAST_POSITION: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    MODAL_ANIMATION: true,
    ENABLE_BACKDROP_BLUR: true,
    DEFAULT_FONT_SIZE: 16, // px
    ENABLE_FOCUS_VISIBLE: true,
    USE_SYSTEM_COLORS: true,
    FORM_VALIDATION_MODE: 'onBlur', // onChange, onBlur, onSubmit
  },

  // Configuração do dispatcher canônico
  DISPATCHER: {
    PATH: 'dispatcher.logline',
    HANDLERS_PATH: 'handlers/',
    WATCH_CHANGES: true,
    VALIDATE_HANDLERS: true,
    HANDLER_CACHE: true,
    HANDLER_CACHE_TTL: 3600, // segundos
    ERROR_HANDLER: 'handlers/error_handler.logline',
    METRICS_ENABLED: true,
  },
  
  // Recursos habilitados
  FEATURES: {
    debugPanel: true,
    analytics: false,
    notifications: true,
    offlineMode: true,
    mediaSupport: true,
    fileUpload: true,
    dataTables: true,
    charts: false,
    internacionalization: false,
    accessibilityTools: true,
    themeEditor: false,
    codeMirror: false,
    markdownSupport: true,
    vectorGraphics: true,
    printSupport: true,
    geometryTools: false,
    audioSupport: true,
    webSocketSupport: false,
    webRTCSupport: false,
    cameraAccess: false,
    geolocation: false,
    webWorkers: true,
    serviceWorker: false,
    pushNotifications: false,
    fileSystemAccess: false,
    speechRecognition: false,
    textToSpeech: false,
  },

  // Configurações de performance
  PERFORMANCE: {
    LAZY_LOAD_COMPONENTS: true,
    CODE_SPLITTING: true,
    VIRTUALIZE_LONG_LISTS: true,
    VIRTUALIZATION_THRESHOLD: 100, // itens
    DEBOUNCE_INPUTS: true,
    DEBOUNCE_DELAY: 250, // ms
    THROTTLE_SCROLL_EVENTS: true,
    THROTTLE_DELAY: 100, // ms
    USE_MEMO_FOR_EXPENSIVE_CALCULATIONS: true,
    IMAGE_COMPRESSION: true,
    IMAGE_QUALITY: 0.9, // 0-1
    MAX_IMAGE_WIDTH: 1920, // px
    ENABLE_REQUEST_BATCHING: true,
    BATCH_DELAY: 50, // ms
  },

  // Configurações de registro e monitoramento
  LOGGING: {
    CONSOLE_ENABLED: true,
    FILE_ENABLED: false,
    REMOTE_ENABLED: false,
    REMOTE_ENDPOINT: 'https://logs.loglineos.com/collect',
    LOG_LEVEL: 'info', // debug, info, warn, error
    INCLUDE_TIMESTAMPS: true,
    LOG_USER_ACTIONS: true,
    LOG_PERFORMANCE_METRICS: true,
    LOG_NETWORK_REQUESTS: true,
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'credit_card', 'ssn'],
    MAX_LOG_SIZE: 10485760, // 10MB
    LOG_ROTATION_SIZE: 1048576, // 1MB
    LOG_RETENTION_PERIOD: 30, // dias
  },

  // Configurações de localização e internacionalização
  I18N: {
    DEFAULT_LOCALE: 'pt-BR',
    FALLBACK_LOCALE: 'en-US',
    AVAILABLE_LOCALES: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE'],
    LOCALE_PATH: 'locales/',
    AUTO_DETECT_LOCALE: true,
    USE_INTL_API: true,
    DATE_FORMAT: 'dd/MM/yyyy',
    TIME_FORMAT: 'HH:mm',
    NUMBER_FORMAT: {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    CURRENCY_FORMAT: {
      style: 'currency',
      currency: 'BRL',
      currencyDisplay: 'symbol',
    },
  },

  // Configurações de segurança
  SECURITY: {
    ENABLE_CSP: true,
    CSP_DIRECTIVES: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https://*'],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'https://*'],
      'frame-src': ["'self'"],
      'object-src': ["'none'"],
    },
    XSS_PROTECTION: true,
    CONTENT_TYPE_OPTIONS: 'nosniff',
    FRAME_OPTIONS: 'SAMEORIGIN',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    SANITIZE_HTML_INPUT: true,
    VALIDATE_URL_SCHEMAS: true,
    ALLOWED_DOMAINS: ['loglineos.com', 'api.voulezvous.ai'],
    MAX_UPLOAD_SIZE: 10485760, // 10MB
    ALLOWED_UPLOAD_TYPES: ['image/*', 'application/pdf', '.docx', '.xlsx', '.pptx'],
  },

  // Configurações de teste e depuração
  TESTING: {
    ENABLE_TESTS: true,
    TEST_ROUTE: 'ui_tests.logline',
    AUTO_RUN_TESTS: false,
    VISUAL_REGRESSION_TESTING: false,
    PERFORMANCE_BENCHMARKS: true,
    E2E_TESTING: false,
    MOCK_API_RESPONSES: false,
    MOCK_DATA_PATH: 'mocks/',
    TEST_MODE: false,
  },
  
  // Obter configuração ativa com base no ambiente
  getActiveConfig: function() {
    // Verificar parâmetros de URL primeiro
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env') || this.ENV;
    const dbParam = urlParams.get('db') || this.INTEGRATIONS.DATABASE_PROVIDER;
    
    // Usar ambiente especificado
    const envConfig = this.ENVIRONMENTS[envParam] || this.ENVIRONMENTS.development;
    console.log(`🔧 UI Runtime: Ambiente carregado: ${envParam}`);
    
    // Atualizar provedor de banco de dados se especificado via URL
    if (dbParam && (dbParam === 'postgres' || dbParam === 'supabase' || dbParam === 'firebase')) {
      console.log(`🔧 UI Runtime: Provedor de dados definido para: ${dbParam}`);
      this.INTEGRATIONS.DATABASE_PROVIDER = dbParam;
      
      // Ajustar configurações de autenticação com base no provedor de banco de dados
      switch(dbParam) {
        case 'postgres':
          this.AUTH.PROVIDER = 'postgres_jwt';
          // Verificar se o arquivo de configuração PostgreSQL foi carregado
          if (window.POSTGRES_CONFIG) {
            console.log('🔧 UI Runtime: Configuração PostgreSQL detectada e ativada');
          } else {
            console.warn('⚠️ Configuração PostgreSQL não encontrada. Inclua postgres_config.js');
          }
          break;
        case 'supabase':
          this.AUTH.PROVIDER = 'supabase';
          break;
        case 'firebase':
          this.AUTH.PROVIDER = 'firebase';
          break;
      }
    }
    
    // Mesclar configurações
    return {
      ...envConfig,
      INTEGRATIONS: this.INTEGRATIONS,
      AUTH: this.AUTH,
      UI: this.UI,
      DISPATCHER: this.DISPATCHER,
      FEATURES: this.FEATURES,
      PERFORMANCE: this.PERFORMANCE,
      LOGGING: {
        ...this.LOGGING,
        LOG_LEVEL: envConfig.LOG_LEVEL || this.LOGGING.LOG_LEVEL,
      },
      I18N: this.I18N,
      SECURITY: this.SECURITY,
      TESTING: this.TESTING,
    };
  },
  
  // Inicializar configuração
  init: function() {
    // Configuração ativa para o ambiente atual
    this.ACTIVE = this.getActiveConfig();
    
    // Registrar inicialização
    console.log(`🚀 LogLineOS UI Runtime v${this.VERSION} inicializado`);
    console.log(`🚀 Ambiente: ${this.ENV}, Provedor de Dados: ${this.INTEGRATIONS.DATABASE_PROVIDER}`);
    
    // Carregar configurações de logging
    console.log(`📝 Nível de log: ${this.ACTIVE.LOGGING.LOG_LEVEL}`);
    
    // Adicionar ao estado global da UI, se disponível
    if (window.uiState) {
      window.uiState.config = {
        version: this.VERSION,
        env: this.ENV,
        theme: this.UI.DEFAULT_THEME,
        features: this.FEATURES,
      };
    }
    
    // Aplicar configurações de segurança
    if (this.SECURITY.ENABLE_CSP) {
      this._applyCSP();
    }
    
    // Carregar tema padrão
    this._loadDefaultTheme();
    
    // Inicializar recursos
    this._initFeatures();
    
    return this.ACTIVE;
  },
  
  // Aplicar política de segurança de conteúdo (CSP)
  _applyCSP: function() {
    if (typeof document === 'undefined') return;
    
    let cspValue = '';
    for (const [directive, sources] of Object.entries(this.SECURITY.CSP_DIRECTIVES)) {
      cspValue += `${directive} ${sources.join(' ')}; `;
    }
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspValue.trim();
    document.head.appendChild(meta);
    
    console.log('🔒 Política de Segurança de Conteúdo (CSP) aplicada');
  },
  
  // Carregar tema padrão
  _loadDefaultTheme: function() {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('loglineos_theme');
      const themeToLoad = savedTheme || this.UI.DEFAULT_THEME;
      
      if (window.uiState) {
        window.uiState.app = window.uiState.app || {};
        window.uiState.app.currentTheme = themeToLoad;
      }
      
      console.log(`🎨 Tema carregado: ${themeToLoad}`);
    }
  },
  
  // Inicializar recursos específicos
  _initFeatures: function() {
    // Inicializar recursos com base nas flags de recursos
    for (const [feature, enabled] of Object.entries(this.FEATURES)) {
      if (enabled) {
        console.log(`✅ Recurso habilitado: ${feature}`);
        
        // Inicializações específicas para certos recursos
        switch (feature) {
          case 'offlineMode':
            this._initOfflineMode();
            break;
          case 'serviceWorker':
            this._registerServiceWorker();
            break;
          // Outros recursos podem ser inicializados aqui
        }
      }
    }
  },
  
  // Inicializar modo offline
  _initOfflineMode: function() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      console.log('🌐 Conectado à rede');
      if (window.uiState) {
        window.uiState.app = window.uiState.app || {};
        window.uiState.app.online = true;
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('⚠️ Desconectado da rede');
      if (window.uiState) {
        window.uiState.app = window.uiState.app || {};
        window.uiState.app.online = false;
      }
    });
    
    console.log('📶 Monitoramento de conexão de rede habilitado');
  },
  
  // Registrar service worker
  _registerServiceWorker: function() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('📦 Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
          console.error('❌ Falha ao registrar Service Worker:', error);
        });
    }
  }
};

// Inicializar automaticamente a configuração do UI Runtime
const RUNTIME_ACTIVE_CONFIG = window.RUNTIME_CONFIG.init();

// Exportar para uso em Node.js (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.RUNTIME_CONFIG;
}
