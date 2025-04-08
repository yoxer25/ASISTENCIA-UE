import { Personal } from "../models/personal.model.js";
import { helpers } from "../helpers/helper.js";
// para cambiar nombre del excel a guardar
import fs from "node:fs";
// importamos el módulo "xlsx-populate" para poder leer archivos .xlsx
import xlsxPopulate from "xlsx-populate";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";
import { Institution } from "../models/institution.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de importar data
export const getImportData = async (req, res) => {
  const user = req.session;
  res.render("attendanceRecord/create", { user });
};

//controla lo que se debe mostrar al momento de visitar la página de asistencia
export const getData = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  const user = req.session;
  const institution = user.user.name;
  const [turnoIE] = await Institution.getInstitutionById(institution);
  try {
    const attendanceRecordDB = await AttendanceRecord.getData(institution);
    let attendanceRecord = attendanceRecordDB.slice(
      page * forPage - forPage,
      page * forPage
    );
    res.render("attendanceRecord/index", {
      user,
      turno: turnoIE.nombreHorario,
      ie: institution,
      attendanceRecord,
      current: page,
      pages: Math.ceil(attendanceRecordDB.length / forPage),
      option: null,
    });
  } catch (error) {
    res.render("attendanceRecord/index", {
      user,
      turno: turnoIE.nombreHorario,
    });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de asistencia por fechas o usuarios
export const getAttendanceRecord = async (req, res) => {
  let forPage = 10;
  const user = req.session;
  const rol = user.user.rol;
  const institution = user.user.name;
  const fechaActual = new Date();
  let year = fechaActual.getFullYear();
  let month = String(fechaActual.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son base 0
  let day = String(fechaActual.getDate()).padStart(2, "0");
  let [turnoIE] = await Institution.getInstitutionById(institution);

  try {
    let { startDate, endDate, page, option, username, ie } = req.body;
    if (startDate !== "") {
      startDate = startDate;
    } else {
      startDate = `${year}-${month}-${day}`;
    }
    if (endDate !== "") {
      endDate = endDate;
    } else {
      endDate = `${year}-${month}-${day}`;
    }
    if (page !== "") {
      page = page;
    } else {
      page = 1;
    }

    if (username) {
      if (rol === "administrador") {
        if (ie) {
          ie = ie;
        } else {
          ie = institution;
        }
        [turnoIE] = await Institution.getInstitutionById(ie);
        if (option === "dni") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            ie,
            startDate,
            endDate,
            undefined,
            username
          );
          let attendanceRecord = attendanceRecordDB.slice(
            page * forPage - forPage,
            page * forPage
          );
          res.render("attendanceRecord/index", {
            user,
            turno: turnoIE.nombreHorario,
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie,
            username,
            option,
            startDate,
            endDate,
          });
        }
        if (option === "name") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            ie,
            startDate,
            endDate,
            username,
            undefined
          );
          let attendanceRecord = attendanceRecordDB.slice(
            page * forPage - forPage,
            page * forPage
          );
          res.render("attendanceRecord/index", {
            user,
            turno: turnoIE.nombreHorario,
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie,
            username,
            option,
            startDate,
            endDate,
          });
        }
      } else {
        if (option === "dni") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            institution,
            startDate,
            endDate,
            undefined,
            username
          );
          let attendanceRecord = attendanceRecordDB.slice(
            page * forPage - forPage,
            page * forPage
          );
          res.render("attendanceRecord/index", {
            user,
            turno: turnoIE.nombreHorario,
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: institution,
            username,
            option,
            startDate,
            endDate,
          });
        }
        if (option === "name") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            institution,
            startDate,
            endDate,
            username,
            undefined
          );
          let attendanceRecord = attendanceRecordDB.slice(
            page * forPage - forPage,
            page * forPage
          );
          res.render("attendanceRecord/index", {
            user,
            turno: turnoIE.nombreHorario,
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: institution,
            username,
            option,
            startDate,
            endDate,
          });
        }
      }
    } else {
      if (rol === "administrador") {
        if (ie) {
          ie = ie;
        } else {
          ie = institution;
        }
        [turnoIE] = await Institution.getInstitutionById(ie);
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          ie,
          startDate,
          endDate
        );
        let attendanceRecord = attendanceRecordDB.slice(
          page * forPage - forPage,
          page * forPage
        );
        res.render("attendanceRecord/index", {
          user,
          turno: turnoIE.nombreHorario,
          attendanceRecord,
          current: page,
          pages: Math.ceil(attendanceRecordDB.length / forPage),
          ie,
          username,
          option,
          startDate,
          endDate,
        });
      } else {
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          institution,
          startDate,
          endDate
        );
        let attendanceRecord = attendanceRecordDB.slice(
          page * forPage - forPage,
          page * forPage
        );
        res.render("attendanceRecord/index", {
          user,
          turno: turnoIE.nombreHorario,
          attendanceRecord,
          current: page,
          pages: Math.ceil(attendanceRecordDB.length / forPage),
          ie: institution,
          username,
          option,
          startDate,
          endDate,
        });
      }
    }
  } catch (error) {
    res.render("attendanceRecord/index", {
      user,
      turno: turnoIE.nombreHorario,
    });
  }
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
            const datetimeExcel = numeroAFecha(element[1], true);
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
          let horaEntrada1 = convertirATotalMinutos("08:00:00");
          let horaEntrada1Hasta = convertirATotalMinutos("10:00:00");

          let horaEntrada2Desde = convertirATotalMinutos("14:00:00");
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
                if (horaMarco <= horaEntrada1Hasta) {
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
          res.redirect("/attendanceRecords/page1");
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
      res.redirect("/attendanceRecords/page1");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al agregar registro!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/attendanceRecords/page1");
  }
};
