import type { FC } from 'hono/jsx';

type Props = {
	name?: string;
};

export const Welcome: FC<Props> = ({ name }) => {
	return (
		<header>
			<h1>Hola {name ?? 'Hono'}!</h1>
		</header>
	);
};
export default Welcome;
