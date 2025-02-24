import { Hono } from 'hono';
import { hc } from 'hono/client';
import { usersApi } from './users.routes';

export const api = new Hono()
	.route('/users', usersApi)
	.notFound((c) => c.json({ message: 'not found' }, 404));

// Este es un truco para calcular el tipo al compilar (mejora el rendimiento).
// Hono no puede ralentizar el IDE al tratar de inferir el tipo de los endpoints.
// Ver mas en https://hono.dev/docs/guides/rpc#known-issues
const client = hc<typeof api>('');
type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<typeof api>(...args);
