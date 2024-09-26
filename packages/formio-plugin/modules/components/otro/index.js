import { Components } from 'formiojs';

const BaseComponent = Components.components.hidden;
export const mockKey = 'mock';

export default class MockDataComponent extends BaseComponent {
  static schema(...extend) {
    return BaseComponent.schema(
      {
        label: 'Mock Data',
        key: mockKey,
        type: mockKey,
        input: true,
      },
      ...extend
    );
  }

  static get builderInfo() {
    return {
      type: mockKey,
      title: 'Mock Data',
      group: 'five9',
      icon: 'fa fa-eye-slash',
      weight: 30,
      schema: MockDataComponent.schema(),
    };
  }

  attach(element) {
    // estilar como componente 'hidden'
    element.classList.remove(`formio-component-${mockKey}`);
    element.classList.add('formio-component-hidden');

    // mostrar label solo en el builder
    if (this.options.attachMode === 'builder')
      element
        .querySelector('[ref="element"]')
        .insertAdjacentText('beforeend', this.component.label);

    return super.attach(element);
  }

  setValue() {
    const { key, properties } = this.component;
    this.root.data[key] = properties;
  }
}

// Registrar el componente con Formio
Components.addComponent(mockKey, MockDataComponent);
