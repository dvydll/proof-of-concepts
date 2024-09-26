import F9FinalizarComponent, {
  f9finalizarKey,
} from './components/five9Finalizar/index.js';

const components = {
  [f9finalizarKey]: F9FinalizarComponent,
};

const builder = {
  five9: {
    title: 'Five9 Componentes',
    weight: 10,
    components: Object.entries(components).reduce(
      (acc, [key, { builderInfo }]) => ({ ...acc, [key]: builderInfo }),
      {}
    ),
  },
};

export const module = {
  components,
  options: {
    builder: { builder },
  },
};
