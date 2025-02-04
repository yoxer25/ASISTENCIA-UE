// para subir archivos a la web
import multer from "multer";

// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as homeCtrl from "../controllers/home.controller.js";
const router = Router();

const upload = multer({ dest: "src/archives/" });

// rutas de la página principal
router.get("/", homeCtrl.getHome);
router.post("/importbd", upload.single("excel"), homeCtrl.importBD);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;