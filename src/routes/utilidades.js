import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/utilidades');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Rutas de utilidades
router.get('/utilidades', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Utilidades'); // Consulta para obtener las utilidades
        res.render('pages/utilidades', { utilidades: result.recordset }); // Renderiza la página utilidades.ejs con los datos obtenidos
    } catch (err) {
        console.error('Error al cargar las utilidades:', err);
        res.status(500).send('Error al cargar las utilidades');
    }
});

router.post('/utilidades', isAdmin, upload.single('utilidad'), async (req, res) => {
    try {
        const { filename } = req.file;
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Utilidades (ruta) VALUES (@ruta)'); // Inserta la ruta de la utilidad en la tabla Utilidades
        res.redirect('/utilidades'); // Redirige a la página de utilidades
    } catch (err) {
        console.error('Error al agregar la utilidad:', err);
        res.status(500).send('Error al agregar la utilidad');
    }
});
//ruta para eliminar utilidad
router.post('/utilidades/eliminar', isAdmin, async (req, res) => {
    const { id } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Utilidades WHERE id = @id'); // Elimina la utilidad de la tabla Utilidades
        res.redirect('/utilidades'); // Redirige a la página de utilidades
    } catch (err) {
        console.error('Error al eliminar la utilidad:', err);
        res.status(500).send('Error al eliminar la utilidad');
    }
});

export default router;
