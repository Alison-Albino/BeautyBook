// Utilitário para carregar variáveis de ambiente do arquivo .env
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado em:', envPath);
    console.error('💡 Certifique-se de criar o arquivo .env na raiz do projeto');
    return false;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          
          // Remove aspas se presentes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          envVars[key] = value;
        }
      }
    });
    
    // Definir variáveis de ambiente
    Object.assign(process.env, envVars);
    
    console.log('✅ Variáveis de ambiente carregadas:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'não definido');
    console.log('   PORT:', process.env.PORT || 'não definido');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'configurado' : 'não definido');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao ler arquivo .env:', error.message);
    return false;
  }
}

// Carregar automaticamente quando este módulo for importado
if (!loadEnv()) {
  process.exit(1);
}

export { loadEnv };