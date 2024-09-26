import { chromium } from 'playwright';

const url = new URL('https://example.com');
const urlSearchParams = new URLSearchParams(url.search);
urlSearchParams.set('param', 'value');
const browser = await chromium.launch({ headless: false }); // Inicia el navegador

// Abre una nueva página
const context = await browser.newContext({
  recordHar: {
    path: `logs/${url.host}/network-log_${Date.now()}.har`, // Especifica la ruta donde se guardará el archivo .har
  },
});
const page = await context.newPage();

await page.goto(url.href); // Navega a una URL
await page.click('text=More information'); // Realiza cualquier interacción adicional que necesites
await context.close(); // Cierra el contexto y guarda el archivo .har
await browser.close(); // Cierra el navegador
