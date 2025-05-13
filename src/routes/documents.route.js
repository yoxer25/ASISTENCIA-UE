// para subir archivos a la web
import multer from "multer";
// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as documentsCtrl from "../controllers/documents.controller.js";
/* para proteger nuestras rutas
privadas, se verificará el
token que nos están
enviando a través de las
cookies */
/* si el token es verdadero,
podrá acceder a estas rutas;
caso contrario, no podrá acceder */
import { requireToken } from "../middlewares/requireToken.js";
import { authorize } from "../middlewares/authorization.js";

const upload = multer({ dest: "src/documents/" });
const router = Router();

// rutas de la página documentos de gestión
router.get(
  "/",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  documentsCtrl.getDocuments
);
router.post(
  "/",
  requireToken,
  authorize(["administrador", "otros"], ["RECURSOS HUMANOS", "AGP"]),
  documentsCtrl.getDocumentsByIE
);
router.get(
  "/folder/:idCarpeta",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  documentsCtrl.getBySubFolder
);
router.post(
  "/folder/:idCarpeta",
  requireToken,
  authorize(["directivo"]),
  documentsCtrl.subfolderProfesor
);
router.get(
  "/file/:idCarpeta",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  documentsCtrl.getDocumentByProfesor
);
router.post(
  "/file/:idCarpeta",
  requireToken,
  authorize(["directivo"]),
  upload.single("pdfProfesor"),
  documentsCtrl.documentProfesor
);
router.post(
  "/ie/:anio/:source",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  upload.single("pdfIE"),
  documentsCtrl.documentIE
);
router.get(
  "/view/:archive",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  documentsCtrl.viewPDF
);
router.get(
  "/:anio/:source",
  requireToken,
  authorize(
    ["administrador", "directivo", "otros"],
    ["RECURSOS HUMANOS", "AGP"]
  ),
  documentsCtrl.getByAnio
);
router.post(
  "/:anio/:source",
  requireToken,
  authorize(["directivo"]),
  documentsCtrl.folderProfesor
);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
