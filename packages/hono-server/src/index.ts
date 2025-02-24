import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

// Importación de dependencias
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';

// Importación de componentes y utilidades
import api from '#/hono-server/src/api/index.js';
import app from '#/hono-server/src/app/app.jsx';
import { boldGreen, boldMagenta, boldYellow } from '#/shared/colors.js';

try {
	const envFile = resolve('.env');
	console.debug('Cargando variables de entorno desde', boldMagenta(envFile));
	loadEnvFile(envFile);
} catch (error) {
	console.warn(
		boldYellow('No se pudo cargar el archivo de variables de entorno')
	);
}

const { PORT = 3000 } = process.env;

const server = new Hono();

server.use(poweredBy());

app.use('/assets/*', serveStatic({ root: '.' }));

server.route('/api', api);
server.route('/', app);

serve(
	{
		fetch: server.fetch,
		port: Number(PORT),
	},
	(info) => {
		console.info(
			`Server is running on ${boldGreen(`http://localhost:${info.port}`)}`
		);
	}
);
