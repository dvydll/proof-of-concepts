import { Layout } from '#/hono-server/src/app/components/Layout';
import type { FC } from 'hono/jsx';

type Props = {
	cause: unknown;
};

export const ErrorPage: FC<Props> = ({ cause }) => {
	return (
		<Layout>
			<header>
				<h1>Internal Server Error</h1>
			</header>
			<main>
				<h2>{cause instanceof Error ? cause.message : 'Unknown error'}</h2>
				<pre>{JSON.stringify(cause, null, 2)}</pre>
			</main>
		</Layout>
	);
};

export default Error;
