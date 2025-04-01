// para subir archivos a la web
import multer from "multer";

// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as attendanceRecordCtrl from "../controllers/attendanceRecord.controller.js";

/* para proteger nuestras rutas
privadas, se verificará el
token que nos están
enviando a través de las
cookies */
/* si el token es verdadero,
podrá acceder a estas rutas;
caso contrario, no podrá acceder */
import { requireToken } from "../middlewares/requireToken.js";
const router = Router();

const upload = multer({ dest: "src/archives/" });

// rutas de la página principal
router.get("/importData", requireToken, attendanceRecordCtrl.getImportData);
router.post("/importData", requireToken, upload.single("excel"), attendanceRecordCtrl.importData);
router.post("/", requireToken, attendanceRecordCtrl.getAttendanceRecord);
router.get("/page:num", requireToken, attendanceRecordCtrl.getData);
router.delete("/:Id", requireToken, attendanceRecordCtrl.deleteById);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;