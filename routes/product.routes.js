const express = require('express');
const multer = require('multer');
// CORREÇÃO: Alterado de 'Product.controller' para 'Product_controller'
const ProductController = require('../controllers/Product_controller');
const uploadConfig = require('../config/upload');

const router = express.Router();
const upload = multer(uploadConfig);

// GET /products - Listar todos os produtos
router.get('/', ProductController.index);

// GET /products/:id - Buscar um produto por ID
router.get('/:id', ProductController.show);

// POST /products - Criar um novo produto (espera form-data com 'images')
router.post('/', upload.array('images', 10), ProductController.store);

module.exports = router;