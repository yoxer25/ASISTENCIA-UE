import { Personal } from "../models/personal.model.js";
import { helpers } from "../helpers/helper.js";
// para cambiar nombre del excel a guardar
import fs from "node:fs";
import path from "path"; //
import { fileURLToPath } from "url";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"; // Importa el plugin UTC con la extensión .js
import timezone from "dayjs/plugin/timezone.js"; // Importa el plugin Timezone con la extensión .js

dayjs.extend(utc); // Extiende con UTC
dayjs.extend(timezone); // Extiende con Timezone

// importamos el módulo "xlsx-populate" para poder leer archivos .xlsx
import xlsxPopulate from "xlsx-populate";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";
import { Institution } from "../models/institution.model.js";
import { DocumentIE } from "../models/documentIE.model.js";
import { SchoolYear } from "../models/schoolYear.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de asistencia
export const getData = async (req, res) => {
  const user = req.user;
  const ie = user.name;
  const institutions = await Institution.getInstitution();
  try {
    const schoolYear = await SchoolYear.getSchoolYear();
    const anios = [];
    for (let i = 0; i < schoolYear.length; i++) {
      const element = schoolYear[i];
      const objet = {
        idAnio: element.idAnio,
        nombreAnio: element.nombreAnio,
        ie,
      };
      anios.push(objet);
    }
    res.render("attendanceRecord/index", {
      user,
      institutions,
      anios,
      ie,
    });
  } catch (error) {
    res.render("attendanceRecord/index", { user, institutions });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de asistencia por año
export const getDataByAnio = async (req, res) => {
  const user = req.user;
  const institutions = await Institution.getInstitution();
  const { carpeta } = req.params;
  try {
    const str = carpeta.split("_");
    const year = str[0];
    const ie = str[1];
    const [schoolYear] = await SchoolYear.getSchoolYearByName(year);
    const documents = await DocumentIE.getDocumentExcel(ie, schoolYear.idAnio);
    const [IE] = await Institution.getInstitutionById(ie);
    res.render("attendanceRecord/indexByAnio", {
      user,
      institutions,
      carpeta,
      documents,
      IE,
      year,
    });
  } catch (error) {
    res.render("attendanceRecord/indexByAnio", { user, institutions });
  }
};

/* controla lo que se debe mostrar al momento de visitar la página de
asistencia consultando por IE */
export const getAttendanceRecord = async (req, res) => {
  const user = req.user;
  const { ie } = req.body;
  const institutions = await Institution.getInstitution();
  try {
    const schoolYear = await SchoolYear.getSchoolYear();
    const [ieDB] = await Institution.getInstitutionById(ie);
    const nameIE = `${ieDB.nombreNivel} - ${ieDB.nombreInstitucion}`;
    const anios = [];
    for (let i = 0; i < schoolYear.length; i++) {
      const element = schoolYear[i];
      const objet = {
        idAnio: element.idAnio,
        nombreAnio: element.nombreAnio,
        ie,
      };
      anios.push(objet);
    }
    res.render("attendanceRecord/index", {
      user,
      institutions,
      anios,
      ie,
      nameIE,
    });
  } catch (error) {
    res.render("attendanceRecord/index", { user, institutions });
  }
};

// para importar el consolidado de la asistencia mensual
export const postAttendanceRecord = async (req, res) => {
  const user = req.user;
  const institution = user.name;
  const { carpeta } = req.body;
  try {
    if (req.file) {
      const { mimetype, originalname, filename } = req.file;
      if (
        mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const str = carpeta.split("_");
        const year = str[0];
        const [schoolYear] = await SchoolYear.getSchoolYearByName(year);
        const resDB = await DocumentIE.set(
          institution,
          originalname,
          filename,
          schoolYear.idAnio
        );
        if (resDB.affectedRows > 0) {
          saveExcelIE(req.file);
          // Si el registro es exitoso
          res.cookie("success", ["¡Registro exitoso!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          res.redirect(`/attendanceRecords/file/${carpeta}`);
        } else {
          // Si el registro falla
          res.cookie("error", ["¡Error al agregar registro!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          throw new Error("Error al agregar registro");
        }
      } else {
        res.cookie("error", ["¡Seleccione un archivo excel!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Seleccione un archivo .xlsx");
      }
    } else {
      res.cookie("error", ["¡Seleccione un archivo excel!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Seleccione un archivo .xlsx");
    }
  } catch (error) {
    res.redirect(`/attendanceRecords/file/${carpeta}`);
  }
};

// para descargar el consolidado de la asistencia mensual
export const download = async (req, res) => {
  const { archive } = req.params;

  try {
    const nameExcel = archive + ".xlsx";
    const _filename = fileURLToPath(import.meta.url);
    const _dirname = path.dirname(_filename);
    const rutaExcel = path.resolve(_dirname, "..", "asistencia", nameExcel);

    // Verifica si el archivo existe antes de intentar descargarlo
    if (!fs.existsSync(rutaExcel)) {
      res.cookie("error", ["¡No se encontró el archivo!"], {
        httpOnly: true,
        maxAge: 6000,
      });
      return res.redirect("/attendanceRecords");
    }

    res.download(rutaExcel, (err) => {
      if (err) {
        res.cookie("error", ["¡Hubo un problema al descargar el archivo!"], {
          httpOnly: true,
          maxAge: 6000,
        });
        // Redirige desde el callback en lugar de lanzar una excepción
        return res.redirect("/attendanceRecords");
      }
    });
  } catch (error) {
    res.cookie("error", ["¡Error inesperado al procesar la descarga!"], {
      httpOnly: true,
      maxAge: 6000,
    });
    res.redirect("/attendanceRecords");
  }
};

// de aquí en adelante se usan en la página de reportes

// controla lo que se debe mostrar al momento de visitar la página de importar data
export const getImportData = async (req, res) => {
  const user = req.user;
  res.render("attendanceRecord/create", { user });
};

/* para importar los datos desde el archivo .xlsx;
se crea un nuevo objeto a partir de los datos del
excel y se va guardando en la base datos (solo si
el usuario no tiene horas agregadas en una
determinada fecha) */
export const importData = async (req, res) => {
  const user = req.user;
  const institution = user.name;

  try {
    if (req.file) {
      const { mimetype } = req.file;
      if (
        mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        saveExcel(req.file);
        // especificamos el archivo excel del cual vamos a leer los datos
        const workBook = await xlsxPopulate.fromFileAsync(
          "./src/archives/asistencia.xlsx"
        );
        // constante que contiene todos los datos de la hoja del excel
        const value = workBook
          .sheet("COVG231060035_attlog")
          .usedRange()
          .value();

        let registers = {};

        for (let i = 0; i < value.length; i++) {
          const element = value[i];
          if (element[0] !== undefined) {
            const [personal] = await Personal.getId(institution, element[0]);
            const idPersonal = personal.idPersonal;
            const datetimeExcel = numeroAFecha(element[1]);
            const registrationDate = helpers.formatDate(datetimeExcel);
            const registrationTime = helpers.formatTime(datetimeExcel);
            if (!registers[idPersonal]) {
              registers[idPersonal] = {
                usuario: idPersonal,
                turno: personal.nombreTurno,
                fechaRegistro: [],
              };
            }
            registers[idPersonal].fechaRegistro.push([
              registrationDate,
              registrationTime,
            ]);
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
                turno: register.turno,
                fechaRegistro: date,
                marcas: [],
              };
            }

            finalRegister[date].marcas.push(time);
          });

          const turnoPersonal = register.turno;
          let horaEntrada = convertirATotalMinutos("02:00:00");
          let horaEntrada1Hasta = convertirATotalMinutos("10:00:00");

          let horaEntrada2Desde = convertirATotalMinutos("13:20:00");
          let horaEntrada2Hasta = convertirATotalMinutos("15:00:00");

          if (turnoPersonal === "tarde") {
            horaEntrada1Hasta = convertirATotalMinutos("14:00:00");
          } else if (turnoPersonal === "ceba") {
            horaEntrada1 = convertirATotalMinutos("18:00:00");
            horaEntrada1Hasta = convertirATotalMinutos("19:30:00");
          }

          Object.values(finalRegister).forEach(async (register) => {
            const attenRec = {
              institution,
              personal: `${register.usuario}`,
              recordDate: `${register.fechaRegistro}`,
            };

            register.marcas.forEach((registroHora) => {
              const horaMarco = convertirATotalMinutos(registroHora);
              if (turnoPersonal === "ue") {
                if (
                  horaMarco >= horaEntrada &&
                  horaMarco <= horaEntrada1Hasta
                ) {
                  if (!attenRec.firstHourEntry) {
                    attenRec.firstHourEntry = registroHora;
                  }
                }
                if (
                  horaMarco > horaEntrada1Hasta &&
                  horaMarco < horaEntrada2Desde
                ) {
                  if (!attenRec.firstHourDeparture) {
                    attenRec.firstHourDeparture = registroHora;
                  }
                }
                if (
                  horaMarco >= horaEntrada2Desde &&
                  horaMarco <= horaEntrada2Hasta
                ) {
                  if (!attenRec.secondHourEntry) {
                    attenRec.secondHourEntry = registroHora;
                  }
                }
                if (horaMarco > horaEntrada2Hasta) {
                  if (!attenRec.secondDepartureTime) {
                    attenRec.secondDepartureTime = registroHora;
                  }
                }
              } else if (turnoPersonal === "ceba") {
                if (horaMarco <= horaEntrada1Hasta) {
                  if (!attenRec.firstHourEntry) {
                    attenRec.firstHourEntry = registroHora;
                  }
                }
                if (horaMarco > horaEntrada1Hasta) {
                  if (!attenRec.firstHourDeparture) {
                    attenRec.firstHourDeparture = registroHora;
                  }
                }
              } else if (
                turnoPersonal === "mañana" ||
                turnoPersonal === "jer" ||
                turnoPersonal === "jec"
              ) {
                if (horaMarco <= horaEntrada1Hasta) {
                  if (!attenRec.firstHourEntry) {
                    attenRec.firstHourEntry = registroHora;
                  }
                }
                if (horaMarco > horaEntrada1Hasta) {
                  if (!attenRec.firstHourDeparture) {
                    attenRec.firstHourDeparture = registroHora;
                  }
                }
              } else if (turnoPersonal === "tarde") {
                if (horaMarco <= horaEntrada1Hasta) {
                  if (!attenRec.firstHourEntry) {
                    attenRec.firstHourEntry = registroHora;
                  }
                }
                if (horaMarco > horaEntrada1Hasta) {
                  if (!attenRec.firstHourDeparture) {
                    attenRec.firstHourDeparture = registroHora;
                  }
                }
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

        function redirectPage() {
          res.redirect("/reports/page1");
        }
        res.cookie("success", ["¡Registro exitoso!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        setTimeout(redirectPage, 2000);
      } else {
        res.cookie("error", ["¡Seleccione un archivo excel!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Seleccione un archivo .xlsx");
      }
    } else {
      res.cookie("error", ["¡Seleccione un archivo excel!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Seleccione un archivo .xlsx");
    }
  } catch (error) {
    res.redirect("/attendanceRecords/importData");
  }
};

// para eliminar un registro de asistencia
export const deleteById = async (req, res) => {
  const { Id } = req.params;
  const { institution, personal } = req.body;
  try {
    const resDB = await AttendanceRecord.deleteById(Id, institution, personal);
    if (resDB.affectedRows > 0) {
      // Si el registro es exitoso
      res.cookie("success", ["¡Se eliminó correctamente!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      res.redirect("/reports/page1");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al eliminar registro!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al eliminar registro");
    }
  } catch (error) {
    res.redirect("/reports/page1");
  }
};

/* función para que el excel subido se guarde con su nombre
original dentro de la carpeta "src/archives". Esto es para
importar la asistencia diaria */
const saveExcel = (file) => {
  const newPath = `./src/archives/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
};

/* función para que el excel subido se guarde con su nombre
original dentro de la carpeta "src/asistencia". Esto es para
importar la asistencia diaria */
const saveExcelIE = (file) => {
  const newPath = `./src/asistencia/${file.filename}.xlsx`;
  fs.renameSync(file.path, newPath);
  return newPath;
};

// función para convertir número de Excel a UTC y luego guardarlo en la base de datos en UTC
const numeroAFecha = (numeroDeDias) => {
  // Convertir el número de Excel a UTC
  const fechaUtc = new Date((numeroDeDias - 25569) * 86400000);

  // Convertir a UTC explícitamente con Day.js
  const fechaUtcDayjs = dayjs.utc(fechaUtc);

  // Retorna la fecha en formato ISO 8601 en UTC (sin zona horaria local)
  return fechaUtcDayjs.toISOString();
};

// función para convertir HH:MM:SS a minutos
const convertirATotalMinutos = (tiempo) => {
  const [horas, minutos, segundos] = tiempo.split(":").map(Number);
  const totalMinutos = horas * 60 + minutos + Math.round(segundos / 60);
  return totalMinutos;
};