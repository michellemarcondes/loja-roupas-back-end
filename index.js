require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, 'uploads')));

// --- Conexão com MongoDB Atlas ---
async function startDatabase() {
    // Busca as variáveis de ambiente
    const { DB_USER, DB_PASS, DB_NAME, DB_CLUSTER_HOST } = process.env;

    // Verifica se todas as variáveis necessárias estão definidas
    if (!DB_USER || !DB_PASS || !DB_NAME || !DB_CLUSTER_HOST) {
        console.error("ERRO: Variáveis de ambiente do banco de dados (DB_USER, DB_PASS, DB_NAME, DB_CLUSTER_HOST) não definidas no arquivo .env!");
        process.exit(1);
    }

    // Monta a string de conexão usando as variáveis
    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Loja`; // Adicionado appName=Loja como no seu exemplo

    console.log("Tentando conectar a:", `mongodb+srv://${DB_USER}:<senha_oculta>@${DB_CLUSTER_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Loja`); // Log sem a senha

    try {
        await mongoose.connect(uri);
        console.log('Conectado ao MongoDB Atlas com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB Atlas:', error.message);
        // Log adicional para erros de autenticação
        if (error.codeName === 'AtlasError' || error.message.includes('Authentication failed')) {
             console.error('Verifique se o usuário/senha estão corretos e se o IP está liberado no Atlas.');
        }
        process.exit(1);
    }
}

// --- Rotas da API ---
app.use('/api', routes); // Prefixo /api

app.get('/', (req, res) => {
    return res.json({ message: 'API Loja de Roupas Online!' });
});

// --- Inicialização do Servidor ---
startDatabase().then(() => {
    const port = process.env.PORT || 3333;
    app.listen(port, () => {
        // **IMPORTANTE**: Use o IP LOCAL da sua máquina aqui!
        const LOCAL_IP = "192.168.0.114"; // SUBSTITUA PELO SEU IP LOCAL ATUAL
        console.log(`Servidor rodando na porta ${port}`);
        console.log(`API disponível em: http://${LOCAL_IP}:${port}/api`);
        console.log(`Acesse as imagens em: http://${LOCAL_IP}:${port}/files/nome_da_imagem.ext`);
    });
}).catch(err => {
    console.error("Falha ao iniciar o servidor:", err);
});