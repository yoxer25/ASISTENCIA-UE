// importamos la conexión a la base de datos
import pool from "../bd.js";
// para cambiar nombre del excel a guardar
import fs from "node:fs";

// importamos el módulo "xlsx-populate" para poder leer archivos .xlsx
import xlsxPopulate from "xlsx-populate";

// exportamos todas las constantes para poder llamarlas desde la carpeta "routes" que tienen todas las rutas de la web
// función que muestra lo que se debe mostrar al momento de vistar la página principal
export const getHome = async (req, res) => {
  const users = await pool.query(
    "SELECT u.nombres, a.entrada, a.salida FROM usuariosue u INNER JOIN asistencia a ON u.idusuario = a.idusuario"
  );
  res.render("home", { users });
};

// fucnión que permite importar el excel a la base datos
export const importBD = async (req, res) => {
  saveExcel(req.file);
  // especificamos el archivo excel que vamos a leer
  const workBook = await xlsxPopulate.fromFileAsync(
    "./src/archives/asistencia.xlsx"
  );
  // constante que contiene todos los datos de una hoja del excel
  const value = workBook.sheet("COVG231060035_attlog").usedRange().value();

  // para subir registro de asistencia
  // función para convertir números a fecha
  const numeroAFecha = (numeroDeDias, esExcel = false) => {
    const diasDesde1900 = esExcel ? 25568 + 1 : 25568;
    const datafe = new Date((numeroDeDias - diasDesde1900) * 86400000);
    return new Date(
      datafe.getFullYear(),
      datafe.getMonth(),
      datafe.getDate(),
      datafe.getHours() + 5,
      datafe.getMinutes(),
      datafe.getSeconds(),
      datafe.getMilliseconds()
    );
  };
  // hacemos un for al resultado del excel para ir recorriendo dato por dato y guardarlo en la base de datos
  for (let i = 0; i < value.length - 1; i++) {
    if (i % 2 === 0) {
      // constante que almacena un objeto con los datos de un solo usuario
      const datos = value[i];

      const entrada = numeroAFecha(datos[1], true);

      const dato = value[i + 1];
      const salida = numeroAFecha(dato[1], true);

      const newRegister = {
        idusuario: datos[0],
        entrada,
        salida,
      };
      await pool.query("INSERT INTO asistencia SET ?", [newRegister]);
    } else {
      continue;
    }
    continue;
  }

  // para subir lista de usuarios
  // hacemos un for al resultado del excel para ir recorriendo dato por dato y guardarlo en la base de datos
  /* for (let i = 1; i < value.length; i++) {
    // constante que almacena un objeto con los datos de un solo usuario
    const listaUser = value[i];
    // constante que almacena la primera columna del objeto anterior(hace referencia al nombre según el excel)
    const names = listaUser[0];
    // constante que almacena la segunda columna del objeto anterior(hace referencia al id según el excel)
    const ids = listaUser[1];
    // hacemos otro for para insertar usuario por usuario en la base de datos
    for (let j = 0; j < names.length; j++) {
      const newUser = {
        idusuario: ids,
        nombres: names.toLocaleUpperCase(),
      };
      await pool.query("INSERT INTO usuariosue SET ?", [newUser]);
      // se le especifica que cuando termine de insertar el usuario, se detenga y salga del bucle
      break;
    }
    // se le especifica que debe continuar el bucle
    continue;
  } */
  res.redirect("/");
};

// función para que el excel subido se guarde con su nombre original dentro de la carpeta "src/archives"
function saveExcel(file) {
  const newPath = `./src/archives/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
}
