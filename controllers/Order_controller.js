const Order = require('../models/Order');
const Product = require('../models/Product'); // Pode ser útil para verificar preços
const { z } = require('zod');

// --- ESQUEMA ZOD PARA VALIDAÇÃO ---
const orderItemSchema = z.object({
  productId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { // Valida formato ObjectId do Mongo
      message: "ID de produto inválido",
  }),
  color: z.string().min(1, "Cor é obrigatória"),
  size: z.string().min(1, "Tamanho é obrigatório"), // Ou ajuste se pode ser 'Único'
  quantity: z.number().int().min(1, "Quantidade deve ser ao menos 1"),
  // price: z.number().positive("Preço deve ser positivo"), // Preço virá do frontend, mas pode ser validado contra o DB
});

const orderSchema = z.object({
  customerName: z.string().min(3, "Nome completo é obrigatório (mínimo 3 caracteres)"),
  customerCpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"), // Aceita com ou sem máscara
  customerPhone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"), // Formato flexível
  customerCep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"), // Aceita com ou sem hífen
  items: z.array(orderItemSchema).min(1, "O carrinho não pode estar vazio"),
  // totalAmount: z.number().positive("Valor total inválido") // O total pode ser calculado no backend para segurança
});
// --- FIM DO ESQUEMA ZOD ---

const store = async (req, res) => {
  // 1. Validar os dados recebidos com Zod
  const validationResult = orderSchema.safeParse(req.body);

  if (!validationResult.success) {
    console.error("Erro de validação Zod:", validationResult.error.flatten());
    // Retorna os erros formatados pelo Zod
    return res.status(400).json({
      error: 'Dados inválidos para o pedido.',
      details: validationResult.error.flatten().fieldErrors // Erros por campo
    });
  }

  // 2. Dados validados
  const { customerName, customerCpf, customerPhone, customerCep, items } = validationResult.data;

  try {
    // 3. (Opcional, mas recomendado) Recalcular o total no backend para segurança
    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of items) {
       const product = await Product.findById(item.productId);
       if (!product) {
         return res.status(404).json({ error: `Produto com ID ${item.productId} não encontrado.`});
       }
       // Usar o preço do banco de dados, não o enviado pelo cliente
       calculatedTotal += product.price * item.quantity;
       processedItems.push({
         product: product._id, // Usar o ObjectId
         color: item.color,
         size: item.size,
         quantity: item.quantity,
         price: product.price // Preço do DB
       });
    }

    // Remover máscara do CPF e CEP se houver (opcional)
    const cleanCpf = customerCpf.replace(/\D/g,'');
    const cleanCep = customerCep.replace(/\D/g,'');

    // 4. Criar o pedido no banco de dados
    const order = await Order.create({
      customerName,
      customerCpf: cleanCpf,
      customerPhone,
      customerCep: cleanCep,
      items: processedItems, // Itens com preço e ID validados
      totalAmount: calculatedTotal // Total calculado no backend
    });

    // 5. Retornar sucesso
    // Não precisamos mais popular, a menos que o front precise dos detalhes do produto na resposta
    // await order.populate('items.product');
    return res.status(201).json({ message: "Pedido finalizado com sucesso!", orderId: order._id });

  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    // Verificar outros erros, como falha de conexão com DB
    if (error.name === 'ValidationError') {
         return res.status(400).json({ error: 'Erro de validação ao salvar pedido.', details: error.errors });
    }
    return res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
  }
};

module.exports = { store };