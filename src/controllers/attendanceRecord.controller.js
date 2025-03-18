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
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.session;
  const rol = user.user.rol;
  const institution = user.user.name;
  try {
    if (rol === "administrador") {
      const [counts] = await AttendanceRecord.countRecords();
      const attendanceRecord = await AttendanceRecord.getAttendanceRecord(
        undefined,
        ofset
      );
      res.render("attendanceRecord/index", {
        user,
        attendanceRecord,
        current: page,
        pages: Math.ceil(counts.records / forPage),
      });
    } else {
      const attendanceRecord = await AttendanceRecord.getAttendanceRecord(
        institution,
        ofset
      );
      res.render("attendanceRecord/index", { user, attendanceRecord });
    }
  } catch (error) {
    console.log(error.message);
    res.render("attendanceRecord/index", { user });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de importar data
export const getImportData = async (req, res) => {
  const user = req.session;
  res.render("attendanceRecord/create", { user });
};

/* para importar los datos desde el archivo .xlsx;
se crea un nuevo objeto a partir de los datos del
excel y se va guardando en la base datos (solo si
el usuario no tiene horas agregadas en una
determinada fecha) */
export const importData = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;

  try {
    saveExcel(req.file);
    // especificamos el archivo excel del cual vamos a leer los datos
    const workBook = await xlsxPopulate.fromFileAsync(
      "./src/archives/asistencia.xlsx"
    );
    // constante que contiene todos los datos de la hoja del excel
    const value = workBook.sheet("COVG231060035_attlog").usedRange().value();

    let registers = {};

    for (let i = 0; i < value.length; i++) {
      const element = value[i];
      if (element[0] !== undefined) {
        const [DNIPersonal] = await Personal.getDNI(institution, element[0]);
        const dni = DNIPersonal.idPersonal;
        const datetimeExcel = numeroAFecha(element[1], true);
        const registrationDate = helpers.formatDate(datetimeExcel);
        const registrationTime = helpers.formatTime(datetimeExcel);
        if (!registers[dni]) {
          registers[dni] = {
            usuario: dni,
            fechaRegistro: [],
          };
        }
        registers[dni].fechaRegistro.push([registrationDate, registrationTime]);
      } else {
        break;
      }
    }

    Object.values(registers).forEach((register) => {
      const finalRegister = {};

      register.fechaRegistro.forEach((fecha) => {
        const date = fecha[0];
        const time = fecha[1];

        if (!finalRegister[date]) {
          finalRegister[date] = {
            usuario: register.usuario,
            fechaRegistro: date,
            marcas: [],
          };
        }

        finalRegister[date].marcas.push(time);
      });

      const horaEntrada1 = convertirATotalMinutos("08:00:00");
      const horaEntrada1Hasta = convertirATotalMinutos("10:00:00");

      const horaSalida1 = convertirATotalMinutos("12:00:00");

      const horaEntrada2Desde = convertirATotalMinutos("14:00:00");
      const horaEntrada2Hasta = convertirATotalMinutos("15:00:00");

      const horaSalida2 = convertirATotalMinutos("17:00:00");

      Object.values(finalRegister).forEach(async (register) => {
        const attenRec = {
          institution,
          personal: `${register.usuario}`,
          recordDate: `${register.fechaRegistro}`,
        };

        register.marcas.forEach((registroHora) => {
          const horaMarco = convertirATotalMinutos(registroHora);
          if (horaMarco < horaEntrada1 && horaMarco <= horaEntrada1Hasta) {
            attenRec.firstHourEntry = registroHora;
          }
          if (horaMarco >= horaSalida1 && horaMarco < horaEntrada2Desde) {
            attenRec.firstHourDeparture = registroHora;
          }
          if (
            horaMarco >= horaEntrada2Desde &&
            horaMarco <= horaEntrada2Hasta
          ) {
            attenRec.secondHourEntry = registroHora;
          }
          if (horaMarco >= horaSalida2) {
            attenRec.secondDepartureTime = registroHora;
          }
        });

        if (!attenRec.firstHourEntry) {
          attenRec.firstHourEntry = null;
        }
        if (!attenRec.firstHourDeparture) {
          attenRec.firstHourDeparture = null;
        }
        if (!attenRec.secondHourEntry) {
          attenRec.secondHourEntry = null;
        }
        if (!attenRec.secondDepartureTime) {
          attenRec.secondDepartureTime = null;
        }

        const [resAttenRec] =
          await AttendanceRecord.getAttendanceRecordForCreate(
            attenRec.institution,
            attenRec.personal,
            attenRec.recordDate
          );

        if (!resAttenRec) {
          await AttendanceRecord.create(
            attenRec.institution,
            attenRec.personal,
            attenRec.recordDate,
            attenRec.firstHourEntry,
            attenRec.firstHourDeparture,
            attenRec.secondHourEntry,
            attenRec.secondDepartureTime
          );
        }
      });
    });
    res.redirect("/attendanceRecords");
  } catch (error) {
    console.log(error.message);
    res.redirect("/attendanceRecords/importData");
  }
};

// función para que el excel subido se guarde con su nombre original dentro de la carpeta "src/archives"
const saveExcel = (file) => {
  const newPath = `./src/archives/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
};

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

// función para convertir HH:MM:SS a minutos
const convertirATotalMinutos = (tiempo) => {
  const [horas, minutos, segundos] = tiempo.split(":").map(Number);
  const totalMinutos = horas * 60 + minutos + Math.round(segundos / 60);
  return totalMinutos;
};
