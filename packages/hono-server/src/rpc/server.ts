// Importación de dependencias
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';

// Importación de componentes y utilidades
import { api } from '#/hono-server/src/rpc/backend/index';
import { app } from '#/hono-server/src/rpc/client/index';
import { boldGreen } from '#/shared/colors.js';

const server = new Hono()
	.use(logger(), poweredBy())
	.use('/assets/*', serveStatic({ root: '.' }))
	.route('/api', api)
	.route('/', app);

serve(
	{
		fetch: server.fetch,
		port: 3001,
	},
	(info) => {
		console.info(
			`Server is running on ${boldGreen(`http://localhost:${info.port}`)}`
		);
	}
);
