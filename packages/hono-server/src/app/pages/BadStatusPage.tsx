import { Layout } from '#/hono-server/src/app/components/Layout';
import type { FC } from 'hono/jsx';

type Props = {
	response: Response;
};

export const BadStatusPage: FC<Props> = ({ response }) => {
	return (
		<Layout>
			<header>
				<h1>Error {response.status}</h1>
			</header>
			<main>
				<h2>{response.statusText}</h2>
				<pre>{JSON.stringify(response, null, 2)}</pre>
			</main>
		</Layout>
	);
};

export default Error;
