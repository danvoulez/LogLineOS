#!/bin/bash

# LogLine PostgreSQL Installer e Migrador
# Este script instala e configura o PostgreSQL para o LogLine OS
# Versão: 1.0.0
# Data: 10/07/2025

set -e

# Cores para formatação
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log() {
  echo -e "${CYAN}[LogLine PostgreSQL]${NC} $1"
}

success() {
  echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

error() {
  echo -e "${RED}[✗] $1${NC}"
  exit 1
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  error "Este script precisa ser executado como root. Use 'sudo $0'"
fi

# Verificar qual ambiente está sendo usado
ENVIRONMENT="development"
if [ "$1" = "production" ]; then
  ENVIRONMENT="production"
elif [ "$1" = "staging" ]; then
  ENVIRONMENT="staging"
fi

log "Iniciando instalação do PostgreSQL para LogLine OS (Ambiente: $ENVIRONMENT)"

# Verificar a distribuição
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    OS=$(uname -s)
fi

# Configurações padrão
DB_NAME="loglineos_db"
DB_USER="logline_user"
DB_PASSWORD=$(openssl rand -base64 16)
DB_PORT=5432
API_PORT=8080

# Configurar com base no ambiente
if [ "$ENVIRONMENT" = "production" ]; then
  DB_NAME="loglineos_production"
elif [ "$ENVIRONMENT" = "staging" ]; then
  DB_NAME="loglineos_staging"
fi

# Instalar PostgreSQL de acordo com o sistema operacional
install_postgres() {
  log "Instalando PostgreSQL no $OS..."
  
  if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    success "PostgreSQL instalado com sucesso no Ubuntu/Debian"
  elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    dnf install -y postgresql-server postgresql-contrib
    postgresql-setup --initdb --unit postgresql
    systemctl start postgresql
    systemctl enable postgresql
    success "PostgreSQL instalado com sucesso no CentOS/RHEL"
  elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
    brew install postgresql@14
    brew services start postgresql@14
    success "PostgreSQL instalado com sucesso no macOS"
  else
    error "Sistema operacional não suportado: $OS"
  fi
}

# Criar banco de dados e usuário
setup_database() {
  log "Configurando banco de dados LogLine..."
  
  # Criar usuário e banco de dados
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  
  # Configurar extensões
  sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
  sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
  
  success "Banco de dados $DB_NAME e usuário $DB_USER criados com sucesso"
}

# Aplicar esquema de banco de dados a partir do arquivo LogLine
apply_schema() {
  local schema_file=$1
  
  log "Aplicando esquema do banco de dados a partir de $schema_file..."
  
  # Extrair SQL do arquivo LogLine
  local sql_script=$(cat $schema_file | grep -o '"script": \[\(.*\)\]' | sed 's/"script": \[\(.*\)\]/\1/' | sed 's/","/\n/g' | sed 's/"//g')
  
  # Aplicar o script SQL
  echo "$sql_script" | sudo -u postgres psql -d $DB_NAME
  
  success "Esquema aplicado com sucesso"
}

# Configurar autenticação baseada em JWT
setup_auth() {
  log "Configurando autenticação JWT..."
  
  # Gerar chave secreta para JWT
  JWT_SECRET=$(openssl rand -base64 32)
  
  # Criar funções de autenticação
  sudo -u postgres psql -d $DB_NAME -c "
  CREATE SCHEMA IF NOT EXISTS auth;
  
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS \$\$
    SELECT COALESCE(current_setting('request.jwt.claim.sub', true)::uuid, NULL)
  \$\$ LANGUAGE SQL;
  
  CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS \$\$
    SELECT COALESCE(current_setting('request.jwt.claim.role', true), 'anon')
  \$\$ LANGUAGE SQL;
  "
  
  success "Autenticação JWT configurada"
  
  # Salvar dados de configuração
  echo "JWT_SECRET=$JWT_SECRET" > logline_postgres_config.env
  echo "DB_NAME=$DB_NAME" >> logline_postgres_config.env
  echo "DB_USER=$DB_USER" >> logline_postgres_config.env
  echo "DB_PASSWORD=$DB_PASSWORD" >> logline_postgres_config.env
  echo "DB_PORT=$DB_PORT" >> logline_postgres_config.env
  echo "API_PORT=$API_PORT" >> logline_postgres_config.env
  
  chmod 600 logline_postgres_config.env
  
  success "Dados de configuração salvos em logline_postgres_config.env"
}

# Configurar API REST para o PostgreSQL
setup_api() {
  log "Configurando API REST para o PostgreSQL..."
  
  # Instalar Node.js e npm
  if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt update
    apt install -y nodejs npm
  elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    dnf install -y nodejs npm
  elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
    brew install node
  fi
  
  # Criar diretório do projeto
  mkdir -p /opt/logline-postgres-api
  cd /opt/logline-postgres-api
  
  # Inicializar projeto Node.js
  npm init -y
  
  # Instalar dependências
  npm install --save express pg pg-pool cors jsonwebtoken dotenv helmet express-rate-limit
  
  # Criar arquivo de configuração
  cat > .env << EOL
DB_HOST=localhost
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
API_PORT=$API_PORT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
EOL

  # Criar arquivo principal da API
  cat > server.js << 'EOL'
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const app = express();
const port = process.env.API_PORT || 8080;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Limitar requisições para evitar ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limitar a 100 requisições por janela
});
app.use('/auth', limiter);

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware para autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Inserir usuário
    const result = await pool.query(
      `INSERT INTO users(email, password, full_name) 
       VALUES($1, crypt($2, gen_salt('bf')), $3) 
       RETURNING id, email, full_name, created_at`,
      [email, password, full_name]
    );
    
    const user = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Verificar usuário
    const result = await pool.query(
      `SELECT id, email, full_name, avatar_url, role 
       FROM users 
       WHERE email = $1 AND password = crypt($2, password)`,
      [email, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    res.status(500).json({ error: 'Erro ao autenticar usuário' });
  }
});

// Rotas protegidas
app.get('/projects', authenticateToken, async (req, res) => {
  try {
    // Configurar contexto do PostgreSQL para RLS
    await pool.query(`SET LOCAL "request.jwt.claim.sub" = '${req.user.sub}'`);
    await pool.query(`SET LOCAL "request.jwt.claim.role" = '${req.user.role}'`);
    
    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE owner_id = auth.uid() OR is_public = true 
       ORDER BY created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

app.post('/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;
    
    // Validar entrada
    if (!name) {
      return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
    }
    
    // Configurar contexto do PostgreSQL para RLS
    await pool.query(`SET LOCAL "request.jwt.claim.sub" = '${req.user.sub}'`);
    await pool.query(`SET LOCAL "request.jwt.claim.role" = '${req.user.role}'`);
    
    const result = await pool.query(
      `INSERT INTO projects(name, description, owner_id, is_public) 
       VALUES($1, $2, auth.uid(), $3) 
       RETURNING *`,
      [name, description, is_public || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`API LogLine PostgreSQL rodando na porta ${port}`);
});
EOL

  # Criar script de serviço systemd
  cat > /etc/systemd/system/logline-postgres-api.service << EOL
[Unit]
Description=LogLine PostgreSQL API
After=network.target postgresql.service

[Service]
ExecStart=/usr/bin/node /opt/logline-postgres-api/server.js
Restart=always
User=nobody
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/opt/logline-postgres-api

[Install]
WantedBy=multi-user.target
EOL

  # Iniciar e habilitar serviço
  systemctl daemon-reload
  systemctl enable logline-postgres-api
  systemctl start logline-postgres-api
  
  success "API REST configurada e rodando na porta $API_PORT"
}

# Configurar monitoramento
setup_monitoring() {
  log "Configurando monitoramento básico..."
  
  # Instalar pgAdmin se for ambiente de desenvolvimento
  if [ "$ENVIRONMENT" = "development" ]; then
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
      # Adicionar repositório
      curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | apt-key add
      echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list
      
      # Instalar pgAdmin4
      apt update
      apt install -y pgadmin4-desktop
      
    elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
      brew install --cask pgadmin4
    fi
    
    success "pgAdmin instalado para ambiente de desenvolvimento"
  fi
}

# Criar backup do banco de dados
create_backup() {
  log "Configurando rotina de backup..."
  
  # Criar diretório de backup
  mkdir -p /var/backups/logline-postgres
  chmod 700 /var/backups/logline-postgres
  
  # Criar script de backup
  cat > /usr/local/bin/logline-postgres-backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/var/backups/logline-postgres"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/loglineos_\$TIMESTAMP.sql"

# Fazer backup
pg_dump -U $DB_USER -d $DB_NAME > \$BACKUP_FILE

# Comprimir
gzip \$BACKUP_FILE

# Manter apenas os últimos 7 backups
find \$BACKUP_DIR -name "loglineos_*.sql.gz" -type f -mtime +7 -delete
EOL

  chmod +x /usr/local/bin/logline-postgres-backup.sh
  
  # Configurar cron para backup diário
  (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/logline-postgres-backup.sh") | crontab -
  
  success "Rotina de backup configurada para execução diária às 2h da manhã"
}

# Menu principal para instalação
main() {
  # Verificar e instalar dependências
  log "Verificando dependências..."
  command -v psql >/dev/null 2>&1 || install_postgres
  
  # Perguntar se deseja configurar o banco de dados
  read -p "Deseja configurar o banco de dados PostgreSQL para LogLine OS? (s/n): " setup_db
  if [[ $setup_db == "s" || $setup_db == "S" ]]; then
    setup_database
  fi
  
  # Perguntar se deseja aplicar o esquema do arquivo LogLine
  read -p "Caminho para o arquivo LogLine com definição do banco de dados (deixe em branco para pular): " schema_file
  if [[ -n $schema_file && -f $schema_file ]]; then
    apply_schema $schema_file
  fi
  
  # Configurar autenticação
  setup_auth
  
  # Perguntar se deseja configurar a API REST
  read -p "Deseja configurar a API REST para o PostgreSQL? (s/n): " setup_rest
  if [[ $setup_rest == "s" || $setup_rest == "S" ]]; then
    setup_api
  fi
  
  # Configurar monitoramento
  read -p "Deseja configurar ferramentas de monitoramento? (s/n): " setup_mon
  if [[ $setup_mon == "s" || $setup_mon == "S" ]]; then
    setup_monitoring
  fi
  
  # Configurar backup
  read -p "Deseja configurar rotina de backup? (s/n): " setup_backup
  if [[ $setup_backup == "s" || $setup_backup == "S" ]]; then
    create_backup
  fi
  
  log "Instalação concluída com sucesso!"
  log "Informações de conexão:"
  log "  - Host: localhost"
  log "  - Porta: $DB_PORT"
  log "  - Banco: $DB_NAME"
  log "  - Usuário: $DB_USER"
  log "  - Senha: $DB_PASSWORD"
  log "  - API: http://localhost:$API_PORT"
  
  log "Para migrar para uma VM no Digital Ocean, use o script migrate_to_vm.sh"
}

# Função para migração para VM
migrate_to_vm() {
  log "Iniciando processo de migração para VM Digital Ocean..."
  
  # Verificar se temos as variáveis de ambiente necessárias
  source logline_postgres_config.env
  
  read -p "Digite o IP da VM Digital Ocean: " VM_IP
  read -p "Digite a porta PostgreSQL na VM (padrão: 5432): " VM_PORT
  VM_PORT=${VM_PORT:-5432}
  read -p "Digite o usuário PostgreSQL na VM: " VM_USER
  read -s -p "Digite a senha PostgreSQL na VM: " VM_PASSWORD
  echo ""
  
  log "Exportando dados do banco local..."
  pg_dump -U $DB_USER -d $DB_NAME > loglineos_migration.sql
  
  log "Transferindo dados para a VM..."
  scp loglineos_migration.sql root@$VM_IP:/tmp/
  
  log "Configurando banco de dados na VM..."
  ssh root@$VM_IP "
    # Instalar PostgreSQL se não estiver instalado
    command -v psql >/dev/null 2>&1 || apt update && apt install -y postgresql postgresql-contrib
    
    # Criar usuário e banco de dados
    sudo -u postgres psql -c \"CREATE USER $VM_USER WITH PASSWORD '$VM_PASSWORD';\"
    sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME OWNER $VM_USER;\"
    sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $VM_USER;\"
    
    # Restaurar dados
    sudo -u postgres psql -d $DB_NAME < /tmp/loglineos_migration.sql
    
    # Limpar
    rm /tmp/loglineos_migration.sql
  "
  
  # Atualizar arquivo de configuração
  cat > vm_postgres_config.env << EOL
DB_HOST=$VM_IP
DB_PORT=$VM_PORT
DB_NAME=$DB_NAME
DB_USER=$VM_USER
DB_PASSWORD=$VM_PASSWORD
API_PORT=$API_PORT
JWT_SECRET=$JWT_SECRET
EOL

  success "Migração para VM concluída com sucesso!"
  log "Arquivo de configuração criado: vm_postgres_config.env"
  log "Use estas configurações na sua aplicação LogLine OS"
}

# Verificar argumento para migração
if [ "$1" = "migrate" ]; then
  migrate_to_vm
else
  main
fi
