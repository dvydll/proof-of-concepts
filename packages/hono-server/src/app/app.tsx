import type { Post } from '#//hono-server/src/app/schemas/post.d.ts';
import type { Pokemon } from '#/hono-server/src/app/schemas/pokemon.d.ts';
import type { RickAndMortyByName } from '#/hono-server/src/app/schemas/rick-and-morty.d.ts';
import type { StatusCode } from 'hono/utils/http-status';

import { Layout } from '#/hono-server/src/app/components/Layout.js';
import { PostTable } from '#/hono-server/src/app/components/PostTable.js';
import { Welcome } from '#/hono-server/src/app/components/Welcome.js';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();

app.use(logger());

app.get('/', (c) => {
	return c.html(
		<Layout>
			<Welcome />
		</Layout>
	);
});

app.get('/posts', async (c) => {
	try {
		const response = await fetch(`https://jsonplaceholder.typicode.com/posts`);

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
			return c.html(
				<Layout>
					<header>
						<h1 class={'text-center text-3xl'}>
							Error {(error.cause as Response).status}:{' '}
							{(error.cause as Response).statusText}
						</h1>
						<pre>{error.message}</pre>
					</header>
				</Layout>
			);
		}

		c.status(500);
		return c.html(
			<Layout>
				<header>
					<h1>Internal Server Error</h1>
					<pre>{JSON.stringify(error, null, 2)}</pre>
				</header>
			</Layout>
		);
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
			return c.html(
				<Layout>
					<header>
						<h1 class={'text-center text-3xl'}>
							Error {(error.cause as Response).status}:{' '}
							{(error.cause as Response).statusText}
						</h1>
						<pre>{error.message}</pre>
					</header>
				</Layout>
			);
		}

		c.status(500);
		return c.html(
			<Layout>
				<header>
					<h1>Internal Server Error</h1>
					<pre>{JSON.stringify(error, null, 2)}</pre>
				</header>
			</Layout>
		);
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
		return c.html(
			<Layout>
				<Welcome name={name} />
			</Layout>
		);
	}
});

export default app;
