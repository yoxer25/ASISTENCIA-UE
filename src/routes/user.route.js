// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as userCtrl from "../controllers/user.controller.js";
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

// rutas de la página principal
router.get("/page:num", requireToken, userCtrl.getUsers);
router.get("/create", requireToken, userCtrl.getCreate);
router.post("/", requireToken, userCtrl.search);
router.post("/create", requireToken, userCtrl.set);
router.get("/:Id", requireToken, userCtrl.getById);
router.put("/:Id", requireToken, userCtrl.set);
router.patch("/:Id", requireToken, userCtrl.set);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
