import type { Post } from '#//hono-server/src/app/schemas/post.d.ts';
import type { FC } from 'hono/jsx';

type Props = {
	posts: Post[];
};

export const PostTable: FC<Props> = ({ posts }) => {
	return (
		<table border={1} class='table-auto'>
			<thead>
				<tr>
					<th>ID</th>
					<th>UserID</th>
					<th>Título</th>
					<th>Cuerpo</th>
				</tr>
			</thead>
			<tbody>
				{posts.map((post) => (
					<tr key={post.id}>
						<td>
							<a href={`/posts/${post.id}`}>{post.id}</a>
						</td>
						<td>{post.userId}</td>
						<td>{post.title}</td>
						<td>{post.body}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default PostTable;
