// importamos day.js para formatear fechas
import dayjs from "dayjs";

// exportamos helpers para poder usar en todo el proyecto
export const helpers = {};

// función para convertir a json el objeto que tenemos en la vista
helpers.convertJson = (obj) => {
  return JSON.stringify(obj);
};

/* para formatear fechas al guardar en la base de datos
la fecha de creación, actualización y eliminación */
helpers.formatDateTime = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

/* para formatear fechas para la tabla de registros de asistencia,
esta fecha es la fecha de creación del registro y se comparará con
la fecha actual, así de ese modo el botón de eliminar registro solo
estará disponible para aquellos registros cuya fecha de creación
sea menor a las 24 horas */
helpers.formatDateTimeIso = (date) => dayjs(date).format("YYYY-MM-DDTHH:mm:ss");

/* para formatear fechas para las vistas; para la fecha de registro
y hora de registro en la tabla "registro_asistencia" en la base de datos */
helpers.formatDate = (date) => {
  // Convierte la fecha a UTC antes de formatearla
  return dayjs.utc(date).format("YYYY-MM-DD");
};

helpers.formatTime = (date) => {
  // Convierte la hora a UTC antes de formatearla
  return dayjs.utc(date).format("HH:mm:ss");
};

/* para ver si los datos son iguales, se usa en las vistas */
helpers.orEq = (a, b, c, d) => a === b || a === c || a === d; // para el menú lateral

/* para ver si los datos no son iguales, se usa en las vistas
para que el botón de aprobar papeleta solo sea visible para
jefes de área */
helpers.noeq = (a, b) => a !== b;

/* para que desaparezca el botón de aprobar papeleta cuando
el usuario ya aprobó lo que le corresponde */
helpers.not = (a) => !a;
helpers.eq = (a, b) => a === b; // también para uso de roles
/* args.slice(0, -1) elimina el último parámetro que Handlebars pasa automáticamente (el objeto de opciones)
Esto permite evaluar correctamente múltiples condiciones en {{#if}} */
helpers.and = (...args) => args.slice(0, -1).every(Boolean);
helpers.or = (...args) => args.slice(0, -1).some(Boolean);

/* para mostrar en la página de registro de asistencia
las horas que ha marcado el trabajador, caso contrario,
"no marcó" */
helpers.defaultIfEmpty = (value, defaultValue) => {
  return value ? value : defaultValue;
};