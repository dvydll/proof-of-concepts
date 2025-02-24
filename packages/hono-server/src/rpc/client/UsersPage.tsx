import type { User } from '#/hono-server/src/rpc/backend/users.routes';
import type { FC } from 'hono/jsx';

import { Layout } from '#/hono-server/src/app/components/Layout';

type Props = {
	users: User[];
};

export const UsersPage: FC<Props> = ({ users }) => {
	return (
		<Layout script={<script type='module' src='/assets/js/index.js' />}>
			<header>
				<h1 class='text-center text-3xl'>Users</h1>
			</header>
			<main>
				<h3>Users</h3>

				<form>
					<label>
						<span>Name:</span>
						<input type='text' name='name' required />
					</label>

					<label>
						<span>Email:</span>
						<input type='email' name='email' required />
					</label>

					<button type='submit'>Create</button>
				</form>

				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Name</th>
							<th>Email</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id}>
								<td>
									<a href={`/users/${user.id}`}>{user.id}</a>
								</td>
								<td>
									<a href={`/users/${user.id}`}>{user.name}</a>
								</td>
								<td>
									<a mailto={user.email}>{user.email}</a>
								</td>
								<td>
									<button type='button' data-delete={user.id}>
										❌
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</main>
		</Layout>
	);
};

export default UsersPage;
