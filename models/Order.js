const mongoose = require('mongoose');

// Schema para os itens dentro do pedido
const OrderItemSchema = new mongoose.Schema({
    product: { // Referência ao produto comprado
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // Preço unitário no momento da compra
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    // Dados do Cliente (obtidos do formulário)
    customerName: { type: String, required: true },
    customerCpf: { type: String, required: true }, // Adicionar validação de formato se necessário
    customerPhone: { type: String, required: true },
    customerCep: { type: String, required: true }, // Adicionar validação de formato se necessário

    // Itens do Pedido
    items: [OrderItemSchema],

    // Total do Pedido (pode ser calculado ou armazenado)
    totalAmount: { type: Number, required: true }

}, {
    timestamps: true // Adicionar createdAt e updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);