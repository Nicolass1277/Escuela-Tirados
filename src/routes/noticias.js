import { Router } from 'express';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
    },
});
const upload = multer({ storage });

// Obtener todas las noticias
router.get('/noticias', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Noticias'); // Consulta para obtener las noticias
        res.render('noticias', { noticias: result.recordset }); // Pasa las noticias a la vista
    } catch (err) {
        console.error('Error al cargar las noticias:', err);
        res.status(500).send('Error al cargar las noticias');
    }
});

// Agregar una nueva noticia
router.post('/noticias', isAdmin, upload.single('imagen'), async (req, res) => {
    const { titulo, contenido, autor } = req.body;
    const imagen_url = `/uploads/${req.file.filename}`; // Ruta de la imagen subida

    try {
        const pool = await getConnection();
        await pool.request()
            .input('titulo', sql.VarChar, titulo)
            .input('contenido', sql.Text, contenido)
            .input('autor', sql.VarChar, autor)
            .input('imagen_url', sql.VarChar, imagen_url)
            .query('INSERT INTO Noticias (titulo, contenido, autor, imagen_url, fecha_publicacion) VALUES (@titulo, @contenido, @autor, @imagen_url, GETDATE())');
        res.redirect('/noticias');
    } catch (err) {
        console.error('Error al agregar la noticia:', err);
        res.status(500).send('Error al agregar la noticia');
    }
});

// Eliminar una noticia
router.post('/noticias/eliminar', isAdmin, async (req, res) => {
    const { id } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Noticias WHERE id = @id');
        res.redirect('/noticias');
    } catch (err) {
        console.error('Error al eliminar la noticia:', err);
        res.status(500).send('Error al eliminar la noticia');
    }
});

// Editar una noticia (mostrar formulario de edición)
router.get('/noticias/editar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Noticias WHERE id = @id');
        res.render('pages/editar-noticia', { noticia: result.recordset[0], user: req.user });
    } catch (err) {
        console.error('Error al cargar la noticia para editar:', err);
        res.status(500).send('Error al cargar la noticia para editar');
    }
});

// Actualizar una noticia
router.post('/noticias/editar/:id', isAdmin, upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { titulo, contenido, autor } = req.body;
    let imagen_url = null;

    if (req.file) {
        imagen_url = `/uploads/${req.file.filename}`; // Ruta de la nueva imagen subida
    }

    try {
        const pool = await getConnection();
        const query = `
            UPDATE Noticias
            SET titulo = @titulo,
                contenido = @contenido,
                autor = @autor
                ${imagen_url ? ', imagen_url = @imagen_url' : ''}
            WHERE id = @id
        `;

        const request = pool.request()
            .input('id', sql.Int, id)
            .input('titulo', sql.VarChar, titulo)
            .input('contenido', sql.Text, contenido)
            .input('autor', sql.VarChar, autor);

        if (imagen_url) {
            request.input('imagen_url', sql.VarChar, imagen_url);
        }

        await request.query(query);

        res.redirect('/noticias');
    } catch (err) {
        console.error('Error al actualizar la noticia:', err);
        res.status(500).send('Error al actualizar la noticia');
    }
});

export default router;