// Ayudas en español que aparecen al tocar el botón ⓘ junto a cada campo.
// Si un campo no tiene ayuda aquí, se muestra la descripción original de la API.

export const HELP = {
  // Fechas
  from: 'Fecha y hora desde la que quieres ver datos. Si la dejas vacía, Botmaker usa un valor automático (normalmente las últimas 24 horas o el inicio del mes).',
  to: 'Fecha y hora hasta la que quieres ver datos. Si la dejas vacía, se usa el momento actual.',
  'billing-period': 'Elige el mes del que quieres ver el consumo.',
  billingPeriod: 'Elige el mes del que quieres ver las conversaciones de WhatsApp cobradas.',
  daysBeforeNow: 'Cuántos días hacia atrás buscar. Por ejemplo, 30 muestra los tickets del último mes.',

  // Conversaciones
  chat: 'La conversación a la que se enviará. Elige el canal y escribe el número del cliente.',
  chats: 'Las conversaciones en las que se ejecutará la acción.',
  chatReference: 'La conversación con la que quieres trabajar. Puedes pegar el código que aparece al final del enlace de la conversación en Botmaker (go.botmaker.com/#/chat/CÓDIGO) o el número de teléfono del cliente.',
  'chat-id': 'El código de la conversación en Botmaker. Lo ves al final del enlace de la conversación: go.botmaker.com/#/chat/CÓDIGO. Si lo usas, no hace falta elegir canal ni cliente.',
  chatId: 'El código de la conversación en Botmaker. Lo ves al final del enlace de la conversación: go.botmaker.com/#/chat/CÓDIGO.',
  'channel-id': 'El canal por el que habla el cliente (por ejemplo, tu línea de WhatsApp).',
  channelId: 'El canal por el que habla el cliente (por ejemplo, tu línea de WhatsApp).',
  'channel-ids': 'Elige uno o varios canales para filtrar.',
  'contact-id': 'El número o identificador del cliente en ese canal. En WhatsApp es su número con código de país, sin espacios ni "+". Ejemplo: 5215512345678.',
  contactId: 'El número o identificador del cliente en ese canal. En WhatsApp es su número con código de país, sin espacios ni "+". Ejemplo: 5215512345678.',
  name: 'Nombre y/o apellido del cliente que buscas.',
  emails: 'Uno o varios correos. Escribe uno y presiona "Agregar".',
  'long-term-search': 'Actívalo solo si necesitas datos de hace más de 7 días. Ojo: esta búsqueda suma al consumo de datos de tu cuenta.',
  'only-users-never-talked': 'Muestra solo clientes que nunca iniciaron una conversación.',
  'chat-platform': 'Muestra solo los mensajes de una plataforma (WhatsApp, Messenger, web…).',
  limit: 'Cuántos resultados quieres como máximo en esta consulta.',
  'next-page-token': 'Se llena solo cuando usas "Cargar más". No necesitas escribir nada.',
  'has-whastapp-bsuid': 'Muestra solo contactos que tienen WhatsApp vinculado.',
  platform: 'Muestra solo los canales de una plataforma.',
  active: 'Elige "Sí" para ver solo lo que está activo.',
  'file-url': 'Pega el enlace privado del archivo (lo encuentras en los mensajes descargados).',
  'expire-minutes': 'Cuántos minutos funcionará el enlace antes de expirar. Si lo dejas vacío, dura 3 minutos.',

  // Sesiones
  'include-open-sessions': 'Normalmente solo se descargan atenciones terminadas. Actívalo para incluir también las que siguen en curso.',
  'include-messages': 'Incluye todos los mensajes de cada atención. El archivo será más grande.',
  'include-variables': 'Incluye los datos que el bot guardó del cliente (nombre, correo, respuestas…).',
  'include-events': 'Incluye lo que pasó en cada atención (transferencias, asignaciones, cierres…).',
  'include-ai-analysis': 'Incluye el análisis automático de calidad hecho por IA, si lo tienes activado.',
  'timestamp-precision': 'Qué tan exacta quieres la hora. "Segundos" es suficiente para casi todo.',

  // Agentes y equipo
  online: 'Elige "Sí" para ver solo agentes conectados, o "No" para ver solo los desconectados.',
  idOrEmail: 'El agente que quieres modificar.',
  role: 'El rol define qué puede hacer el agente. Administrador puede todo; Operador solo atiende conversaciones.',
  slots: 'Cuántas conversaciones puede atender el agente al mismo tiempo (de 0 a 30).',
  priority: 'Qué tan seguido se le asignan conversaciones a este agente frente a los demás.',
  queues: 'Las colas (áreas) de las que recibe o filtra conversaciones.',
  alias: 'El nombre que verán los clientes antes de cada mensaje del agente.',
  email: 'Correo electrónico. Ejemplo: nombre@empresa.com',
  password: 'Contraseña inicial del agente.',
  operatorsIds: 'Elige uno o varios agentes para filtrar.',
  'agent-ids': 'Elige uno o varios agentes para filtrar.',
  rolesIds: 'Elige uno o varios roles para filtrar.',
  groups: 'Nombres de grupos de agentes para filtrar.',
  includeSubgroups: 'Incluye también los subgrupos de los grupos elegidos.',
  'online-status': 'Filtra por el estado del agente (conectado, ausente…).',
  'session-status': 'Filtra por el estado de la atención (abierta o cerrada).',
  'agent-email': 'Muestra las tipificaciones que puede usar este agente.',
  queue: 'Muestra las tipificaciones de esta cola.',

  // Plantillas y WhatsApp
  state: 'Muestra solo plantillas aprobadas o solo rechazadas.',
  isPaginated: 'Divide la lista en páginas de 200 plantillas para que cargue más rápido.',
  number: 'Tu número de WhatsApp, con código de país.',

  // Bot
  intentIdOrName: 'La respuesta del bot que quieres activar. También puedes elegir el nombre de una plantilla de WhatsApp.',
  postActionIntentIdOrName: 'Opcional: otra respuesta del bot que se ejecutará al terminar la primera.',
  variables: 'Datos que se guardarán en la conversación antes de ejecutar la acción. Escribe el nombre del dato y su valor. Ejemplo: nombre → Ana.',
  tags: 'Etiquetas que se prenderán o apagarán en la conversación.',
  onlyTags: 'Elige "Sí" para ver solo las etiquetas (sin las demás variables).',
  webhookPayload: 'Texto libre para identificar este envío en tus propios sistemas. Si no sabes qué es, déjalo vacío.',
  entityName: 'El nombre de la lista de sinónimos.',

  // Mensajes
  text: 'El texto del mensaje. Puedes poner *negritas* entre asteriscos y _cursivas_ entre guiones bajos.',
  messages: 'Uno o varios mensajes que se enviarán en orden. Usa "Agregar" para sumar otro.',
  media: 'Adjunta un archivo (imagen, video, documento o audio) usando su enlace público.',
  buttons: 'Botones que el cliente podrá tocar para responder.',
  location: 'Envía una ubicación en el mapa.',
  subject: 'Solo para canales de correo: el asunto del correo.',
  html: 'Solo para canales de correo. Si no sabes qué es, déjalo vacío.',
  typing: 'Muestra al cliente que alguien está escribiendo.',
  reaction: 'El emoji de la reacción. Ejemplo: 👍',
  messageId: 'El identificador del mensaje. Lo encuentras en la descarga de mensajes.',

  // Catálogo
  catalogId: 'El catálogo con el que quieres trabajar.',
  categoryCode: 'La categoría de productos.',
  sku: 'El código único del producto.',
  zoneCode: 'La zona de entrega.',
  code: 'El código único de este elemento.',
  platformOrPlatformCatalogId: 'La tienda en línea conectada (por ejemplo, vtex o shopify) o el código del catálogo en esa tienda.',
  price: 'Precio en números, sin símbolo de moneda. Ejemplo: 199.90',
  availability: 'Si el producto está disponible o agotado.',

  // Reportes
  auditSection: 'La parte de tu cuenta de la que quieres ver los cambios.',
  authors: 'Correos o IDs de las personas que hicieron cambios, separados por coma.',
  'authors-roles': 'Muestra solo los cambios hechos por personas con este rol.',
  actions: 'Muestra solo creaciones, cambios o borrados. Déjalo vacío para ver todo.',
  'search-keyword': 'Una palabra o código para buscar entre los cambios (por ejemplo, el nombre de una plantilla).',
  businessId: 'Filtra por una cuenta de negocio específica. Normalmente se deja vacío.',

  // Envíos
  'notification-name': 'Nombre del envío. Si lo escribes, se ignoran las fechas.',
  notificationInstanceId: 'El envío del que quieres ver el detalle. Puedes escribir su nombre y se mostrará el más reciente.',
  contact: 'El cliente que quieres quitar de la lista (su número con código de país).',

  // Tickets
  ticketCode: 'El código del ticket. Ejemplo: TCK-1234.',
  offset: 'Para ver resultados más atrás: salta esta cantidad de tickets.',

  // Webhooks
  webhookId: 'La conexión (webhook) con la que quieres trabajar.',
  ruleId: 'El código de la regla de redirección. Lo encuentras al ver el webhook.',
};

// Traducción de opciones fijas (listas desplegables y valores en resultados).
export const ENUM_LABELS = {
  // Roles
  ADMIN: 'Administrador',
  CONFIGURATOR: 'Configurador',
  SUPERVISOR: 'Supervisor',
  OPERATOR: 'Operador (agente)',
  // Tipos de cambio
  CREATE: 'Creación',
  UPDATE: 'Cambio',
  DELETE: 'Borrado',
  // Estados
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  PENDING: 'En revisión',
  IN_STOCK: 'Disponible',
  OUT_OF_STOCK: 'Agotado',
  // Prioridad
  never: 'Nunca',
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  // Precisión
  seconds: 'Segundos',
  milliseconds: 'Milisegundos',
  // Plataformas
  whatsapp: 'WhatsApp',
  googlechat: 'Google Chat',
  messenger: 'Facebook Messenger',
  webchat: 'Chat web',
  'voice-text': 'Voz',
  telegram: 'Telegram',
  msteams: 'Microsoft Teams',
  workplace: 'Workplace',
  'google-business-messages': 'Google Business Messages',
  twitter: 'Twitter / X',
  webhook: 'Webhook',
  assistant: 'Asistente',
  skyhub: 'Skyhub',
  'conversational-web': 'Web conversacional',
  gmail: 'Gmail',
  instagram: 'Instagram',
  instagram_chat: 'Instagram (mensajes directos)',
  instagram_media: 'Instagram (comentarios en publicaciones)',
  open_central: 'Open Central',
  facebook: 'Facebook',
  email: 'Correo electrónico',
  sms: 'SMS',
  // Secciones de auditoría
  agent: 'Agentes',
  'agent-state': 'Estado de agentes',
  'agent-login': 'Inicios de sesión de agentes',
  variables: 'Variables',
  role: 'Roles',
  bot: 'Bot',
  'quick-response': 'Respuestas rápidas',
  channel: 'Canales',
  'whatsapp-template': 'Plantillas de WhatsApp',
  intent: 'Respuestas del bot',
  'out-of-office': 'Fuera de horario',
  'contacts-group': 'Grupos de contactos',
  'console-user-invitation': 'Invitaciones de usuarios',
  notification: 'Envíos',
  'code-action': 'Acciones de código',
  campaign: 'Campañas',
  constants: 'Datos fijos',
  config: 'Configuración',
  typification: 'Tipificaciones',
  queue: 'Colas de atención',
  'audience-push': 'Envíos a audiencias',
};

export const enumLabel = (v) => ENUM_LABELS[v] ?? String(v);

// Limpia descripciones originales (markdown/HTML) para mostrarlas como texto plano.
export function cleanDescription(text) {
  if (!text) return '';
  return String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`_#]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
