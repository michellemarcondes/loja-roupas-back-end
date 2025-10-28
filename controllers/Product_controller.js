const Product = require('../models/Product');
const path = require('path');
const fs = require('fs'); // Para deletar arquivos em caso de erro

// Listar todos os produtos (ou filtrar por categoria no futuro)
const index = async (req, res) => {
    try {
        // Exemplo futuro de filtro: const { category } = req.query;
        // const filter = category ? { category } : {};
        const products = await Product.find(/* filter */);
        return res.json(products);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
    }
};

// Buscar um único produto pelo ID
const show = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        return res.json(product);
    } catch (error) {
        console.error("Erro ao buscar produto por ID:", error);
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ error: 'ID de produto inválido.' });
         }
        return res.status(500).json({ error: 'Erro interno ao buscar produto.' });
    }
};


// Criar um novo produto (requer autenticação em um app real)
const store = async (req, res) => {
    try {
        const { title, description, price, category, variations } = req.body;

        // Verificar se arquivos foram enviados
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'É necessário enviar ao menos uma imagem.' });
        }

        // Extrair nomes dos arquivos
        const images = req.files.map(file => file.filename);

        // Parse das variações (pode vir como string JSON do form-data)
        let parsedVariations;
        try {
            parsedVariations = JSON.parse(variations || '[]');
        } catch (e) {
             // Se falhar o parse, deletar imagens que foram salvas
             req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Erro ao deletar arquivo após falha:", file.path, err);
                });
             });
            return res.status(400).json({ error: 'Formato inválido para variações. Use um JSON array. Ex: [{"color":"Azul", "sizes":[{"size":"M", "stock":10}]}]' });
        }


        const product = await Product.create({
            title,
            description,
            price: Number(price), // Garantir que preço é número
            category,
            images, // Salva os nomes dos arquivos
            variations: parsedVariations // Salva as variações parseadas
        });

        return res.status(201).json(product); // Status 201 para criação

    } catch (error) {
         // Se ocorrer erro ao salvar no DB, deletar imagens que foram salvas
         if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Erro ao deletar arquivo após falha no DB:", file.path, err);
                });
            });
         }
        console.error("Erro ao criar produto:", error);
        // Verificar erro de validação do Mongoose
        if (error.name === 'ValidationError') {
             return res.status(400).json({ error: 'Dados inválidos para o produto.', details: error.errors });
        }
        return res.status(500).json({ error: 'Erro interno ao criar produto.' });
    }
};

module.exports = { index, show, store };