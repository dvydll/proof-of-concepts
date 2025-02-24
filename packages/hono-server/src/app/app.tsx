import type { Post } from '#//hono-server/src/app/schemas/post.d.ts';
import type { Pokemon } from '#/hono-server/src/app/schemas/pokemon.d.ts';
import type { RickAndMortyByName } from '#/hono-server/src/app/schemas/rick-and-morty.d.ts';
import type { StatusCode } from 'hono/utils/http-status';

import { Layout } from '#/hono-server/src/app/components/Layout';
import { PostTable } from '#/hono-server/src/app/components/PostTable';
import { Welcome } from '#/hono-server/src/app/components/Welcome';
import { BadStatusPage } from '#/hono-server/src/app/pages/BadStatusPage';
import { ErrorPage } from '#/hono-server/src/app/pages/ErrorPage';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();
const jsonPlaceholderUrl = new URL('https://jsonplaceholder.typicode.com');

app.use(logger());

app.get('/', (c) => {
	return c.html(
		<Layout>
			<Welcome />
		</Layout>
	);
});

app.get('/posts', async (c) => {
	const userId = c.req.query('userId');
	const postsUrl = new URL('/posts', jsonPlaceholderUrl.origin);
	if (userId) postsUrl.searchParams.set('userId', userId);

	try {
		const response = await fetch(postsUrl);

		if (!response.ok)
			throw new Error('Something went wrong', { cause: response });

		const posts: Post[] = await response.json();

		return c.html(
			<Layout>
				<header>
					<h1 class='text-center text-3xl'>Posts</h1>
				</header>
				<main>
					<PostTable posts={posts} />
				</main>
			</Layout>
		);
	} catch (error) {
		if (error instanceof Error && error.cause) {
			c.status((error.cause as Response).status as StatusCode);
			return c.html(<BadStatusPage response={error.cause as Response} />);
		}

		return c.html(<ErrorPage cause={error} />, 500);
	}
});

app.get('/posts/:id', async (c) => {
	const postId = c.req.param('id');
	const postsUrl = new URL('/posts', jsonPlaceholderUrl.origin);
	postsUrl.searchParams.set('id', postId);

	try {
		const response = await fetch(postsUrl);

		if (!response.ok)
			throw new Error('Something went wrong', { cause: response });

		const posts: Post[] = await response.json();

		return c.html(
			<Layout>
				<header>
					<h1 class='text-center text-3xl'>Posts</h1>
				</header>
				<main>
					<PostTable posts={posts} />
				</main>
			</Layout>
		);
	} catch (error) {
		if (error instanceof Error && error.cause) {
			c.status((error.cause as Response).status as StatusCode);
			return c.html(<BadStatusPage response={error.cause as Response} />);
		}

		return c.html(<ErrorPage cause={error} />, 500);
	}
});

app.get('/pokemon/:name', async (c) => {
	const name = c.req.param('name');
	try {
		const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
		if (!response.ok)
			throw new Error('Something went wrong', { cause: response });

		const pokemon: Pokemon = await response.json();

		return c.html(
			<Layout>
				<header>
					<h1 class='text-center text-3xl'>Pokedex</h1>
					<img
						class='w-full h-full'
						src={pokemon.sprites.front_default}
						alt={pokemon.name}
					/>
					<h2 class='text-center text-2xl'>{pokemon.name}</h2>
				</header>
				<main>
					<h3>Estadísticas</h3>
					<p>Base Exp: {pokemon.base_experience}</p>
					<p>Tipo: {pokemon.types[0].type.name}</p>
					<p>Habilidad: {pokemon.abilities[0].ability.name}</p>
				</main>
			</Layout>
		);
	} catch (error) {
		if (error instanceof Error && error.cause) {
			c.status((error.cause as Response).status as StatusCode);
			return c.html(<BadStatusPage response={error.cause as Response} />);
		}

		return c.html(<ErrorPage cause={error} />, 500);
	}
});

app.get('/rick-and-morty/:name', async (c) => {
	const name = c.req.param('name');
	try {
		const response = await fetch(
			`https://rickandmortyapi.com/api/character/?name=${name}`
		);
		if (!response.ok)
			throw new Error('Something went wrong', { cause: response });

		const { results }: RickAndMortyByName = await response.json();
		const [rickAndMorty] = results;

		return c.html(
			<Layout>
				<header>
					<h1 class='text-center text-3xl'>Rick and Morty</h1>
					<img
						class='w-full h-full'
						src={rickAndMorty.image}
						alt={rickAndMorty.name}
					/>
					<h2 class='text-center text-2xl'>{rickAndMorty.name}</h2>
				</header>
			</Layout>
		);
	} catch (error) {
		if (error instanceof Error && error.cause) {
			c.status((error.cause as Response).status as StatusCode);
			return c.html(<BadStatusPage response={error.cause as Response} />);
		}

		return c.html(<ErrorPage cause={error} />, 500);
	}
});

export default app;
