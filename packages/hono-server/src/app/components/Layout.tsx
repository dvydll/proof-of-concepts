import type { Child, FC, PropsWithChildren } from 'hono/jsx';

type Props = {
	script?: Child;
} & PropsWithChildren;

export const Layout: FC<Props> = ({ children, script }) => {
	return (
		<html lang='es-ES'>
			<head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<meta http-equiv='X-UA-Compatible' content='ie=edge' />
				<title>Hono API</title>
				<link rel='stylesheet' href='/assets/css/index.css' />
				{/* <script src='https://unpkg.com/@tailwindcss/browser@4'></script> */}
				{script}
			</head>
			<body>{children}</body>
		</html>
	);
};
