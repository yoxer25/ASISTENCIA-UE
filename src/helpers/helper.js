// importamos day.js para formatear fechas
import dayjs from "dayjs";

// exportamos helpers para poder usar en todo el proyecto
export const helpers = {};

// función para convertir a json el objeto que tenemos en la vista de registrar una nueva venta
helpers.convertJson = (obj) => {
  return JSON.stringify(obj);
};

// función para formatear fechas al guardar en la base de daros
helpers.formatDateTime = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

// función para formatear fechas para las vistas
helpers.formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
helpers.formatTime = (date) => dayjs(date).format("HH:mm:ss");
