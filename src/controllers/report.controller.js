import { helpers } from "../helpers/helper.js";
import { AttendanceRecord } from "../models/attendanceRecord.model.js";
import XlsxPopulate from "xlsx-populate"; // para crear el excel del reporte
import { Institution } from "../models/institution.model.js";

// para los días
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

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

    let horaEntrada = convertirATotalMinutos("08:00:00");
    let horaSalida = convertirATotalMinutos("13:00:00");
    let horaEntrada2 = convertirATotalMinutos("14:15:00");
    let horaSalida2 = convertirATotalMinutos("17:00:00");
    let horaRI = convertirATotalMinutos("08:31:00");

    const [turnoIE] = await Institution.getInstitutionById(ie);
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet("Sheet1");

    sheet.cell("A1").value("DOCUMENTO").style("bold", true);
    sheet.cell("B1").value("NOMBRES Y APELLIDOS").style("bold", true);
    sheet.cell("C1").value("ID RELOJ").style("bold", true);
    sheet.cell("D1").value("FECHA_REGISTRO").style("bold", true);
    sheet.cell("E1").value("PRIMERA ENTRADA").style("bold", true);
    sheet.cell("F1").value("PRIMERA SALIDA").style("bold", true);
    if (turnoIE.nombreHorario === "ue") {
      sheet.cell("G1").value("SEGUNDA ENTRADA").style("bold", true);
      sheet.cell("H1").value("SEGUNDA SALIDA").style("bold", true);
      sheet.cell("I1").value("TIEMPO NO TRABAJADO").style("bold", true);
      sheet.cell("J1").value("PAPELETA N°").style("bold", true);
      sheet.cell("K1").value("OBSERVACIONES").style("bold", true);
    } else {
      sheet.cell("G1").value("TIEMPO NO TRABAJADO").style("bold", true);
      sheet.cell("H1").value("OBSERVACIONES").style("bold", true);
    }

    let reportes = [];
    if (username) {
      const records = await AttendanceRecord.getAttendanceRecord(
        ie,
        startDate,
        endDate,
        option === "name" ? username : undefined,
        option === "dni" ? username : undefined
      );
      reportes.push(...records);
    } else {
      const records = await AttendanceRecord.getAttendanceRecord(
        ie,
        startDate,
        endDate
      );
      reportes.push(...records);
    }

    // Agrupar registros por idReloj y fecha
    const registrosMap = {};
    reportes.forEach((r) => {
      const fecha = dayjs(r.fechaRegistro).format("YYYY-MM-DD");
      if (!registrosMap[r.idReloj]) registrosMap[r.idReloj] = {};
      registrosMap[r.idReloj][fecha] = r;
    });

    // Obtener trabajadores únicos
    const trabajadores = [
      ...new Map(
        reportes.map((r) => [
          r.idReloj,
          {
            idReloj: r.idReloj,
            dniPersonal: r.dniPersonal,
            nombrePersonal: r.nombrePersonal,
          },
        ])
      ).values(),
    ];

    const diasLaborables = obtenerDiasLaborables(startDate, endDate);
    let filaExcel = 2;

    for (const trabajador of trabajadores) {
      let subtotalMinutos = 0;

      for (const fecha of diasLaborables) {
        const element = registrosMap[trabajador.idReloj]?.[fecha];

        sheet.cell("A" + filaExcel).value(trabajador.dniPersonal);
        sheet.cell("B" + filaExcel).value(trabajador.nombrePersonal);
        sheet.cell("C" + filaExcel).value(trabajador.idReloj);
        sheet.cell("D" + filaExcel).value(fecha);

        if (!element) {
          if (turnoIE.nombreHorario === "ue") {
            sheet.cell("E" + filaExcel).value("-");
            sheet.cell("F" + filaExcel).value("-");
            sheet.cell("G" + filaExcel).value("-");
            sheet.cell("H" + filaExcel).value("-");
            sheet.cell("I" + filaExcel).value("-");
            sheet.cell("J" + filaExcel).value("-");
            sheet.cell("K" + filaExcel).value("Inasistencia");
          } else {
            sheet.cell("E" + filaExcel).value("-");
            sheet.cell("F" + filaExcel).value("-");
            sheet.cell("G" + filaExcel).value("-");
            sheet.cell("H" + filaExcel).value("Inasistencia");
          }
          filaExcel++;
          continue;
        }

        if (element.nombreTurno === "jec") {
          horaEntrada = convertirATotalMinutos("08:00:00");
          horaSalida = convertirATotalMinutos("15:30:00");
        } else if (element.nombreTurno === "ceba") {
          horaEntrada = convertirATotalMinutos("18:00:00");
          horaSalida = convertirATotalMinutos("23:00:00");
        } else if (element.nombreTurno === "tarde") {
          horaEntrada = convertirATotalMinutos("13:00:00");
          horaSalida = convertirATotalMinutos("18:00:00");
        } else if (element.nombreTurno === "jer") {
          horaEntrada = convertirATotalMinutos("08:00:00");
          horaSalida = convertirATotalMinutos("13:45:00");
        } else if (element.nombreTurno === "mañana") {
          horaEntrada = convertirATotalMinutos("08:00:00");
          horaSalida = convertirATotalMinutos("13:00:00");
        }

        let minutosPrimeraEntrada = convertirATotalMinutos(
          element.primeraEntrada
        );
        let minutosPrimeraSalida = convertirATotalMinutos(
          element.primeraSalida
        );
        let minutosSegundaEntrada = convertirATotalMinutos(
          element.segundaEntrada
        );
        let minutosSegundaSalida = convertirATotalMinutos(
          element.segundaSalida
        );

        if (
          minutosPrimeraEntrada === null ||
          minutosPrimeraEntrada <= horaEntrada
        )
          minutosPrimeraEntrada = 0;
        if (minutosPrimeraSalida === null || minutosPrimeraSalida > horaSalida)
          minutosPrimeraSalida = 0;
        if (
          minutosSegundaEntrada === null ||
          minutosSegundaEntrada <= horaEntrada2
        )
          minutosSegundaEntrada = 0;
        if (minutosSegundaSalida === null || minutosSegundaSalida > horaSalida2)
          minutosSegundaSalida = 0;

        let primeraTardanza = minutosPrimeraEntrada - horaEntrada;
        let segundaTardanza = minutosSegundaEntrada - horaEntrada2;
        let primeraFalta = horaSalida - minutosPrimeraSalida;
        let segundaFalta = horaSalida2 - minutosSegundaSalida;

        if (minutosPrimeraEntrada <= 0) {
          primeraTardanza = 0;
        }
        if (minutosPrimeraSalida <= 0) {
          primeraFalta = 0;
        }
        if (minutosSegundaEntrada <= 0) {
          segundaTardanza = 0;
        }
        if (minutosSegundaSalida <= 0) {
          segundaFalta = 0;
        }

        let message = "";
        if (element.nombreTurno === "ue") {
          const sinMarcar =
            element.primeraEntrada === null ||
            element.primeraSalida === null ||
            element.segundaEntrada === null ||
            element.segundaSalida === null;
          if (sinMarcar && minutosPrimeraEntrada >= horaRI) {
            message = "Tiene horas sin marcar e inasistencia según RI";
          } else if (sinMarcar) {
            message = "Tiene horas sin marcar";
          } else if (minutosPrimeraEntrada >= horaRI) {
            message = "Inasistencia según RI";
          }
        } else {
          if (
            element.primeraEntrada === null ||
            element.primeraSalida === null
          ) {
            message = "Tiene horas sin marcar";
          }
        }

        let minNoTrabajados = 0;

        sheet.cell("E" + filaExcel).value(element.primeraEntrada);
        sheet.cell("F" + filaExcel).value(element.primeraSalida);

        if (element.nombreTurno === "ue") {
          minNoTrabajados =
            primeraTardanza + primeraFalta + segundaTardanza + segundaFalta;

          subtotalMinutos += Math.floor(minNoTrabajados);

          const hrs = Math.floor(minNoTrabajados / 60);
          const minutosRestantes = minNoTrabajados % 60;

          sheet.cell("G" + filaExcel).value(element.segundaEntrada);
          sheet.cell("H" + filaExcel).value(element.segundaSalida);
          sheet
            .cell("I" + filaExcel)
            .value(
              hrs > 0
                ? `${hrs}h ${Math.floor(minutosRestantes)} minutos`
                : `${Math.floor(minutosRestantes)} minutos`
            );
          sheet.cell("J" + filaExcel).value(element.numeroPapeleta);
          sheet.cell("K" + filaExcel).value(message);
        } else {
          minNoTrabajados = primeraTardanza + primeraFalta;
          subtotalMinutos += minNoTrabajados;

          const hrs = Math.floor(minNoTrabajados / 60);
          const minutosRestantes = minNoTrabajados % 60;
          sheet
            .cell("G" + filaExcel)
            .value(
              hrs > 0
                ? `${hrs}h ${Math.floor(minutosRestantes)} minutos`
                : `${Math.floor(minutosRestantes)} minutos`
            );
          sheet.cell("H" + filaExcel).value(message);
        }
        filaExcel++;
      }

      // Subtotal por trabajador
      const hrs = Math.floor(subtotalMinutos / 60);
      const minutosRestantes = subtotalMinutos % 60;
      sheet
        .cell("H" + filaExcel)
        .value(`TOTAL ID ${trabajador.idReloj}`)
        .style("bold", true);
      sheet
        .cell("I" + filaExcel)
        .value(
          hrs > 0
            ? `${hrs}h ${Math.floor(minutosRestantes)} minutos`
            : `${Math.floor(minutosRestantes)} minutos`
        )
        .style("bold", true);
      filaExcel++;
    }

    await workbook.toFileAsync("./src/archives/reporte.xlsx");
    next();
  } catch (error) {
    res.cookie("error", ["¡Ocurrió un error al generar el reporte!"], {
      httpOnly: true,
      maxAge: 6000,
    });
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

// para obtener los días laborables
const obtenerDiasLaborables = (startDate, endDate) => {
  let start = dayjs(startDate);
  const end = dayjs(endDate);
  const dias = [];

  while (start.isSameOrBefore(end)) {
    if (start.isoWeekday() <= 5) {
      dias.push(start.format("YYYY-MM-DD"));
    }
    start = start.add(1, "day");
  }

  return dias;
};
