import WebSocket from 'ws';

// Crear un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 });

const randomValue = (offset = 1) => {
	const sign = Math.random() < 0.5 ? -1 : 1;
	return sign * Math.random() * offset;
};

function update({ time, value }) {
	const newTime = Math.floor(Date.now() / 1000);
	const data =
		newTime > time
			? {
					time: newTime,
					value: value + randomValue(),
			  }
			: {
					time,
					value: value + randomValue(),
			  };

	return data;
}

wss.on('connection', (ws) => {
	console.log('Cliente conectado');

	// Enviar un mensaje al cliente
	ws.send('Bienvenido!');

	// Evento que se ejecuta cuando el servidor recibe un mensaje del cliente
	ws.on('message', (message) => {
		console.log('Mensaje del cliente: %s', message);
		try {
			const data = JSON.parse(message.toString('utf-8'));
			if (data.time) {
				const response = update(data);

				ws.send(JSON.stringify(response));
			}
		} catch (e) {
			console.error('Error al procesar el mensaje: ', e);
			ws.send(
				JSON.stringify({ time: Math.floor(Date.now() / 1000), value: 50 })
			);
		}
	});

	// Evento que se ejecuta cuando la conexión se cierra
	ws.on('close', (event) => {
		console.info('Cliente desconectado', event);
	});

	// Evento que se ejecuta cuando ocurre un error
	ws.on('error', (error) => {
		console.error('Error en la conexión: ', error);
	});
});
