import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const createUserSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.string().email(),
});

const updateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	email: z.string().email().optional(),
});

export type User = z.infer<typeof createUserSchema> & { id: number };

const users: User[] = [
	{
		id: 1,
		name: 'John Doe',
		email: 'john.doe@example.com',
	},
];

export const usersApi = new Hono()
	.get('/', (c) => c.json(users))
	.get('/:id', (c) => {
		const id = c.req.param('id');
		const user = users.find((user) => user.id === Number(id));
		if (!user) return c.json({ message: 'user not found' }, 404);
		return c.json(user);
	})
	.post('/', zValidator('json', createUserSchema), (c) => {
		const newUser = c.req.valid('json');
		users.push({ ...newUser, id: users.length + 1 });
		return c.json({ message: 'created', user: newUser }, 201);
	})
	.put('/:id', zValidator('json', updateUserSchema), (c) => {
		const id = c.req.param('id');
		const user = users.find((user) => user.id === Number(id));
		if (!user) return c.json({ message: 'user not found' }, 404);
		const updatedUser = c.req.valid('json');
		const mergedUser = { ...user, ...updatedUser };
		users.splice(
			users.findIndex((user) => user.id === Number(id)),
			1,
			mergedUser
		);
		return c.json({ message: 'updated', user: mergedUser });
	})
	.delete('/:id', (c) => {
		const id = c.req.param('id');
		const index = users.findIndex((user) => user.id === Number(id));
		if (index === -1) return c.json({ message: 'user not found' }, 404);
		users.splice(index, 1);
		return c.json({ message: 'deleted' });
	});
