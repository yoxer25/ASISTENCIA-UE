// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as homeCtrl from "../controllers/home.controller.js";

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


// rutas de la página principal
router.get("/", requireToken, authorize(["administrador", "directivo", "otros"], ["RECURSOS HUMANOS"]), homeCtrl.getHome);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;