const express = require('express');
const OrderController = require('../controllers/Order.controller');

const router = express.Router();

// POST /orders - Receber dados do checkout e criar pedido
router.post('/', OrderController.store);

module.exports = router;