//import { Components } from '@formio/react';
const { Components } = globalThis.Formio;
import { editForm } from './edit.form.js';

const BaseComponent = Components.components.button;
export const f9finalizarKey = 'five9Finalizar';

export default class F9FinalizarComponent extends BaseComponent {
  static schema(...extend) {
    return BaseComponent.schema(
      {
        label: 'Finalizar',
        action: 'submit',
        showValidations: false,
        theme: 'success',
        size: 'lg',
        leftIcon: 'fa fa-check',
        tableView: false,
        key: f9finalizarKey,
        type: f9finalizarKey,
        input: true,
        defaultValue: false,
        saveOnEnter: false,
      },
      ...extend
    );
  }

  static get builderInfo() {
    return {
      title: 'Finalizar',
      group: 'five9',
      icon: 'fa fa-handshake-o',
      weight: 30,
      schema: F9FinalizarComponent.schema(),
    };
  }

  static editForm = editForm;

  constructor(component, options, data) {
    super(component, options, data);
    this.filesUploading = [];
  }

  init() {
    super.init();
    this.on('submit', async (event) => {
      console.log('submit', { event });

      // Validar el formulario utilizando las validaciones propias de Formio
      const isValid = this.root.checkValidity(
        this.root.data,
        true,
        this.root.data
      );

      if (!isValid) {
        // Si el formulario no es válido, muestra los errores y termina el flujo.
        this.root.showErrors();
        return;
      }

      try {
        // Guardar en BBDD
        const dbResponse = await this.saveSubmission();

        if (!dbResponse)
          throw new Error('No se han guardado los datos en BBDD.');

        // Hacer la disposición de la llamada en Five9
        return await this.disposeCall(dbResponse[0]?.id_final);
      } catch (error) {
        console.warn({ error });
      }
    });
  }

  render() {
    if (this.viewOnly || this.options.hideButtons) {
      this._visible = false;
    }
    return super
      .render(
        this.renderTemplate('button', {
          component: this.component,
          input: this.inputInfo,
        })
      )
      .replace(/&nbsp;/g, '');
  }

  attach(element) {
    this.loadRefs(element, {
      button: 'single',
      buttonMessageContainer: 'single',
      buttonMessage: 'single',
    });

    return super.attach(element);
  }

  async disposeCall(dispositionId) {
    const { urlParams, five9 } = this.root.data;
    if (!urlParams || !five9) return;

    let { interactionId, agentId, stage: environment } = urlParams;

    if (!interactionId) {
      const [{ interactionId: fetchedInteractionId }] = await fetch(
        `https://app-atl.five9.com/appsvcs/rs/svc/agents/${agentId}/interactions`,
        { credentials: 'include' }
      )
        .then((res) => res.json())
        .catch(console.warn);
      interactionId = fetchedInteractionId;
    }

    const method = 'PUT';
    const action = `/agents/${agentId}/interactions/calls/${interactionId}/dispose`;
    const farmId = five9.auth.context?.farmId;
    const tokenId = five9.auth.tokenId;
    const data = { dispositionId };

    return await fetch(
      `https://api.konecta.cloud/kcrm-wolk-gen/${environment}/v1/five9/call`,
      {
        method: 'POST',
        mode: 'cors',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ method, action, farmId, tokenId, data }),
      }
    ).catch(console.warn);
  }

  async saveSubmission() {
    const {
      database,
      scheme,
      table,
      method,
      hasSequence,
      hasMapper,
      sequence,
      where,
    } = this.component.dbConfig;
    const { stage: environment } = this.root.data.urlParams ?? {};
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    return await fetch(
      `https://api.konecta.cloud/kcrm-sincrm/${environment}/v1/crmless/call`,
      {
        mode: 'cors',
        method: 'POST',
        headers,
        body: JSON.stringify({
          database,
          scheme,
          table,
          method,
          ...(Object.keys(where ?? {}).length && { where }),
          ...(hasSequence && { sequence }),
          ...(hasMapper &&
            (method === 'INSERT' || method === 'UPDATE') && {
              data: this.customMapSubmission(),
            }),
          // data: this.mapSubmission(this.root.data),
        }),
      }
    )
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `Error al guardar en BBDD:\nHTTP Error ${res.status}! ${res.statusText}`
          );
        return res.json();
      })
      .catch(console.warn);
  }

  mapSubmission(data = {}) {
    const { IdExterno, contactId, callId, interactionId, agentId, campaignId } =
      data.urlParams ?? {};
    const selectedFinal = data['finalLateral'];

    // recuperar el id del final seleccionado
    const idFinal =
      data.five9?.finales?.dispositions?.find(
        ({ name }) => name === selectedFinal
      )?.id ??
      // recuperar de la lista hardcodeada en componente idFinal del formulario
      // esto NO GENERA DISPOSICIÓN en Five9 -> TODO: registrar todos los finales en la adminConsole de five9
      this.form
        ?.getComponent('idFinal')
        ?.component.mapItems.find(({ mapKey }) => mapKey === selectedFinal)
        ?.mapValue;

    /**
     * Calcula la edad en años a partir de una fecha de nacimiento
     * @param {number | string | Date} birthdayDate fecha de nacimiento
     * @returns {number} edad calculada
     */
    const calcAge = (birthdayDate) => {
      const birthDate = new Date(birthdayDate);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    /**
     * Elimina todo lo que no sea un dígito (0-9)
     * @param {string} [phoneNumber=''] Número de telefono
     * @returns {string} Número de telefono sin caracteres no numéricos
     */
    const formatPhoneNumber = (phoneNumber = '') =>
      phoneNumber?.replace(/\D/g, '');

    // TODO: Confirmar que mas de un campo se corresponde a la misma columna
    const mapColumnsToKeys = {
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
      flag_sin_sede: !data['txtSedeEducativa'] && !data['txtSedeDeseada2'], // ¿campo 'sede_deseada' vacío?
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

    return Object.entries(mapColumnsToKeys).reduce(
      (acc, [columnName, keys]) => {
        if (Array.isArray(keys))
          keys.forEach((key) => {
            if (data[key] && !acc[columnName]) acc[columnName] = data[key];
          });

        acc[columnName] ??=
          (!Array.isArray(mapColumnsToKeys[columnName]) &&
            (mapColumnsToKeys[columnName] ?? null)) ||
          null;

        return acc;
      },
      {}
    );
  }

  customMapSubmission() {
    const {
      component: {
        dbConfig: { customMapper },
      },
      root: { data },
    } = this;
    if (!customMapper) return data;
    const mapper = new Function('data', customMapper);
    return mapper(data) ?? data;
  }
}

// Registrar el componente con Formio
Components.addComponent(f9finalizarKey, F9FinalizarComponent);
