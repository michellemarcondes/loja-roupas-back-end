const express = require('express');
const multer = require('multer');
const ProductController = require('../controllers/Product.controller');
const uploadConfig = require('../config/upload');

const router = express.Router();
const upload = multer(uploadConfig);

// GET /products - Listar todos os produtos
router.get('/', ProductController.index);

// GET /products/:id - Buscar um produto por ID
router.get('/:id', ProductController.show);

// POST /products - Criar um novo produto (espera form-data com 'images')
// 'images' deve ser o nome do campo no form-data, 10 é o número máximo de arquivos
router.post('/', upload.array('images', 10), ProductController.store);

module.exports = router;