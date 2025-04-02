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
helpers.formatDateTimeIso = (date) => dayjs(date).format('YYYY-MM-DDTHH:mm:ss');

/* para formatear fechas para las vistas; para la fecha de registro
y hora de registro en la tabla "registro_asistencia" en la base de datos */
helpers.formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
helpers.formatTime = (date) => dayjs(date).format("HH:mm:ss");
