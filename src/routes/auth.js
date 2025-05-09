import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getConnection, sql } from '../db.js';

const router = Router();

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('pages/login');
});

// Ruta para manejar el login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Usuarios WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).send('Usuario no encontrado.');
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Contraseña incorrecta.');
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            rol: user.rol
        };

        res.redirect('/');
    } catch (err) {
        console.error('Error durante el login:', err);
        res.status(500).send('Error en el servidor.');
    }
});

// Ruta para registrar un nuevo usuario
router.post('/registro', async (req, res) => {
    const { username, password, rol } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await getConnection();
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .input('rol', sql.VarChar, rol)
            .query('INSERT INTO Usuarios (username, password, rol) VALUES (@username, @password, @rol)');

        res.send('Usuario registrado exitosamente');
    } catch (err) {
        console.error('Error registrando usuario:', err);
        res.status(500).send('Error en el servidor');
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

router.post('/upload', async (req, res) => {
    const { filename } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('ruta', sql.VarChar, `/uploads/${filename}`)
            .query('INSERT INTO Imagenes (ruta) VALUES (@ruta)');

        res.send('Imagen subida exitosamente');
    } catch (err) {
        console.error('Error subiendo la imagen:', err);
        res.status(500).send('Error en el servidor');
    }
});

export default router;