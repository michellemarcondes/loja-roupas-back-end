const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

const router = express.Router();

// Monta as rotas específicas nos seus caminhos base
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// Remover rotas antigas do AirCNC (Session, Spots, Dashboard, Booking) se não forem mais necessárias

module.exports = router;