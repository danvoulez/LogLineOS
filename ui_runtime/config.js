/**
 * LogLine UI Runtime - Configuração de Ambiente
 * 
 * Este arquivo contém variáveis de ambiente para a aplicação.
 * Diferentes valores podem ser usados em diferentes ambientes.
 */

window.ENV = {
  // Ambiente atual (development, staging, production)
  ENV: 'development',
  
  // URLs de API
  API_URL: 'http://localhost:3000/api',
  ASSETS_URL: 'http://localhost:3000/assets',
  BACKEND_URL: 'https://api.voulezvous.ai',  // URL do backend
  
  // Configurações de banco de dados
  DATABASE_PROVIDER: 'postgres', // 'postgres' ou 'supabase'
  
  // Configurações do PostgreSQL nativo do LogLine
  POSTGRES: {
    HOST: 'localhost',
    PORT: 5432,
    DATABASE: 'loglineos_db',
    USER: 'logline_user',
    PASSWORD: 'logline_secure_password',
    SSL_MODE: false,
    API_URL: 'http://localhost:8080',
    JWT_SECRET: 'logline_jwt_super_secret_key_change_in_production',
    JWT_EXPIRY: '7d',
    CONNECTION_POOL_SIZE: 10,
    SCHEMA: 'public',
    // Configurações para migração para VM
    VM_HOST: 'your-digital-ocean-vm-ip',
    VM_PORT: 5432,
    VM_USER: 'logline_vm_user',
    VM_PASSWORD: 'secure_vm_password',
    DEFINITION_FILE: 'postgres_api.logline'
  },
  
  // Configurações do Supabase (alternativa)
  SUPABASE: {
    URL: 'https://zcsbfkatxfwafastugfq.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjc2Jma2F0eGZ3YWZhc3R1Z2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5Mjc5NzUsImV4cCI6MjA2MzUwMzk3NX0.RRMj5lmP7ChjtWQ-jAgANc1757dTvn8AiOX8NsAaieU'
  },
  
  // Configurações do LogLine
  LOG_LEVEL: 'debug',  // debug, info, warn, error
  ENABLE_CACHE: true,
  CACHE_DURATION: 3600, // segundos
  
  // Configurações de autenticação
  AUTH_ENABLED: true,
  AUTH_PROVIDER: 'supabase', // local, oauth, jwt, supabase
  
  // Recursos habilitados
  FEATURES: {
    debugPanel: true,
    analytics: false,
    notifications: true,
    offlineMode: true
  },
  
  // Permite que valores sejam substituídos pelo parâmetro de URL "env"
  // Exemplo: ?env=production irá carregar configurações de produção
  loadFromUrl: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env');
    const dbParam = urlParams.get('db') || 'postgres'; // postgres ou supabase
    
    // Definir o provedor de banco de dados
    this.DATABASE_PROVIDER = dbParam;
    
    if (envParam === 'production') {
      this.ENV = 'production';
      this.API_URL = 'https://api.loglineos.com/api';
      this.ASSETS_URL = 'https://cdn.loglineos.com/assets';
      this.BACKEND_URL = 'https://api.voulezvous.ai';
      this.LOG_LEVEL = 'error';
      this.FEATURES.debugPanel = false;
      this.FEATURES.analytics = true;
      
      // Configurações PostgreSQL em produção
      if (dbParam === 'postgres') {
        this.POSTGRES.HOST = this.POSTGRES.VM_HOST; // Usar o host da VM em produção
        this.POSTGRES.API_URL = `https://${this.POSTGRES.VM_HOST}/api`;
        this.POSTGRES.SSL_MODE = true;
      }
    } else if (envParam === 'staging') {
      this.ENV = 'staging';
      this.API_URL = 'https://staging-api.loglineos.com/api';
      this.ASSETS_URL = 'https://staging-cdn.loglineos.com/assets';
      this.BACKEND_URL = 'https://staging-api.voulezvous.ai';
      this.LOG_LEVEL = 'warn';
      
      // Configurações PostgreSQL em staging
      if (dbParam === 'postgres') {
        this.POSTGRES.HOST = 'staging-db.loglineos.com';
        this.POSTGRES.API_URL = 'https://staging-db.loglineos.com/api';
        this.POSTGRES.DATABASE = 'loglineos_staging';
        this.POSTGRES.SSL_MODE = true;
      }
    } else {
      // Ambiente de desenvolvimento (padrão)
      this.BACKEND_URL = 'https://api.voulezvous.ai';
      
      // Configurações PostgreSQL em desenvolvimento
      if (dbParam === 'postgres') {
        this.POSTGRES.HOST = 'localhost';
        this.POSTGRES.API_URL = 'http://localhost:8080';
        this.POSTGRES.SSL_MODE = false;
      }
    }
    
    // Ajustar configurações de autenticação com base no provedor de banco de dados
    if (dbParam === 'postgres') {
      this.AUTH_PROVIDER = 'postgres_jwt';
    } else if (dbParam === 'supabase') {
      this.AUTH_PROVIDER = 'supabase';
    }
    
    // Configurações específicas para ambientes da VM Digital Ocean
    const vmParam = urlParams.get('vm');
    if (vmParam === 'true' || vmParam === '1') {
      this.POSTGRES.HOST = this.POSTGRES.VM_HOST;
      this.POSTGRES.PORT = this.POSTGRES.VM_PORT;
      this.POSTGRES.USER = this.POSTGRES.VM_USER;
      this.POSTGRES.PASSWORD = this.POSTGRES.VM_PASSWORD;
      console.log('🖥️ Usando configurações da VM Digital Ocean');
    }
    
    console.log(`🔧 Ambiente carregado: ${this.ENV}`);
  }
};

// Carregar configuração baseada na URL automaticamente
window.ENV.loadFromUrl();

// Adicionar ao estado global da UI
if (window.uiState) {
  window.uiState.env = { ...window.ENV };
}
