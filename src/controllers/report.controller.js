import { AttendanceRecord } from "../models/attendanceRecord.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de reportes
export const getReport = async (req, res) => {
  let forPage = 10;
  const user = req.session;
  const rol = user.user.rol;
  const institution = user.user.name;
  const fechaActual = new Date();
  let year = fechaActual.getFullYear();
  let month = String(fechaActual.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son base 0
  let day = String(fechaActual.getDate()).padStart(2, "0");

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
    if (ie) {
      ie = ie;
    } else {
      const [nameIe] = await Institution.getInstitutionById(institution);
      ie = nameIe.nombreInstitucion;
    }
    const [idIE] = await Institution.getInstitutionByName(ie);
    [ie] = await Institution.getInstitutionById(idIE.idInstitucion);
    if (username) {
      if (rol === "administrador") {
        [ie] = await Institution.getInstitutionById(idIE.idInstitucion);
        if (option === "dni") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            idIE.idInstitucion,
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
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: ie.nombreInstitucion,
            username,
            option,
            startDate,
            endDate,
          });
        }
        if (option === "name") {
          const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
            idIE.idInstitucion,
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
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: ie.nombreInstitucion,
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
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: ie.nombreInstitucion,
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
            attendanceRecord,
            current: page,
            pages: Math.ceil(attendanceRecordDB.length / forPage),
            ie: ie.nombreInstitucion,
            username,
            option,
            startDate,
            endDate,
          });
        }
      }
    } else {
      console.log(req.body);
      if (rol === "administrador") {
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          idIE.idInstitucion,
          startDate,
          endDate
        );
        let attendanceRecord = attendanceRecordDB.slice(
          page * forPage - forPage,
          page * forPage
        );
        res.render("report/index", {
          user,
          attendanceRecord,
          current: page,
          pages: Math.ceil(attendanceRecordDB.length / forPage),
          ie: ie.nombreInstitucion,
          username,
          option,
          startDate,
          endDate,
        });
      } else {
        const attendanceRecordDB = await AttendanceRecord.getAttendanceRecord(
          idIE.idInstitucion,
          startDate,
          endDate
        );
        let attendanceRecord = attendanceRecordDB.slice(
          page * forPage - forPage,
          page * forPage
        );
        res.render("report/index", {
          user,
          attendanceRecord,
          current: page,
          pages: Math.ceil(attendanceRecordDB.length / forPage),
          ie: ie.nombreInstitucion,
          username,
          option,
          startDate,
          endDate,
        });
      }
    }
  } catch (error) {
    res.render("report/index", { user });
  }
};
