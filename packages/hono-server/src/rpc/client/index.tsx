import { Hono } from 'hono';

import { Layout } from '#/hono-server/src/app/components/Layout';
import { Welcome } from '#/hono-server/src/app/components/Welcome';
import { BadStatusPage } from '#/hono-server/src/app/pages/BadStatusPage';
import { ErrorPage } from '#/hono-server/src/app/pages/ErrorPage';
import { hcWithType } from '#/hono-server/src/rpc/backend/index';
import { UsersPage } from '#/hono-server/src/rpc/client/UsersPage';

const client = hcWithType('http://localhost:3001/api');

export const app = new Hono()
	.get('/', (c) => {
		return c.html(
			<Layout>
				<Welcome />
			</Layout>
		);
	})
	.get('/users', async (c) => {
		try {
			const res = await client.users.$get();
			if (!res.ok) return c.html(<BadStatusPage response={res} />, res.status);
			const users = await res.json();

			return c.html(<UsersPage users={users} />);
		} catch (error) {
			return c.html(<ErrorPage cause={error} />, 500);
		}
	})
	.get('/users/:id', async (c) => {
		const id = c.req.param('id');
		try {
			const res = await client.users[':id'].$get({ param: { id } });
			if (!res.ok) return c.html(<BadStatusPage response={res} />, res.status);
			const user = await res.json();
			const handleSubmit = async (e: Event) => {
				e.preventDefault();
				const form = e.target as HTMLFormElement;
				const { value: name } = form.elements.namedItem(
					'name'
				) as HTMLInputElement;
				const { value: email } = form.elements.namedItem(
					'email'
				) as HTMLInputElement;
				await client.users[':id'].$put({
					param: { id },
					json: { name, email },
				});
			};

			return c.html(
				<Layout>
					<header>
						<h1 class='text-center text-3xl'>Users</h1>
					</header>
					<main>
						<h3>User</h3>
						<form onSubmit={handleSubmit}>
							<label>
								<span>Name:</span>
								<input type='text' name='name' value={user.name} />
							</label>

							<label>
								<span>Email:</span>
								<input type='email' name='email' value={user.email} />
							</label>

							<button type='submit'>Update</button>
						</form>
					</main>
					<script type='module'></script>
				</Layout>
			);
		} catch (error) {
			return c.html(<ErrorPage cause={error} />, 500);
		}
	})
	.notFound((c) => c.html(<BadStatusPage response={c.res} />, 404));
