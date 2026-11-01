export const POLICY_VERSION = '1.0';

export const PRIVACY_NOTICE = {
  version: POLICY_VERSION,
  title: 'Aviso de Privacidad de TUT0Hub',
  updatedAt: '2026-10-01',
  controller:
    'TUT0Hub es responsable del tratamiento de tus datos personales.',
  sections: [
    {
      heading: 'Datos que recabamos',
      body: 'Nombre de usuario, correo electrónico, contraseña (almacenada de forma cifrada), dirección IP al momento del registro y datos de uso de la aplicación (favoritos, historial).',
    },
    {
      heading: 'Finalidades',
      body: 'Crear y administrar tu cuenta, autenticarte, personalizar tu experiencia, enviarte códigos de seguridad y mejorar la aplicación.',
    },
    {
      heading: 'Transferencias',
      body: 'No vendemos ni compartimos tus datos personales con terceros con fines comerciales. TUT0Hub no muestra publicidad.',
    },
    {
      heading: 'Derechos ARCO',
      body: 'Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos en cualquier momento desde tu perfil o escribiendo al correo de contacto de la aplicación.',
    },
    {
      heading: 'Conservación',
      body: 'Conservamos tus datos mientras tu cuenta esté activa. Al eliminarla, tus datos personales se borran.',
    },
    {
      heading: 'Consentimiento',
      body: 'Al registrarte confirmas que leíste este aviso y consientes el tratamiento de tus datos personales para las finalidades descritas. Se guardará la fecha y versión de tu aceptación.',
    },
  ],
};