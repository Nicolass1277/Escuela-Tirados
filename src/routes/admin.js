import { Router } from 'express';
import { isAdmin } from '../middleware/auth.js';
import { getConnection, sql } from '../db.js';

const router = Router();

// Ruta para el panel de control del administrador
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard');
});

// RUTAS PARA LA GALERÍA
router.get('/galeria', isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Imagenes');
        res.render('admin/galeria', { imagenes: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar la galería');
    }
});

router.post('/galeria', isAdmin, async (req, res) => {
    try {
        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Imagenes (ruta) VALUES (@ruta)');
        res.redirect('/admin/galeria');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar la imagen');
    }
});

router.post('/galeria/eliminar', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Imagenes WHERE id = @id');
        res.redirect('/admin/galeria');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la imagen');
    }
});

// RUTAS PARA LOS VIDEOS
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

router.post('/videos', isAdmin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No se ha subido ningún archivo.');
        }

        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads${filename}`)
            .query('INSERT INTO Videos (ruta) VALUES (@ruta)');
        res.redirect('/videos');
    } catch (err) {
        console.error('Error al agregar el video:', err.message);
        res.status(500).send('Error al agregar el video');
    }
});

router.post('/videos/eliminar', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Videos WHERE id = @id');
        res.redirect('/admin/videos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar el video');
    }
});

// RUTAS PARA LAS ACTIVIDADES
router.get('/actividades', isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Actividades');
        res.render('admin/actividades', { actividades: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar las actividades');
    }
});

router.post('/actividades', isAdmin, async (req, res) => {
    try {
        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Actividades (ruta) VALUES (@ruta)');
        res.redirect('/admin/actividades');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar la actividad');
    }
});

router.post('/actividades/eliminar', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Actividades WHERE id = @id');
        res.redirect('/admin/actividades');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la actividad');
    }
});

// RUTAS PARA LAS UTILIDADES
router.get('/utilidades', isAdmin, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Utilidades');
        res.render('admin/utilidades', { utilidades: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar las utilidades');
    }
});

router.post('/utilidades', isAdmin, async (req, res) => {
    try {
        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Utilidades (ruta) VALUES (@ruta)');
        res.redirect('/admin/utilidades');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar la utilidad');
    }
});

router.post('/utilidades/eliminar', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Utilidades WHERE id = @id');
        res.redirect('/admin/utilidades');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la utilidad');
    }
});

export default router;