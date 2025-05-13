// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";
// importamos todas las funciones para asignar cada función a una ruta de la web
import * as institutionCtrl from "../controllers/institution.controller.js";
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

// rutas de la página instituciones
router.get("/page:num", requireToken, authorize(["administrador", "otros"], ["RECURSOS HUMANOS"]), institutionCtrl.getData);
router.get("/create", requireToken, authorize(["administrador"]), institutionCtrl.getCreate);
router.post("/create", requireToken, authorize(["administrador"]), institutionCtrl.set);
router.post("/", requireToken, authorize(["administrador", "otros"], ["RECURSOS HUMANOS"]), institutionCtrl.search);
router.get("/ie:Id", requireToken, authorize(["administrador"]), institutionCtrl.getById);
router.put("/ie:Id", requireToken, authorize(["administrador"]), institutionCtrl.set);
router.patch("/ie:Id", requireToken, authorize(["administrador"]), institutionCtrl.set);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
