// deps
import 'https://cdn.form.io/js/formio.full.min.js';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/es/highlight.min.js';
import json from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/es/languages/json.min.js';

// app
import { module } from './modules/index.js';
import { $, IndexedDbContext } from './utils/index.js';

const idxdbCtx = await IndexedDbContext.init({
  dbName: 'formio_local_test',
  version: 1,
  stores: [{ name: 'forms', options: { keyPath: 'id' } }],
});

let builder = null;
let schemaId = null;

const highlightJson = (json) =>
  hljs.highlight(JSON.stringify(json, null, 2), {
    language: 'json',
  }).value;

const updatePreviewUI = (form) => {
  $('pre > code').innerHTML = highlightJson(form);
  globalThis.Formio?.createForm($('#preview'), form);
};

const showLoadFromSchema = () =>
  $('#loadFormFromSchema')?.classList.toggle('d-none');

const onSaveJsonToLocalStorage = async (key = 'form_schema') => {
  globalThis.localStorage.setItem(
    key,
    JSON.stringify(builder.webform._form, null, 2)
  );
};

const onLoadJsonFromLocalStorage = async (key = 'form_schema') => {
  const newSchema = globalThis.localStorage.getItem(key);
  if (newSchema) createFormBuilder(JSON.parse(newSchema));
};

const onLoadJsonFromTextarea = () => {
  const text = $('#loadFormFromSchema > textarea')?.value;
  if (!text) return;
  createFormBuilder(JSON.parse(text));
  showLoadFromSchema();
};

const onSaveSchema = async () => {
  if (!builder) return;
  if (!schemaId) {
    schemaId = crypto.randomUUID();
    await idxdbCtx
      .store({ name: 'forms' })
      .create({ id: schemaId, schema: builder.webform._form });
  } else {
    await idxdbCtx
      .store({ name: 'forms' })
      .update({ data: { id: schemaId, schema: builder.webform._form } });
  }
};

const onLoadSchema = async () => {
  if (!schemaId) return;
  const { success, result } = await idxdbCtx
    .store({ name: 'forms' })
    .get({ key: schemaId });
  if (!success || !result) return;
  const { schema } = result;
  createFormBuilder(schema);
};

const createFormBuilder = (schema = {}) =>
  globalThis.Formio?.builder($('#builder'), schema, {})
    .then((formBuilder) => {
      const {
        events,
        webform: { _form: form },
      } = formBuilder;
      builder = formBuilder; // actualizar el builder
      updatePreviewUI(form); // actualizar UI
      events.onAny(() => updatePreviewUI(form));
    })
    .catch(console.warn);

// globalThis.Formio?.setLanguage('es');
globalThis.Formio?.use([module]);

hljs.registerLanguage('json', json);
hljs.configure({ ignoreUnescapedHTML: true });
hljs.highlightElement($('pre > code')); // resaltado de código

$('#saveToStorage')?.on('click', onSaveSchema);
$('#loadFromStorage')?.on('click', onLoadSchema);

// $('#saveToStorage')?.on('click', onSaveJsonToLocalStorage);
// $('#loadFromStorage')?.on('click', onLoadJsonFromLocalStorage);
$('#loadFromScheme')?.on('click', showLoadFromSchema);
$('#loadFormFromSchema > button')?.on('click', onLoadJsonFromTextarea);

globalThis.onload = function () {
  createFormBuilder();
};
