// Acceder al formulario de edición base para un componente
const baseEditForm = globalThis.Formio.Components.components.base.editForm;

// Acceder al formulario de edición de un botón (el primer elemento tabs y dentro de este sus components)
const [{ components: btnEditForm }] =
  globalThis.Formio.Components.components.button.editForm().components;
console.log(baseEditForm(), btnEditForm);
export const editForm = (...extend) =>
  baseEditForm(
    [
      ...btnEditForm,
      ...structuredClone([
        {
          title: 'dbConfig',
          label: 'Configuración',
          type: 'tab',
          components: [
            {
              key: 'dbConfig.database',
              label: 'Base de Datos',
              type: 'textfield',
              tooltip: 'Nombre de la Base de Datos.',
              input: true,
              defaultValue: 'prueba',
            },
            {
              key: 'dbConfig.scheme',
              label: 'Esquema',
              type: 'textfield',
              tooltip: 'Nombre del esquema en base de datos.',
              input: true,
              defaultValue: 'utp_televentas',
            },
            {
              key: 'dbConfig.table',
              label: 'Tabla',
              type: 'textfield',
              tooltip: 'Nombre de la tabla en base de datos.',
              input: true,
              defaultValue: 'clientes',
            },
            {
              key: 'dbConfig.method',
              label: 'Método',
              type: 'select',
              tooltip:
                'Acción de base de datos: SELECT, INSERT, UPDATE, DELETE.',
              input: true,
              defaultValue: 'INSERT',
              widget: 'choicesjs',
              tableView: true,
              data: {
                values: [
                  {
                    label: 'SELECT',
                    value: 'SELECT',
                  },
                  {
                    label: 'INSERT',
                    value: 'INSERT',
                  },
                  {
                    label: 'UPDATE',
                    value: 'UPDATE',
                  },
                  {
                    label: 'DELETE',
                    value: 'DELETE',
                  },
                ],
              },
            },
            {
              label: 'Selectores',
              tableView: false,
              key: 'dbConfig.where',
              tooltip:
                'Pares de columna/valor por los cuales ejecutar búsquedas en BBDD. Acepta LIKE al añadir %',
              type: 'datamap',
              input: true,
              conditional: {
                json: {
                  or: [
                    { '===': [{ var: 'data.dbConfig.method' }, 'UPDATE'] },
                    { '===': [{ var: 'data.dbConfig.method' }, 'SELECT'] },
                    { '===': [{ var: 'data.dbConfig.method' }, 'DELETE'] },
                  ],
                },
              },
              valueComponent: {
                type: 'textfield',
                key: 'value',
                label: 'Value',
                input: true,
                hideLabel: true,
                tableView: true,
                logic: [
                  {
                    name: 'Convertir a número si solo contiene dígitos',
                    trigger: {
                      type: 'event',
                      simple: { where: 'true' },
                      event: 'change',
                    },
                    actions: [
                      {
                        name: 'Convertir valor',
                        type: 'customAction',
                        customAction:
                          'value = !isNaN(input) && input.length ? parseFloat(input) : input;',
                      },
                    ],
                  },
                ],
              },
            },
            {
              key: 'dbConfig.hasSequence',
              label: '¿Tiene Secuencia?',
              type: 'checkbox',
              tooltip: 'Secuencia en BBDD.',
              input: true,
              defaultValue: true,
            },
            {
              title: 'Secuencia',
              label: 'Secuencia',
              collapsible: false,
              type: 'panel',
              input: false,
              tableView: false,
              conditional: {
                show: true,
                when: 'dbConfig.hasSequence',
                eq: 'true',
              },
              components: [
                {
                  key: 'dbConfig.sequence.name',
                  label: 'Nombre Secuencia',
                  type: 'textfield',
                  tooltip: 'Nombre de la secuencia.',
                  input: true,
                  defaultValue: 'seq_id_externo',
                },
                {
                  key: 'dbConfig.sequence.column',
                  label: 'Columna Secuencia',
                  type: 'textfield',
                  tooltip: 'Nombre de la columna de la secuencia.',
                  input: true,
                  defaultValue: 'id',
                },
              ],
            },
            {
              key: 'dbConfig.hasMapper',
              label: '¿Mapear Datos?',
              type: 'checkbox',
              tooltip:
                'Mapear datos de formulario a columnas de la tabla de en BBDD de forma personalizada.',
              input: true,
              defaultValue: true,
            },
            {
              title: 'Mapper',
              label: 'Mapper',
              collapsible: false,
              type: 'panel',
              input: false,
              tableView: false,
              conditional: {
                show: true,
                when: 'dbConfig.hasMapper',
                eq: 'true',
              },
              components: [
                {
                  label: 'Mapeador Personalizado',
                  type: 'textarea',
                  editor: 'ace',
                  as: 'javascript',
                  autoExpand: true,
                  tableView: true,
                  key: 'dbConfig.customMapper',
                  tooltip:
                    'Mapeo personalizado de los datos del formulario. Puedes usar data para acceder a this.root.data',
                  input: true,
                  defaultValue: /* javascript */ `const { 
  IdExterno, 
  contactId, 
  callId, 
  interactionId, 
  agentId, 
  campaignId 
} = data.urlParams || {};
const selectedFinal = data['finalLateral'];

// recuperar el id del final seleccionado
const idFinal =
  data.five9?.finales?.dispositions?.find(
    ({ name }) => name === selectedFinal
  )?.id;

// formateadores
const calcAge = (birthdayDate) => {
  const birthDate = new Date(birthdayDate);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};
const formatPhoneNumber = (phoneNumber = '') =>
  phoneNumber.replace(/\D/g, '');

// TODO: Confirmar que mas de un campo se corresponde a la misma columna
const mapToColumns = {
  // id: null /* autogenerado por BBDD */,
  id_externo: IdExterno || contactId,
  id_gestion: callId || interactionId, // ???
  id_final: idFinal,
  id_agente: agentId,
  id_campanya: campaignId,
  telefono_vll: formatPhoneNumber(data['txtTelefono']),
  sys_from: null, // ???
  sys_dnis: ['txtTipoDocumento'],
  observaciones: ['txtObservaciones'],
  fechahora_vll: ['txtFechaHoraVLL'],
  guid: ['txtIdInteraccion'],
  primer_nombre: ['txtPrimerNombre', 'txtNombreCC'],
  segundo_nombre: ['txtSegundoNombre'],
  apellido_paterno: ['txtPrimerApellido'],
  apellido_materno: ['txtSegundoApellido'],
  correo_electronico: ['txtEmail'],
  producto_carrera: ['txtProductoCarrera'],
  centro_docente: ['txtCentroDocente2'],
  sub_grado: ['txtSubGrado'],
  clasificacion: ['txtGenero'],
  nivel_academico_actual: ['txtNivelAcademico'],
  flag_sin_sede: // ¿campo 'sede_deseada' vacío?
    !data['txtSedeEducativa'] && 
    !data['txtSedeDeseada2'],
  edad: calcAge(data['txtFechaNacimiento']),
  fecha_creacion: new Date().toISOString(), // ¿timestamp al hacer INSERT?
  fuente_origen: null, // ???
  detalle_fuente_origen: ['txtMedioPublicitarios'],
  sede_deseada: ['txtSedeEducativa', 'txtSedeDeseada2'],
  nro_documento: ['txtNumDocumento', 'txtDNICC'],
  telefono_movil:
    formatPhoneNumber(data['NumTelefonoMovil']) ||
    formatPhoneNumber(data['txtTelefonoCC']),
  turno_escolar: ['txtTurno', 'txtTurnoEscolar'],
  telefono_madre: null, // ???
  telefono_padre: null, // ???
};

return Object.entries(mapToColumns).reduce(
  (acc, [columnName, keys]) => {
    if (Array.isArray(keys))
      keys.forEach((key) => {
        if (data[key] && !acc[columnName]) acc[columnName] = data[key];
      });

    // asignar valor por defecto si no se encuentra en el mapeo
    acc[columnName] ??=
      (!Array.isArray(mapToColumns[columnName]) && 
      mapToColumns[columnName]) || null;

    return acc;
  }, {});`,
                },
              ],
            },
          ],
        },
      ]),
    ],
    ...extend
  );
