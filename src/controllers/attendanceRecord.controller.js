import { Personal } from "../models/personal.model.js";
import { helpers } from "../helpers/helper.js";
// para cambiar nombre del excel a guardar
import fs from "node:fs";
// importamos el módulo "xlsx-populate" para poder leer archivos .xlsx
import xlsxPopulate from "xlsx-populate";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";

// exportamos todas las constantes para poder llamarlas desde la carpeta "routes" que tienen todas las rutas de la web
// función que muestra lo que se debe mostrar al momento de vistar la página principal
export const getAttendanceRecord = async (req, res) => {
  const user = req.session;
  const rol = user.user.rol;
  const institution = user.user.name;
  try {
    if (rol === 1) {
      const attendanceRecordForAdmin =
        await AttendanceRecord.getAttendanceRecordForAdmin();
      res.render("attendanceRecord/index", { user, attendanceRecordForAdmin });
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

export const getImportData = async (req, res) => {
  const user = req.session;
  res.render("attendanceRecord/create", { user });
};

// fucnión que permite importar el excel a la base datos
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
    for (let i = 0; i < value.length; i++) {
      const datos = value[i];
      const recordDateTime = numeroAFecha(datos[1], true);
      if (datos[0] !== undefined) {
        const [DNIPersonal] = await Personal.getDNI(institution, datos[0]);
        await AttendanceRecord.create(
          institution,
          DNIPersonal.idPersonal,
          helpers.formatDate(recordDateTime),
          helpers.formatTime(recordDateTime)
        );
      } else {
        break;
      }
      continue;
    }
    res.redirect("/attendanceRecords");
  } catch (error) {
    console.log(error.message);
    res.redirect("/attendanceRecords/importData");
  }
};

// función para que el excel subido se guarde con su nombre original dentro de la carpeta "src/archives"
function saveExcel(file) {
  const newPath = `./src/archives/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
}
