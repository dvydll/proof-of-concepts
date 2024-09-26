// Registrar el custom element
customElements.define(
  'ace-editor',
  class AceEditor extends HTMLElement {
    #shadowRoot;
    #editor;

    constructor() {
      super();
      this.#editor = null;
      this.#shadowRoot = this.attachShadow({ mode: 'closed' });
    }

    // Observa cambios en los atributos 'theme' y 'language'
    static get observedAttributes() {
      return ['theme', 'language', 'value'];
    }

    connectedCallback() {
      const container = this.createContainer();
      this.initEditor(container);
      // this.initEditor(this.#shadowRoot.host);
      // this.initEditor(this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.#editor || newValue === oldValue) return;
      const attrChangeHandlers = {
        theme: () => this.#editor.setTheme(`ace/theme/${newValue}`),
        language: () => this.#editor.session.setMode(`ace/mode/${newValue}`),
        value: () =>
          this.#editor.getValue() !== newValue &&
          this.#editor.setValue(newValue, 1), // '1' para mover el cursor al final
      };
      return attrChangeHandlers[name]?.();
    }

    createContainer() {
      // Crear un contenedor para el editor
      const editorContainer = document.createElement('div');
      editorContainer.style.width = '100%';
      editorContainer.style.height = '100%';

      // Añadir el contenedor al shadow DOM
      this.#shadowRoot.appendChild(editorContainer);
      // this.insertAdjacentElement('beforeend', editorContainer);
      return editorContainer;
    }

    initEditor(editorContainer) {
      // Inicializar Ace Editor
      this.#editor = ace.edit(editorContainer, {
        mode: `ace/mode/${this.getAttribute('language') || 'javascript'}`,
        theme: `ace/theme/${this.getAttribute('theme') || 'github'}`,
        selectionStyle: 'text',
      });

      // Establecer el valor inicial si se ha proporcionado
      if (this.hasAttribute('value')) {
        this.#editor.setValue(this.getAttribute('value'), 1); // '1' para mover el cursor al final
      }

      // Sincronizar atributos con el editor
      this.#editor.session.on('change', () => {
        this.setAttribute('value', this.#editor.getValue());
      });
    }
  }
);
