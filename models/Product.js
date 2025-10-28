const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema({ /* ... schema como antes ... */
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 }
}, { _id: false });

const VariationSchema = new mongoose.Schema({ /* ... schema como antes ... */
    color: { type: String, required: true },
    sizes: [SizeSchema]
}, { _id: false });

const ProductSchema = new mongoose.Schema({ /* ... schema como antes ... */
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    variations: [VariationSchema]
}, {
    toJSON: { virtuals: true },
    timestamps: true
});

// **IMPORTANTE**: Use o IP LOCAL da sua máquina aqui!
const LOCAL_IP = "192.168.0.114"; // SUBSTITUA PELO SEU IP LOCAL ATUAL
const PORT = process.env.PORT || 3333;
const BASE_FILES_URL = `http://${LOCAL_IP}:${PORT}/files/`;

// Campo virtual para gerar as URLs completas das imagens
ProductSchema.virtual('image_urls').get(function(){
    // 'this' se refere ao documento do produto
    if (!this.images) return [];
    return this.images.map(image => `${BASE_FILES_URL}${image}`);
});

// Campo virtual para a thumbnail (usando a primeira imagem como padrão)
ProductSchema.virtual('thumbnail_url').get(function(){
    if (!this.images || this.images.length === 0) return null;
    return `${BASE_FILES_URL}${this.images[0]}`;
});


module.exports = mongoose.model('Product', ProductSchema);