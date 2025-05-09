import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads/videos');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });


// Ruta para agregar un video (solo administradores)
router.post('/videos', isAdmin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No se ha subido ningún archivo.');
        }

        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Videos (ruta) VALUES (@ruta)');
        res.redirect('/videos');
    } catch (err) {
        console.error('Error al agregar el video:', err.message);
        res.status(500).send('Error al agregar el video');
    }
});

// Ruta para eliminar un video (solo administradores)
router.post('/videos/eliminar', isAdmin, async (req, res) => {
    const { id } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Videos WHERE id = @id');
        res.redirect('/videos');
    } catch (err) {
        console.error('Error al eliminar el video:', err);
        res.status(500).send('Error al eliminar el video');
    }
});

// Ruta para obtener todos los videos
router.get('/videos', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Videos');
        res.render('pages/videos', { videos: result.recordset }); // Renderiza la vista videos.ejs
    } catch (err) {
        console.error('Error al cargar los videos:', err);
        res.status(500).send('Error al cargar los videos');
    }
});

export default router; // Asegúrate de exportar el router como default