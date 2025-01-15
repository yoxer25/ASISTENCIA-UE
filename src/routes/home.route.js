// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";
const router = Router();

import * as homeCtrl from "../controllers/home.controller.js";

router.get('/', homeCtrl.getHome)

// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;