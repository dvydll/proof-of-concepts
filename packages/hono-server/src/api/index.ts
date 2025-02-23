import { Hono } from 'hono';
import { logger } from 'hono/logger';

const api = new Hono();

api.use(logger());

api.get('/usuarios/:idUsuario', (c) => {
	const idUsuario = c.req.param('idUsuario');
	return c.json({ usuario: `Hello ${idUsuario}!`, apelido: 'Llopis' });
});

api.get('/peliculas/:idPelicula', (c) => {
	const idPelicula = c.req.param('idPelicula');
	return c.json({
		pelicula: `Hello ${idPelicula}!`,
		releaseDate: '2022-01-01',
	});
});

export default api;
