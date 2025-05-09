import { Router } from 'express';
import { getConnection, sql } from '../db.js';
import { isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/uploads'); // Asegúrate que esta carpeta exista
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Mostrar página "Nosotros" con los directivos
router.get('/nosotros', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Directivos');
    res.render('nosotros', {
      user: req.session.user,
      directivos: result.recordset
    });
  } catch (err) {
    console.error('Error cargando directivos:', err);
    res.status(500).send('Error al mostrar la página');
  }
});

// Agregar nuevo directivo
router.post('/nosotros/agregar', isAdmin, upload.single('foto'), async (req, res) => {
  const { nombre, cargo, descripcion } = req.body;
  const ruta = `/uploads/${req.file.filename}`;

  try {
    const pool = await getConnection();
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('cargo', sql.NVarChar, cargo)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('ruta', sql.VarChar, ruta)
      .query(`INSERT INTO Directivos (nombre, cargo, descripcion, ruta)
              VALUES (@nombre, @cargo, @descripcion, @ruta)`);

    res.redirect('/nosotros');
  } catch (err) {
    console.error('Error al agregar directivo:', err);
    res.status(500).send('Error al agregar directivo');
  }
});

// Mostrar formulario de edición
router.get('/nosotros/editar/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Directivos WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Directivo no encontrado');
    }

    res.render('pages/editar-directivo', { 
      directivo: result.recordset[0],
      user: req.session.user
    });
  } catch (err) {
    console.error('Error al cargar directivo para editar:', err);
    res.status(500).send('Error al cargar directivo');
  }
});

// Guardar cambios del directivo
router.post('/nosotros/editar/:id', isAdmin, upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, descripcion } = req.body;
  const ruta = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const pool = await getConnection();

    const query = `
      UPDATE Directivos
      SET nombre = @nombre,
          cargo = @cargo,
          descripcion = @descripcion
          ${ruta ? ', ruta = @ruta' : ''}
      WHERE id = @id
    `;

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar, nombre)
      .input('cargo', sql.NVarChar, cargo)
      .input('descripcion', sql.NVarChar, descripcion);

    if (ruta) {
      request.input('ruta', sql.VarChar, ruta);
    }

    await request.query(query);
    res.redirect('/nosotros');
  } catch (err) {
    console.error('Error al actualizar directivo:', err);
    res.status(500).send('Error al actualizar directivo');
  }
});

// Eliminar directivo
router.post('/nosotros/eliminar', isAdmin, async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await getConnection();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Directivos WHERE id = @id');
    res.redirect('/nosotros');
  } catch (err) {
    console.error('Error al eliminar directivo:', err);
    res.status(500).send('Error al eliminar');
  }
});

export default router;
