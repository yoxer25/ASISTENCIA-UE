import { genarateToken } from "../helpers/tokenManager.js";
import { User } from "../models/user.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página del login
export const getSignIn = async (req, res) => {
  res.render("login/login");
};

/* función para iniciar sesión, si las credenciales
son correctas, se le genera un token y se le
redirecciona a la página principal */
export const signIn = async (req, res) => {
  const { userModularCode, userPassword } = req.body;
  try {
    const user = await User.login(userModularCode, userPassword);
    const { token } = genarateToken(user.idUser, user.nombre, user.rol);
    res
      .cookie("access_token", token, {
        httpOnly: true,
        //secure: true,
        sameSite: "strict",
        //maxAge: 1000 * 60 * 60, // la cookie durará 1h
      })
      .redirect("/");
  } catch (error) {
    // Si el registro falla
    res.cookie("error", ["¡Datos Incorrectos!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/myaccount/signIn");
  }
};

// función para cerrar sesión
export const logOut = async (req, res) => {
  res.clearCookie("access_token").redirect("/myaccount/signIn");
};
