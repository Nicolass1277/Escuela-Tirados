import { Router } from 'express';
import { getConnection, sql } from '../db.js';
const router = Router();
//ruta Registo
router.get('/registro', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Usuarios');
        const usuarios = result.recordset;

        res.render('pages/registro', { usuarios });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/registro', async (req, res) => {
    const { correo, username, password, rol } = req.body;

    if (!correo || !username || !password || !rol) {
        return res.status(400).send('Faltan datos del formulario');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await getConnection();
        await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .input('rol', sql.VarChar, rol)
            .query(`
                INSERT INTO Usuarios (correo, username, password, rol)
                VALUES (@correo, @username, @password, @rol)
            `);

        // ✅ Redirige a la ruta que sí carga y renderiza correctamente con usuarios
        res.redirect('/registro');
    } catch (err) {
        console.error('Error registrando usuario:', err);
        res.status(500).send('Error en el servidor');
    }
});


// Ruta para editar usuario
router.post('/registro/editar', async (req, res) => {
    const { id, correo, username, rol } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .input('correo', sql.VarChar, correo)
            .input('username', sql.VarChar, username)
            .input('rol', sql.VarChar, rol)
            .query(`
                UPDATE Usuarios
                SET correo = @correo, username = @username, rol = @rol
                WHERE id = @id
            `);
        res.redirect('/registro');
    } catch (err) {
        console.error('Error actualizando usuario:', err);
        res.status(500).send('Error actualizando usuario');
    }
});

// Ruta para eliminar usuario
router.post('/registro/eliminar', async (req, res) => {
    const { id } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Usuarios WHERE id = @id');
        res.redirect('/registro');
    } catch (err) {
        console.error('Error eliminando usuario:', err);
        res.status(500).send('Error eliminando usuario');
    }
});

export default router;