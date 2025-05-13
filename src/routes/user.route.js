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
import { authorize } from "../middlewares/authorization.js";

const router = Router();

// rutas de la página usuarios
router.get("/page:num", requireToken, authorize(["administrador"]), userCtrl.getUsers);
router.get("/create", requireToken, authorize(["administrador"]), userCtrl.getCreate);
router.post("/", requireToken, authorize(["administrador"]), userCtrl.search);
router.post("/create", requireToken, authorize(["administrador"]), userCtrl.set);
router.get("/:Id", requireToken, authorize(["administrador"]), userCtrl.getById);
router.put("/:Id", requireToken, authorize(["administrador"]), userCtrl.set);
router.patch("/:Id", requireToken, authorize(["administrador"]), userCtrl.set);

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
