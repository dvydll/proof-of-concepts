import { hcWithType } from '/src/rpc/backend/index.js'; // Ajusta la ruta según tu estructura

const client = hcWithType('http://localhost:3001/api');

document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('form');

	if (form) {
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const name = form.elements['name'].value;
			const email = form.elements['email'].value;
			await client.users.$post({ json: { name, email } });
			location.reload();
		});
	}

	document.querySelectorAll('button[data-delete]').forEach((button) => {
		button.addEventListener('click', async () => {
			const id = button.dataset.delete;
			await client.users[':id'].$delete({ param: { id: id.toString() } });
			location.reload();
		});
	});
});
