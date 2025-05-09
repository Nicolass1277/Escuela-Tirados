import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads/actividades');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Ruta para mostrar las actividades

router.get('/actividades', async (req, res) => {
    try {
      const pool = await getConnection();
  
      const actividadesResult = await pool.request()
        .query('SELECT * FROM Actividades');
  
      const calendarioResult = await pool.request()
        .query('SELECT * FROM Calendario ORDER BY fecha');
  
        res.render('pages/actividades', {
            actividades: actividadesResult.recordset,
            calendario: calendarioResult.recordset,
            user: req.session.user
          });
          
  
    } catch (err) {
      console.error('Error real:', err);
      res.status(500).send('Error al mostrar la página');
    }
  });
//ruta para eliminar actividad
router.post('/actividades/eliminar', isAdmin, async (req, res) => {
    const { id } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Actividades WHERE id = @id'); // Elimina la actividad de la tabla Actividades
        res.redirect('/actividades'); // Redirige a la página de actividades
    } catch (err) {
        console.error('Error al eliminar la actividad:', err);
        res.status(500).send('Error al eliminar la actividad');
    }
});
router.post('/admin/actividades', async (req, res) => {
    const { titulo, descripcion, fecha_inicio, fecha_fin } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('titulo', sql.NVarChar, titulo)
            .input('descripcion', sql.NVarChar, descripcion)
            .input('fecha_inicio', sql.Date, fecha_inicio)
            .input('fecha_fin', sql.Date, fecha_fin || null)
            .query(`
                INSERT INTO Actividades (titulo, descripcion, fecha_inicio, fecha_fin)
                VALUES (@titulo, @descripcion, @fecha_inicio, @fecha_fin)
            `);

        res.redirect('/actividades');
    } catch (err) {
        console.error('Error agregando actividad:', err);
        res.status(500).send('Error al agregar la actividad.');
    }
});



export default router;