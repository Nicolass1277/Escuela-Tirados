export function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.rol === 'admin') {
        return next(); // El usuario es administrador, continuar
    }
    res.status(403).send('Acceso denegado: Solo los administradores pueden realizar esta acción.');
}

export function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // El usuario está autenticado, continuar
    }
    res.redirect('/login'); // Redirige al formulario de login si no está autenticado
}