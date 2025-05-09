import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import { getConnection, sql } from '../db.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 
dotenv.config();


// Importar Rutas
import actividadesRoutes from './actividades.js';
import utilidadesRoutes from './utilidades.js';
import videosRoutes from './videos.js';
import noticiasRoutes from './noticias.js';
import nosotrosRoutes from './nosotros.js';
import galeriaRoutes from './galeria.js';
import registroRoutes from './registro.js';
const app = express();
const router = Router();

// Middleware para procesar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Rutas principales
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();

        // Consulta para obtener las imágenes
        const imagenesResult = await pool.request().query('SELECT * FROM Imagenes');
        const imagenes = imagenesResult.recordset;

        // Consulta para obtener las noticias
        const noticiasResult = await pool.request().query('SELECT * FROM Noticias');
        const noticias = noticiasResult.recordset;

        // Renderiza la vista y pasa las variables
        res.render('index', { imagenes, noticias, user: req.session.user });
    } catch (err) {
        console.error('Error al cargar la página principal:', err);
        res.status(500).send('Error al cargar la página principal');
    }
});

// Rutas de login y registro
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

router.get('/login', (req, res) => {
    res.render('pages/login'); // Asegúrate de tener una vista llamada login.ejs
});
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login'); // Redirige al formulario de login
    });
});
// Ruta para buscar información usando Gemini

router.get('/buscar', async (req, res) => {
    const preguntaUsuario = req.query.q;
    console.log("🔎 Pregunta recibida:", preguntaUsuario);
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: preguntaUsuario }]
              }
            ]
          })
        }
      );
  
      const data = await response.json();
      console.log("🔍 Gemini response:", JSON.stringify(data, null, 2));
  
      let respuestaFinal = "No se pudo generar una respuesta con IA.";
      if (data && data.candidates && data.candidates.length > 0) {
        const parts = data.candidates[0]?.content?.parts;
        if (parts && parts.length > 0 && parts[0].text) {
          respuestaFinal = parts[0].text;
        }
      }
  
      res.render('pages/resultados', {
        respuesta: respuestaFinal,
        query: preguntaUsuario,
        noticias: []
      });
  
    } catch (err) {
      console.error('❌ Error con Gemini:', err);
      res.status(500).send('Error al generar respuesta con IA');
    }
  
    console.log("🔐 Clave activa:", process.env.GEMINI_API_KEY);
  });
  
// Rutas
router.use(videosRoutes);
router.use(actividadesRoutes);
router.use(utilidadesRoutes);
router.use(noticiasRoutes);
router.use(nosotrosRoutes);
router.use(galeriaRoutes);
router.use(registroRoutes);

export default router;
