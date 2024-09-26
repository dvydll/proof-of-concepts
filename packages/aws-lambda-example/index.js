export const response = (data, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(data),
  headers: new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
  }),
});

export const handler = async (event, context) => response({ event, context });
