import hiddenEditForm from 'formiojs/components/hidden/Hidden.form';

export const editForm = (...extend) =>
  hiddenEditForm(
    [
      {
        key: 'display',
        components: [
          {
            key: 'label',
            defaultValue: 'Mock Data',
            hidden: false,
          },
          {
            key: 'modalEdit',
            ignore: true,
          },
        ],
      },
      ...structuredClone([
        {
          title: 'mock',
          label: 'Mock',
          type: 'tab',
          components: [
            {
              label: 'Mock Personalizado',
              type: 'textarea',
              editor: 'ace',
              as: 'json',
              autoExpand: true,
              tableView: true,
              key: 'mock',
              tooltip: 'Crea un mock de datos en this.root.data.mock',
              input: true,
              defaultValue: {},
            },
          ],
        },
      ]),
    ],
    ...extend
  );
