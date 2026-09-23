// Catálogo de acciones en lenguaje sencillo.
// Clave: "MÉTODO /ruta" tal como aparece en document.json.
//
// Campos:
//   name     Nombre de la acción (verbo + objeto, como una tarea).
//   desc     Explicación en una frase, sin tecnicismos.
//   cat      Categoría de tarea (ver CATEGORIES).
//   danger   'delete'   → borra algo: botón rojo + confirmación.
//            'critical' → puede dejar sin acceso a todo el equipo: hay que escribir una palabra para confirmar.
//   confirm  Texto de confirmación para acciones que llegan a clientes reales.
//   hidden   No se muestra (acciones obsoletas).

export const CATEGORIES = [
  { id: 'conversaciones', icon: 'MessagesSquare', name: 'Conversaciones y contactos', desc: 'Busca clientes, revisa conversaciones y descarga el historial de mensajes.' },
  { id: 'enviar', icon: 'Send', name: 'Enviar mensajes y campañas', desc: 'Escribe a un cliente, activa respuestas del bot o envía campañas masivas.' },
  { id: 'whatsapp', icon: 'Smartphone', name: 'WhatsApp: plantillas y números', desc: 'Crea y revisa plantillas de WhatsApp y el estado de tus números.' },
  { id: 'equipo', icon: 'Users', name: 'Mi equipo', desc: 'Agentes, roles, colas de atención y tipificaciones.' },
  { id: 'tickets', icon: 'Ticket', name: 'Tickets', desc: 'Crea, busca y actualiza tickets de seguimiento.' },
  { id: 'catalogo', icon: 'ShoppingBag', name: 'Catálogo y tienda', desc: 'Productos, categorías, sucursales, zonas de entrega y precios.' },
  { id: 'reportes', icon: 'BarChart3', name: 'Reportes y consumo', desc: 'Rendimiento de agentes, consumo facturado e historial de cambios.' },
  { id: 'bot', icon: 'Bot', name: 'Bot y conocimiento', desc: 'Respuestas del bot, bases de conocimiento, variables y datos fijos.' },
  { id: 'avanzado', icon: 'Wrench', name: 'Avanzado (soporte técnico)', desc: 'Conexiones técnicas y credenciales. Úsalo solo si soporte te lo pide.', advanced: true },
];

export const ACTIONS = {
  // ─── Conversaciones y contactos ───────────────────────────────────────────
  'GET /chats': { cat: 'conversaciones', name: 'Buscar conversaciones', desc: 'Lista las conversaciones más recientes o busca una por nombre, correo o número del cliente.' },
  'GET /chats/{chatReference}': { cat: 'conversaciones', name: 'Ver una conversación', desc: 'Muestra los datos de una conversación: cliente, etiquetas, variables y agente asignado.' },
  'PATCH /chats/{chatReference}': { cat: 'conversaciones', name: 'Editar datos de una conversación', desc: 'Cambia el nombre, correo, variables o etiquetas guardadas de un cliente.' },
  'GET /chats/variables': { cat: 'conversaciones', name: 'Ver historial de variables de una conversación', desc: 'Muestra qué datos se guardaron en una conversación y cuándo.' },
  'GET /messages': { cat: 'conversaciones', name: 'Descargar mensajes', desc: 'Descarga los mensajes enviados y recibidos en un periodo de tiempo.' },
  'GET /sessions': { cat: 'conversaciones', name: 'Descargar sesiones de atención', desc: 'Descarga cada atención completa (inicio, fin, mensajes y análisis) de un periodo.' },
  'GET /calls': { cat: 'conversaciones', name: 'Ver llamadas', desc: 'Lista las llamadas realizadas en un periodo o con un cliente.' },
  'GET /contacts': { cat: 'conversaciones', name: 'Descargar contactos', desc: 'Descarga tu lista de contactos (clientes) con sus datos.' },
  'GET /channels': { cat: 'conversaciones', name: 'Ver mis canales', desc: 'Lista tus canales (WhatsApp, Messenger, web, etc.) y si están activos.' },
  'GET /private-media/temp-access-link': { cat: 'conversaciones', name: 'Abrir un archivo privado', desc: 'Genera un enlace temporal para ver un archivo (foto, documento) que envió un cliente.' },

  // ─── Enviar mensajes y campañas ───────────────────────────────────────────
  'POST /chats-actions/send-messages': { cat: 'enviar', name: 'Enviar un mensaje a un cliente', desc: 'Envía texto, imágenes, botones o ubicación a una conversación abierta.', confirm: 'El mensaje le llegará al cliente de inmediato.' },
  'POST /chats-actions/trigger-intent': { cat: 'enviar', name: 'Activar una respuesta del bot', desc: 'Hace que el bot ejecute una de sus respuestas (o envíe una plantilla) en una conversación.', confirm: 'El bot le escribirá al cliente de inmediato.' },
  'POST /chats-actions/batch/trigger-intent': { cat: 'enviar', name: 'Activar una respuesta del bot en muchas conversaciones', desc: 'Igual que la anterior, pero para varios clientes a la vez.', confirm: 'El bot les escribirá a todos los clientes de la lista.' },
  'POST /chats-actions/send-read-typing-feedback': { cat: 'enviar', name: 'Mostrar "leído" o "escribiendo…"', desc: 'Muestra al cliente que su mensaje fue leído o que alguien está escribiendo.' },
  'POST /chats-actions/send-reaction': { cat: 'enviar', name: 'Reaccionar a un mensaje', desc: 'Agrega un emoji como reacción a un mensaje del cliente.' },
  'DELETE /chats-actions/send-reaction': { cat: 'enviar', name: 'Quitar una reacción', desc: 'Elimina el emoji que se puso como reacción a un mensaje.', danger: 'delete' },
  'POST /chats-actions/start-call': { cat: 'enviar', name: 'Iniciar una llamada', desc: 'Llama a un cliente desde una conversación.', confirm: 'Se iniciará una llamada real con el cliente.' },
  'POST /chats-actions/commerce/send-products-message': { cat: 'enviar', name: 'Enviar productos del catálogo', desc: 'Envía a un cliente uno o varios productos de tu catálogo.', confirm: 'El mensaje le llegará al cliente de inmediato.' },
  'POST /chats-actions/commerce/checkout-cart': { cat: 'enviar', name: 'Enviar carrito de compra', desc: 'Envía al cliente un carrito listo para pagar.', confirm: 'El carrito le llegará al cliente de inmediato.' },
  'POST /chats-actions/send-products': { cat: 'enviar', name: 'Enviar productos (versión antigua)', desc: 'Versión obsoleta.', hidden: true },
  'POST /notifications': { cat: 'enviar', name: 'Enviar una campaña (notificación)', desc: 'Envía una plantilla de WhatsApp a una lista de clientes.', confirm: 'La campaña les llegará a todos los clientes de la lista.' },
  'GET /notifications/campaigns': { cat: 'enviar', name: 'Ver campañas', desc: 'Lista tus campañas de envío masivo.' },
  'POST /notifications/campaigns': { cat: 'enviar', name: 'Crear una campaña', desc: 'Crea una campaña nueva para agrupar envíos masivos.' },
  'GET /notifications/sent-results': { cat: 'enviar', name: 'Ver resultados de envíos', desc: 'Muestra cuántos mensajes se entregaron, leyeron o fallaron en tus envíos.' },
  'GET /notifications/sent-results/{notificationInstanceId}': { cat: 'enviar', name: 'Ver detalle de un envío', desc: 'Muestra, cliente por cliente, qué pasó con un envío.' },
  'GET /notifications/contacts-blacklist': { cat: 'enviar', name: 'Ver lista de no contactar', desc: 'Clientes que pidieron no recibir campañas.' },
  'POST /notifications/contacts-blacklist': { cat: 'enviar', name: 'Agregar a la lista de no contactar', desc: 'Evita que estos clientes reciban campañas.' },
  'DELETE /notifications/contacts-blacklist/{contact}': { cat: 'enviar', name: 'Quitar de la lista de no contactar', desc: 'El cliente volverá a recibir campañas.', danger: 'delete' },

  // ─── WhatsApp ─────────────────────────────────────────────────────────────
  'GET /whatsapp/templates': { cat: 'whatsapp', name: 'Ver plantillas de WhatsApp', desc: 'Lista tus plantillas y si están aprobadas o rechazadas.' },
  'GET /whatsapp/templates/{idOrName}': { cat: 'whatsapp', name: 'Ver una plantilla de WhatsApp', desc: 'Muestra el contenido y el estado de una plantilla.' },
  'POST /whatsapp/templates': { cat: 'whatsapp', name: 'Crear una plantilla de WhatsApp', desc: 'Crea una plantilla nueva y la manda a revisión de WhatsApp.' },
  'DELETE /whatsapp/templates/{idOrName}': { cat: 'whatsapp', name: 'Borrar una plantilla de WhatsApp', desc: 'Elimina la plantilla. Ya no se podrá usar para enviar mensajes.', danger: 'delete' },
  'GET /whatsapp/accounts': { cat: 'whatsapp', name: 'Ver mis números de WhatsApp', desc: 'Lista tus líneas de WhatsApp conectadas.' },
  'GET /whatsapp/accounts/{number}': { cat: 'whatsapp', name: 'Ver un número de WhatsApp', desc: 'Muestra los datos de una línea de WhatsApp.' },
  'GET /whatsapp/accounts/{number}/status': { cat: 'whatsapp', name: 'Ver estado y calidad de un número', desc: 'Revisa si tu número funciona bien y su nivel de calidad ante WhatsApp.' },
  'POST /whatsapp/accounts': { cat: 'whatsapp', name: 'Conectar un número de WhatsApp nuevo', desc: 'Inicia el proceso para agregar una línea de WhatsApp.' },

  // ─── Mi equipo ────────────────────────────────────────────────────────────
  'GET /agents': { cat: 'equipo', name: 'Ver agentes', desc: 'Lista a las personas que atienden conversaciones y si están en línea.' },
  'POST /agents': { cat: 'equipo', name: 'Agregar un agente', desc: 'Da de alta a una persona para que atienda conversaciones.' },
  'PATCH /agents/{idOrEmail}': { cat: 'equipo', name: 'Editar un agente', desc: 'Cambia el rol, colas, prioridad o cantidad de chats de un agente.' },
  'POST /agents/{id}/actions/logout': { cat: 'equipo', name: 'Desconectar a un agente', desc: 'Cierra la sesión de un agente que se fue sin desconectarse.' },
  'DELETE /agents/{id}': { cat: 'equipo', name: 'Quitar un agente', desc: 'El agente dejará de tener acceso y de recibir conversaciones.', danger: 'delete' },
  'GET /roles': { cat: 'equipo', name: 'Ver roles personalizados', desc: 'Lista los roles (tipos de permiso) que creaste para tu equipo.' },
  'GET /roles/{idOrName}': { cat: 'equipo', name: 'Ver un rol', desc: 'Muestra los permisos de un rol.' },
  'POST /roles': { cat: 'equipo', name: 'Crear un rol', desc: 'Crea un tipo de permiso nuevo para tus agentes.' },
  'PATCH /roles/{idOrName}': { cat: 'equipo', name: 'Editar un rol', desc: 'Cambia los permisos de un rol.' },
  'GET /attention-queues': { cat: 'equipo', name: 'Ver colas de atención', desc: 'Lista las colas (áreas) a las que llegan las conversaciones.' },
  'GET /attention-queues/{id}': { cat: 'equipo', name: 'Ver una cola de atención', desc: 'Muestra los datos de una cola.' },
  'PATCH /attention-queues': { cat: 'equipo', name: 'Editar una cola de atención', desc: 'Cambia el nombre o la capacidad de una cola.' },
  'GET /typifications': { cat: 'equipo', name: 'Ver tipificaciones', desc: 'Lista los motivos de cierre que usan los agentes al terminar una conversación.' },

  // ─── Tickets ──────────────────────────────────────────────────────────────
  'GET /tickets': { cat: 'tickets', name: 'Ver tickets', desc: 'Lista los tickets creados en los últimos días.' },
  'GET /tickets/{ticketCode}': { cat: 'tickets', name: 'Buscar un ticket', desc: 'Busca un ticket por su código.' },
  'POST /tickets': { cat: 'tickets', name: 'Crear un ticket', desc: 'Registra un caso nuevo para darle seguimiento.' },
  'PUT /tickets/{ticketCode}': { cat: 'tickets', name: 'Actualizar un ticket', desc: 'Cambia el estado, responsable o datos de un ticket.' },
  'GET /tickets/field-definitions': { cat: 'tickets', name: 'Ver campos de los tickets', desc: 'Lista los campos personalizados que tienen tus tickets.' },

  // ─── Catálogo y tienda ────────────────────────────────────────────────────
  'GET /ecommerce/catalogs': { cat: 'catalogo', name: 'Ver catálogos', desc: 'Lista tus catálogos de productos.' },
  'POST /ecommerce/catalogs': { cat: 'catalogo', name: 'Crear un catálogo', desc: 'Crea un catálogo nuevo para ofrecer productos por WhatsApp.' },
  'GET /ecommerce/catalogs/{catalogId}/products': { cat: 'catalogo', name: 'Ver productos', desc: 'Lista los productos de un catálogo, opcionalmente de una categoría.' },
  'GET /ecommerce/catalogs/{catalogId}/products/{sku}': { cat: 'catalogo', name: 'Ver un producto', desc: 'Muestra los datos de un producto por su código.' },
  'POST /ecommerce/catalogs/{catalogId}/products': { cat: 'catalogo', name: 'Agregar o actualizar productos', desc: 'Crea productos nuevos o actualiza los existentes (precio, foto, existencia…).' },
  'DELETE /ecommerce/catalogs/{catalogId}/products/{sku}': { cat: 'catalogo', name: 'Borrar un producto', desc: 'Elimina un producto del catálogo.', danger: 'delete' },
  'POST /ecommerce/catalogs/{catalogId}/products/batch/delete': { cat: 'catalogo', name: 'Borrar varios productos', desc: 'Elimina varios productos del catálogo a la vez.', danger: 'delete' },
  'GET /ecommerce/catalogs/{catalogId}/categories': { cat: 'catalogo', name: 'Ver categorías', desc: 'Lista las categorías de un catálogo.' },
  'POST /ecommerce/catalogs/{catalogId}/categories': { cat: 'catalogo', name: 'Agregar o actualizar categorías', desc: 'Crea o cambia categorías para ordenar tus productos.' },
  'DELETE /ecommerce/catalogs/{catalogId}/categories/{categoryCode}': { cat: 'catalogo', name: 'Borrar una categoría', desc: 'Elimina una categoría del catálogo.', danger: 'delete' },
  'GET /ecommerce/catalogs/{catalogId}/stores': { cat: 'catalogo', name: 'Ver sucursales', desc: 'Lista las sucursales (tiendas) de un catálogo y su inventario.' },
  'POST /ecommerce/catalogs/{catalogId}/stores': { cat: 'catalogo', name: 'Agregar o actualizar sucursales', desc: 'Crea sucursales o actualiza qué productos tiene cada una.' },
  'DELETE /ecommerce/catalogs/{catalogId}/stores/{code}': { cat: 'catalogo', name: 'Borrar una sucursal', desc: 'Elimina una sucursal del catálogo.', danger: 'delete' },
  'POST /ecommerce/catalogs/{catalogId}/stores/batch/delete': { cat: 'catalogo', name: 'Borrar varias sucursales', desc: 'Elimina varias sucursales a la vez.', danger: 'delete' },
  'GET /ecommerce/catalogs/{catalogId}/zones': { cat: 'catalogo', name: 'Ver zonas de entrega', desc: 'Lista las zonas de entrega de un catálogo.' },
  'GET /ecommerce/catalogs/{catalogId}/zones/{zoneCode}': { cat: 'catalogo', name: 'Ver una zona de entrega', desc: 'Muestra los datos de una zona.' },
  'POST /ecommerce/catalogs/{catalogId}/zones': { cat: 'catalogo', name: 'Agregar o actualizar zonas de entrega', desc: 'Crea o cambia zonas y qué sucursales las atienden.' },
  'DELETE /ecommerce/catalogs/{catalogId}/zones/{zoneCode}': { cat: 'catalogo', name: 'Borrar una zona de entrega', desc: 'Elimina una zona de entrega.', danger: 'delete' },
  'POST /ecommerce/catalogs/{catalogId}/zones/batch/delete': { cat: 'catalogo', name: 'Borrar varias zonas de entrega', desc: 'Elimina varias zonas a la vez.', danger: 'delete' },
  'GET /ecommerce/catalogs/{catalogId}/price-schemas': { cat: 'catalogo', name: 'Ver listas de precios', desc: 'Lista los precios especiales por zona de un catálogo.' },
  'GET /ecommerce/catalogs/{catalogId}/price-schemas/{zoneCode}': { cat: 'catalogo', name: 'Ver precios de una zona', desc: 'Muestra los precios especiales de una zona.' },
  'POST /ecommerce/catalogs/{catalogId}/price-schemas': { cat: 'catalogo', name: 'Agregar o actualizar lista de precios', desc: 'Define precios especiales por zona.' },
  'POST /ecommerce/catalogs/{catalogId}/platform-integrations': { cat: 'catalogo', name: 'Conectar con tienda externa', desc: 'Conecta tu catálogo con una tienda en línea (por ejemplo, VTEX o Shopify).' },
  'POST /ecommerce/catalogs/{catalogId}/platform-integrations/{platformOrPlatformCatalogId}/sync': { cat: 'catalogo', name: 'Sincronizar con tienda externa', desc: 'Trae los productos actualizados desde tu tienda en línea.' },
  'DELETE /ecommerce/catalogs/{catalogId}/platform-integrations/{platformOrPlatformCatalogId}': { cat: 'catalogo', name: 'Desconectar tienda externa', desc: 'El catálogo dejará de actualizarse desde tu tienda en línea.', danger: 'delete' },

  // ─── Reportes y consumo ───────────────────────────────────────────────────
  'GET /dashboards/agent-performance': { cat: 'reportes', name: 'Rendimiento de agentes', desc: 'Cuántas conversaciones atendió cada agente y en cuánto tiempo.' },
  'GET /dashboards/agent-metrics': { cat: 'reportes', name: 'Métricas de agentes', desc: 'Indicadores de atención por agente, canal y cola.' },
  'GET /billing/consumptions': { cat: 'reportes', name: 'Ver consumo del mes', desc: 'Muestra lo que consumió tu cuenta en un mes.' },
  'GET /billing/whatsapp/billed-conversations': { cat: 'reportes', name: 'Ver conversaciones de WhatsApp cobradas', desc: 'Lista qué conversaciones de WhatsApp tienen costo.' },
  'GET /audits/{auditSection}': { cat: 'reportes', name: 'Ver historial de cambios', desc: 'Quién cambió qué y cuándo en tu cuenta (agentes, plantillas, bot…).' },

  // ─── Bot y conocimiento ───────────────────────────────────────────────────
  'GET /intents': { cat: 'bot', name: 'Ver respuestas del bot', desc: 'Lista las respuestas (intenciones) que tiene configuradas tu bot.' },
  'GET /intents/{idOrName}': { cat: 'bot', name: 'Ver una respuesta del bot', desc: 'Muestra cómo está configurada una respuesta del bot.' },
  'GET /knowledge-bases': { cat: 'bot', name: 'Ver bases de conocimiento', desc: 'Lista los documentos que usa la IA del bot para responder.' },
  'POST /knowledge-bases': { cat: 'bot', name: 'Crear una base de conocimiento', desc: 'Sube un documento nuevo para que la IA del bot aprenda de él.' },
  'PUT /knowledge-bases': { cat: 'bot', name: 'Actualizar una base de conocimiento', desc: 'Reemplaza el contenido de una base de conocimiento existente.' },
  'GET /variables': { cat: 'bot', name: 'Ver variables y etiquetas', desc: 'Lista los datos que el bot guarda de cada cliente (variables y etiquetas).' },
  'GET /constants': { cat: 'bot', name: 'Ver datos fijos del bot', desc: 'Lista los valores fijos que usa el bot (horarios, teléfonos, textos…).' },
  'GET /constants/{id}': { cat: 'bot', name: 'Ver un dato fijo', desc: 'Muestra el valor de un dato fijo del bot.' },
  'PATCH /constants/{id}': { cat: 'bot', name: 'Cambiar un dato fijo', desc: 'Cambia el valor de un dato fijo (por ejemplo, el horario de atención).' },
  'GET /entities/{entityName}': { cat: 'bot', name: 'Ver una lista de sinónimos', desc: 'Muestra una lista de palabras que el bot reconoce como iguales.' },
  'POST /entities/{entityName}': { cat: 'bot', name: 'Crear o editar una lista de sinónimos', desc: 'Define palabras que el bot debe reconocer como iguales.' },
  'DELETE /entities/{entityName}': { cat: 'bot', name: 'Borrar una lista de sinónimos', desc: 'Elimina una lista de sinónimos del bot.', danger: 'delete' },

  // ─── Avanzado ─────────────────────────────────────────────────────────────
  'PATCH /channels/{id}': { cat: 'avanzado', name: 'Editar un canal', desc: 'Cambia la configuración técnica de un canal.' },
  'GET /webhooks': { cat: 'avanzado', name: 'Ver webhooks', desc: 'Conexiones que avisan a otros sistemas cuando llega un mensaje.' },
  'GET /webhooks/{id}': { cat: 'avanzado', name: 'Ver un webhook', desc: 'Muestra la configuración de una conexión.' },
  'POST /webhooks/{id}/redirection-rules': { cat: 'avanzado', name: 'Crear regla de redirección', desc: 'Envía los avisos de ciertos clientes a otra dirección.' },
  'GET /webhooks/{webhookId}/redirection-rules/{ruleId}': { cat: 'avanzado', name: 'Ver regla de redirección', desc: 'Muestra una regla de redirección.' },
  'PATCH /webhooks/{webhookId}/redirection-rules/{ruleId}': { cat: 'avanzado', name: 'Editar regla de redirección', desc: 'Cambia una regla de redirección.' },
  'DELETE /webhooks/{webhookId}/redirection-rules/{ruleId}': { cat: 'avanzado', name: 'Borrar regla de redirección', desc: 'Elimina una regla de redirección.', danger: 'delete' },
  'GET /auth/credentials': { cat: 'avanzado', name: 'Ver credenciales de acceso', desc: 'Muestra las credenciales técnicas de tu cuenta.' },
  'POST /auth/credentials': { cat: 'avanzado', name: 'Renovar credenciales de acceso', desc: 'Genera una clave nueva. La clave actual DEJARÁ DE FUNCIONAR para todos.', danger: 'critical' },
  'DELETE /auth/credentials': { cat: 'avanzado', name: 'Eliminar credenciales de acceso', desc: 'Elimina la clave actual. Nadie podrá usar este panel ni otras integraciones hasta crear una nueva.', danger: 'critical' },
};

export const actionKey = (method, path) => `${method.toUpperCase()} ${path}`;
