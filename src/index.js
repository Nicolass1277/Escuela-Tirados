import express from 'express';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js';
import { getConnection } from './db.js';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
const app = express();

dotenv.config();


// Para poder usar __dirname en ES Modules:
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuración de vistas y motor de plantillas
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Archivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
    secret: '1234', // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambia a true si usas HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Pasar el usuario a las vistas
    next();
});

// Usa el router para las rutas definidas
app.use('/', indexRouter);

const router = express.Router();

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

// Iniciar el servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
