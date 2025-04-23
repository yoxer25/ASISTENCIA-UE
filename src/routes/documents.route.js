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
const upload = multer({ dest: "src/documents/" });
const router = Router();

// rutas de la página documentos de gestión
router.get("/", requireToken, documentsCtrl.getDocuments);
router.post("/", requireToken, documentsCtrl.getDocumentsByIE);
router.get("/:anio", requireToken, documentsCtrl.getDocumentByName);
router.post("/:anio", requireToken, documentsCtrl.fileProfesor);
router.get(
  "/file/:idCarpeta",
  requireToken,
  documentsCtrl.getDocumentByProfesor
);
router.post(
  "/ie/:idIE",
  requireToken,
  upload.single("pdfIE"),
  documentsCtrl.documentIE
);
router.post(
  "/file/:idCarpeta",
  requireToken,
  upload.single("pdfProfesor"),
  documentsCtrl.documentProfesor
);
router.get("/view/:archive", requireToken, documentsCtrl.viewPDF);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
