# Panel Botmaker

Panel web para usar la API de Botmaker sin saber programación: todo se hace con cajas, desplegables y botones, en español.

## Cómo usarlo

```bash
npm install
npm run dev        # abre http://localhost:5173
```

1. En la pantalla de inicio, pega tu **clave de acceso** (access-token). Se consigue en
   [go.botmaker.com › Integraciones › API](https://go.botmaker.com/#/integrations/api).
2. Elige una tarea (por ejemplo, **Descargar sesiones de atención**).
3. Llena los datos y presiona el botón. Los resultados se ven en tabla y se pueden **descargar a Excel**.

## Publicarlo

Botmaker no acepta llamadas directas desde el navegador, así que el panel usa un reenvío en `/api`:

- `npm run dev` y `npm run preview` ya lo incluyen (ver `vite.config.js`).
- En otro servidor (Vercel, Nginx, etc.) configura un reenvío de `/api/*` a `https://api.botmaker.com/v2.0/*`,
  o define la variable `VITE_API_BASE` con la dirección de tu reenvío antes de `npm run build`.

## Estructura

| Carpeta / archivo | Qué contiene |
|---|---|
| `public/document.json` | Descripción oficial de la API de Botmaker (de aquí salen las acciones y formularios). |
| `src/data/actions.js` | Nombre, explicación, categoría y nivel de riesgo de cada acción, en español. |
| `src/data/labels.js` | Traducción de los nombres técnicos de campos y columnas. |
| `src/data/help.js` | Ayudas ⓘ de cada campo y traducción de opciones fijas. |
| `src/lib/` | Conexión con la API, mensajes de error, fechas, tablas/Excel y listas automáticas. |
| `src/components/` | Pantallas: inicio, menú, acción, formularios, resultados y confirmaciones. |

Para cambiar el texto de una acción, edita `src/data/actions.js`. Para traducir un campo nuevo, agrega una línea en `src/data/labels.js`.
