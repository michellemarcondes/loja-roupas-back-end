const multer = require('multer');
const path = require('path');

module.exports = {
    storage: multer.diskStorage({
        // Usar __dirname garante que o caminho é relativo à pasta 'config'
        destination: path.resolve(__dirname, '..', 'uploads'),
        filename: (req, file, cb) =>{
            const ext = path.extname(file.originalname);
            // Remover espaços e caracteres especiais do nome base, se houver
            const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

            cb(null, `${name}-${Date.now()}${ext}`);
        }
    })
}