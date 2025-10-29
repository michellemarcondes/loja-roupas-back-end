const express = require('express');
// CORREÇÃO: Alterado de 'Order.controller' para 'Order_controller'
const OrderController = require('../controllers/Order_controller');

const router = express.Router();

// POST /orders - Receber dados do checkout e criar pedido
router.post('/', OrderController.store);

module.exports = router;