import { helpers } from "../helpers/helper.js";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";
import XlsxPopulate from "xlsx-populate"; // para crear el excel del reporte
import { Institution } from "../models/institution.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

//controla lo que se debe mostrar al momento de visitar la página de asistencia
export const getData = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  const user = req.user;
  const institution = user.name;
  const [turnoIE] = await Institution.getInstitutionById(institution);
  try {
    const attendanceRecordDB = await AttendanceRecord.getData(institution);
    let attendanceRecord = attendanceRecordDB.slice(
      page * forPage - forPage,
      page * forPage
    );
    res.render("report/index", {
      user,
      turno: turnoIE.nombreHorario,
      ie: institution,
      attendanceRecord,
      current: page,
      pages: Math.ceil(attendanceRecordDB.length / forPage),
      option: null,
    });
  } catch (error) {
    res.render("report/index", { user, turno: turnoIE.nombreHorario });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de asistencia por fechas o usuarios
export const getReport = async (req, res) => {
  let forPage = 10;
  const user = req.user;
  const rol = user.rol;
  const institution = user.name;
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
          res.render("report/index", {
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
          res.render("report/index", {
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
          res.render("report/index", {
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
          res.render("report/index", {
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
        res.render("report/index", {
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
        res.render("report/index", {
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
    res.render("report/index", { user, turno: turnoIE.nombreHorario });
  }
};

// para generar el archivo excel del reporte
export const generateExcel = async (req, res, next) => {
  try {
    const { ie, option, username, startDate, endDate } = req.body;
    // si element.nombreTurno === "ue"
    let horaEntrada = convertirATotalMinutos("08:00:00"); // 480
    let horaSalida = convertirATotalMinutos("13:00:00"); // 780
    let horaEntrada2 = convertirATotalMinutos("14:15:00"); // 855
    let horaSalida2 = convertirATotalMinutos("17:00:00"); // 1020

    //según RI pasados 30 min en la hora de entra es una inasistencia
    let horaRI = convertirATotalMinutos("08:31:00"); //510

    const [turnoIE] = await Institution.getInstitutionById(ie);

    const workbook = await XlsxPopulate.fromBlankAsync();
    workbook.sheet("Sheet1").cell("A1").value("DOCUMENTO");
    workbook.sheet("Sheet1").cell("B1").value("NOMBRES Y APELLIDOS");
    workbook.sheet("Sheet1").cell("C1").value("ID RELOJ");
    workbook.sheet("Sheet1").cell("D1").value("FECHA_REGISTRO");
    workbook.sheet("Sheet1").cell("E1").value("PRIMERA ENTRADA");
    workbook.sheet("Sheet1").cell("F1").value("PRIMERA SALIDA");
    if (turnoIE.nombreHorario === "ue") {
      workbook.sheet("Sheet1").cell("G1").value("SEGUNDA ENTRADA");
      workbook.sheet("Sheet1").cell("H1").value("SEGUNDA SALIDA");
      workbook.sheet("Sheet1").cell("I1").value("TIEMPO NO TRABAJADO");
      workbook.sheet("Sheet1").cell("J1").value("OBSERVACIONES");
    } else {
      workbook.sheet("Sheet1").cell("G1").value("TIEMPO NO TRABAJADO");
      workbook.sheet("Sheet1").cell("H1").value("OBSERVACIONES");
    }

    let reportes = [];
    if (username) {
      if (option === "dni") {
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          ie,
          startDate,
          endDate,
          undefined,
          username
        );
        reportes.push(...attendanceRecordDB);
      }
      if (option === "name") {
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          ie,
          startDate,
          endDate,
          username,
          undefined
        );
        reportes.push(...attendanceRecordDB);
      }
    } else {
      const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
        ie,
        startDate,
        endDate
      );
      reportes.push(...attendanceRecordDB);
    }

    for (let i = 0; i < reportes.length; i++) {
      const element = reportes[i];
      if (element.nombreTurno === "jec") {
        horaEntrada = convertirATotalMinutos("08:00:00"); // 480
        horaSalida = convertirATotalMinutos("15:30:00"); // 930
      }
      if (element.nombreTurno === "ceba") {
        horaEntrada = convertirATotalMinutos("18:00:00"); // 1080
        horaSalida = convertirATotalMinutos("23:00:00"); // 1380
      }
      if (element.nombreTurno === "tarde") {
        horaEntrada = convertirATotalMinutos("13:00:00"); // 780
        horaSalida = convertirATotalMinutos("18:00:00"); //1080
      }
      if (element.nombreTurno === "jer") {
        horaEntrada = convertirATotalMinutos("08:00:00"); // 480
        horaSalida = convertirATotalMinutos("13:45:00"); // 825
      }
      if (element.nombreTurno === "mañana") {
        horaEntrada = convertirATotalMinutos("08:00:00"); // 480
        horaSalida = convertirATotalMinutos("13:00:00"); // 780
      }
      const dateTimeFormat = helpers.formatDate(element.fechaRegistro);

      let minutosPrimeraEntrada = convertirATotalMinutos(
        element.primeraEntrada
      );
      let minustosPrimeraSalida = convertirATotalMinutos(element.primeraSalida);
      let minustosSegundaEntrada = convertirATotalMinutos(
        element.segundaEntrada
      );
      let minustosSegundaSalida = convertirATotalMinutos(element.segundaSalida);

      if (
        minutosPrimeraEntrada === null ||
        minutosPrimeraEntrada <= horaEntrada
      ) {
        minutosPrimeraEntrada = 0;
      }
      if (
        minustosPrimeraSalida === null ||
        minustosPrimeraSalida > horaSalida
      ) {
        minustosPrimeraSalida = 0;
      }
      if (
        minustosSegundaEntrada === null ||
        minustosSegundaEntrada <= horaEntrada2
      ) {
        minustosSegundaEntrada = 0;
      }
      if (
        minustosSegundaSalida === null ||
        minustosSegundaSalida > horaSalida2
      ) {
        minustosSegundaSalida = 0;
      }
      let primeraTardanza = minutosPrimeraEntrada - horaEntrada;
      let segundaTardanza = minustosSegundaEntrada - horaEntrada2;
      let primeraFalta = horaSalida - minustosPrimeraSalida;
      let segundaFalta = horaSalida2 - minustosSegundaSalida;

      if (minutosPrimeraEntrada <= 0) {
        primeraTardanza = 0;
      }
      if (minustosPrimeraSalida <= 0) {
        primeraFalta = 0;
      }
      if (minustosSegundaEntrada <= 0) {
        segundaTardanza = 0;
      }
      if (minustosSegundaSalida <= 0) {
        segundaFalta = 0;
      }

      let message = "";
      if (element.nombreTurno === "ue") {
        const tieneHorasSinMarcar =
          element.primeraEntrada === null ||
          element.primeraSalida === null ||
          element.segundaEntrada === null ||
          element.segundaSalida === null;
        if (tieneHorasSinMarcar && minutosPrimeraEntrada >= horaRI) {
          message = "Tiene horas sin marcar e inasistencia según RI";
        } else if (tieneHorasSinMarcar) {
          message = "Tiene horas sin marcar";
        } else if (minutosPrimeraEntrada >= horaRI) {
          message = "Inasistencia según RI";
        }
      } else {
        if (element.primeraEntrada === null || element.primeraSalida === null) {
          message = "Tiene horas sin marcar";
        }
      }

      let minNoTrabajados = 0;

      workbook
        .sheet("Sheet1")
        .cell("A" + (i + 2))
        .value(element.dniPersonal);
      workbook
        .sheet("Sheet1")
        .cell("B" + (i + 2))
        .value(element.nombrePersonal);
      workbook
        .sheet("Sheet1")
        .cell("C" + (i + 2))
        .value(element.idReloj);
      workbook
        .sheet("Sheet1")
        .cell("D" + (i + 2))
        .value(dateTimeFormat);
      workbook
        .sheet("Sheet1")
        .cell("E" + (i + 2))
        .value(element.primeraEntrada);
      workbook
        .sheet("Sheet1")
        .cell("F" + (i + 2))
        .value(element.primeraSalida);

      if (element.nombreTurno === "ue") {
        minNoTrabajados =
          primeraTardanza + primeraFalta + segundaTardanza + segundaFalta;
        // Convertir minutos en horas y minutos (si supera los 59 minutos)
        const hrs = Math.floor(minNoTrabajados / 60);
        const minutosRestantes = minNoTrabajados % 60;

        workbook
          .sheet("Sheet1")
          .cell("G" + (i + 2))
          .value(element.segundaEntrada);
        workbook
          .sheet("Sheet1")
          .cell("H" + (i + 2))
          .value(element.segundaSalida);

        // Mostrar las horas y minutos correctamente si hay más de 0 minutos
        if (hrs > 0) {
          workbook
            .sheet("Sheet1")
            .cell("I" + (i + 2))
            .value(hrs + "h " + Math.floor(minutosRestantes) + " minutos");
        } else {
          workbook
            .sheet("Sheet1")
            .cell("I" + (i + 2))
            .value(Math.floor(minutosRestantes) + " minutos");
        }

        workbook
          .sheet("Sheet1")
          .cell("J" + (i + 2))
          .value(message);
      } else {
        minNoTrabajados = primeraTardanza + primeraFalta;
        // Convertir minutos en horas y minutos (si supera los 59 minutos)
        const hrs = Math.floor(minNoTrabajados / 60);
        const minutosRestantes = minNoTrabajados % 60;
        if (hrs > 0) {
          workbook
            .sheet("Sheet1")
            .cell("G" + (i + 2))
            .value(hrs + "h " + Math.floor(minutosRestantes) + " minutos");
        } else {
          workbook
            .sheet("Sheet1")
            .cell("G" + (i + 2))
            .value(Math.floor(minutosRestantes) + " minutos");
        }
        workbook
          .sheet("Sheet1")
          .cell("H" + (i + 2))
          .value(message);
      }
    }
    workbook.toFileAsync("./src/archives/reporte.xlsx");
    next();
  } catch (error) {
    res.cookie("error", ["¡Ocurrió un error al generar el reporte!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/reports/page1");
  }
};

// para descargar el reporte
export const download = async (req, res) => {
  try {
    function downloadExcel() {
      res.download("./src/archives/reporte.xlsx");
    }
    setTimeout(downloadExcel, 2000);
  } catch (error) {
    res.cookie("error", ["¡Ocurrió un error al descargar el reporte!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/reports/page1");
  }
};

// para convertir HH:MM:SS a minutos
const convertirATotalMinutos = (tiempo) => {
  if (tiempo !== null) {
    let [horas, minutos, segundos] = tiempo.split(":").map(Number);
    let totalSegundos = horas * 3600 + minutos * 60 + segundos;
    let totalMinutos = totalSegundos / 60;
    return totalMinutos;
  } else {
    return null;
  }
};