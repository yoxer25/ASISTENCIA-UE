// importamos lo necesario para poder usar las rutas de la página principal
import { Router } from "express";

// importamos todas las funciones para asignar cada función a una ruta de la web
import * as myaccountCtrl from "../controllers/myaccount.controller.js";
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

// rutas de la página mi cuenta
router.get("/signIn", myaccountCtrl.getSignIn);
router.get("/changePassword", requireToken, myaccountCtrl.getUpdatePassword);
router.post("/signIn", myaccountCtrl.signIn);
router.get("/LogOut", requireToken, myaccountCtrl.logOut);
router.put("/update:Id", requireToken, myaccountCtrl.updatePassword);


// Recuperación de contraseña
router.get("/forgot-password", myaccountCtrl.getForgotPasswordForm);
router.post("/forgot-password", myaccountCtrl.sendResetPasswordLink);
router.get("/reset-password/:token", myaccountCtrl.getResetPasswordForm);
router.post("/reset-password", myaccountCtrl.resetPassword);


// exportamos la constante "router" para llamarla desde "app.js" que es el archivo donde se configura toda la web
export default router;
