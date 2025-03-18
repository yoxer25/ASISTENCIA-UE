import { AttendanceRecord } from "../models/attendanceRecord.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de reportes
export const getReport = async (req, res) => {
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
      res.render("report/index", {
        user,
        attendanceRecord,
        current: page,
        pages: Math.ceil(counts.records / forPage),
      });
    } else {
      const attendanceRecord = await AttendanceRecord.getAttendanceRecord(
        institution
      );
      res.render("report/index", { user, attendanceRecord });
    }
  } catch (error) {
    console.log(error.message);
    res.render("report/index", { user });
  }
};
