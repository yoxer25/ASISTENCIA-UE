// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as specialistCtrl from "../controllers/specialist.controller.js";
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

const router = Router();

// rutas de la página áreas
router.get("/", requireToken, authorize(["administrador"]), specialistCtrl.getSpecialist);
router.post("/", requireToken, authorize(["administrador"]), specialistCtrl.set);
router.get("/:idSpecialist", requireToken, authorize(["administrador"]), specialistCtrl.getById);
router.put("/:idSpecialist", requireToken, authorize(["administrador"]), specialistCtrl.set);
router.patch("/:idSpecialist", requireToken, authorize(["administrador"]), specialistCtrl.set);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;