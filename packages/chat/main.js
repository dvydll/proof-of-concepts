import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

//const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC";
const SELECTED_MODEL = "Qwen2-1.5B-Instruct-q4f16_1-MLC";
/**
 *
 * @param {string} selector
 * @param {HTMLElement | Document} [el=document]
 * @returns {HTMLElement | null}
 */
const $ = (selector, el = document) => (el ?? document).querySelector(selector);
const domElements = {
  article: $("article"),
  chat: $("article > ul"),
  form: $("form"),
  input: $("form > label > input"),
  btn: $("form > button"),
  info: $("main > p"),
};
const initProgressCallback = (progress) => {
  console.log(progress);
  domElements.btn.setAttribute("disabled", "");
  domElements.info.textContent = progress.text;
};
const addMessage = ({ role, content }) => {
  messages.push({ role, content });
  domElements.chat.innerHTML += `<li data-role="${role}">${content}</li>`;
};
const messages = [
  { role: "system", content: "Eres un útil asistente de IA." },
  { role: "user", content: "¡Hola chat! ¿Cuál es la capital de España?" },
];
const engine = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback });
domElements.article.scrollTop = domElements.article.scrollHeight; // fijar el scroll abajo
messages.forEach(
  ({ role, content }) =>
    (domElements.chat.innerHTML += `<li data-role="${role}">${content}</li>`)
);
const ask = async (messages) => {
  const li = document.createElement("li");
  li.setAttribute("data-role", "assistant");
  domElements.chat.appendChild(li);
  const chunks = await engine.chat.completions.create({
    messages,
    temperature: 1,
    stream: true, // <- Enable streaming
    stream_options: { include_usage: true },
  });
  let reply = "";
  for await (const chunk of chunks) {
    const [choice] = chunk.choices;
    reply += choice?.delta?.content ?? "";
    console.log(reply);
    li.textContent = reply;
    if (chunk.usage) {
      console.log(chunk.usage); // only last chunk has usage
    }
  }
  return reply;
};
const reply = await ask(messages);
messages.push({ role: "assistant", content: reply });
domElements.btn.removeAttribute("disabled");
domElements.form.onsubmit = async (ev) => {
  ev.preventDefault();
  domElements.btn.setAttribute("disabled", "");
  const question = domElements.input.value;
  domElements.input.value = "";
  addMessage({ role: "user", content: question });
  //const fullReply = await engine.getMessage();
  //console.log(fullReply);
  const reply = await ask(messages);
  // addMessage({ role: "assistant", content: reply });
  messages.push({ role: "assistant", content: reply });
  domElements.btn.removeAttribute("disabled");
};
