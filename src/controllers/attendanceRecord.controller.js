import { Personal } from "../models/personal.model.js";
import { helpers } from "../helpers/helper.js";
// para cambiar nombre del excel a guardar
import fs from "node:fs";
// importamos el módulo "xlsx-populate" para poder leer archivos .xlsx
import xlsxPopulate from "xlsx-populate";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de asistencia
export const getAttendanceRecord = async (req, res) => {
  const user = req.session;
  const rol = user.user.rol;
  const institution = user.user.name;
  try {
    if (rol === 1) {
      const attendanceRecord =
        await AttendanceRecord.getAttendanceRecordForAdmin();
      res.render("attendanceRecord/index", { user, attendanceRecord });
    } else {
      const attendanceRecord = await AttendanceRecord.getAttendanceRecord(
        institution
      );
      res.render("attendanceRecord/index", { user, attendanceRecord });
    }
  } catch (error) {
    res.render("attendanceRecord/index", { user });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de importar data
export const getImportData = async (req, res) => {
  const user = req.session;
  res.render("attendanceRecord/create", { user });
};

/* para importar los datos desde el archivo .xlsx;
se va iterando fila por fila, por cada fila se va
consultando si todos los datos de esa fila ya han
sido registrados, si ya existen en la base de datos,
se pasa a la siguiente fila, caso contrario, se
agrega el nuevo registro */
export const importData = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;

  try {
    saveExcel(req.file);
    // especificamos el archivo excel que vamos a leer
    const workBook = await xlsxPopulate.fromFileAsync(
      "./src/archives/asistencia.xlsx"
    );
    // constante que contiene todos los datos de una hoja del excel
    const value = workBook.sheet("COVG231060035_attlog").usedRange().value();
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
    for (let i = 0; i < value.length; i++) {
      const datos = value[i];
      const recordDateTime = numeroAFecha(datos[1], true);
      if (datos[0] !== undefined) {
        const [DNIPersonal] = await Personal.getDNI(institution, datos[0]);
        const [resAttenRec] =
          await AttendanceRecord.getAttendanceRecordForCreate(
            institution,
            DNIPersonal.idPersonal,
            helpers.formatDate(recordDateTime),
            helpers.formatTime(recordDateTime)
          );
        if (!resAttenRec) {
          await AttendanceRecord.create(
            institution,
            DNIPersonal.idPersonal,
            helpers.formatDate(recordDateTime),
            helpers.formatTime(recordDateTime)
          );
        } else {
          continue;
        }
      } else {
        break;
      }
      continue;
    }
    res.redirect("/attendanceRecords");
  } catch (error) {
    res.redirect("/attendanceRecords/importData");
  }
};

// función para que el excel subido se guarde con su nombre original dentro de la carpeta "src/archives"
function saveExcel(file) {
  const newPath = `./src/archives/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
}
