import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Rutas de galería
router.get('/galeria', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Imagenes');
        res.render('pages/galeria', { imagenes: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar la galería');
    }
});

router.post('/galeria', isAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Imagenes (ruta) VALUES (@ruta)')
        res.redirect('/galeria');
    } catch (err) {
        console.error('Error al agregar la imagen:', err); 
        res.status(500).send('Error al agregar la imagen');
    }
});
//ruta para eliminar imagen de la galería
router.post('/galeria/eliminar', isAdmin, async (req, res) => {
    const { id } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Imagenes WHERE id = @id')
        res.redirect('/galeria');
    } catch (err) {
        console.error('Error al eliminar la imagen:', err); 
        res.status(500).send('Error al eliminar la imagen');
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Imagenes'); // Consulta para obtener las imágenes
        const imagenes = result.recordset; // Almacena las imágenes obtenidas
        res.render('index', { imagenes }); // Pasa las imágenes a la vista
    } catch (err) {
        console.error('Error al cargar las imágenes:', err);
        res.status(500).send('Error en el servidor');
    }
});

export default router;