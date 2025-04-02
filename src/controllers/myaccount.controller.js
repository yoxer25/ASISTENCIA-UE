import { password } from "../helpers/password.js";
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

/* función para actualizar la contraseña */
export const updatePassword = async (req, res) => {
  const { Id } = req.params;
  const { newPassword } = req.body;
  try {
    validationInput(newPassword, res);
    const [userDB] = await User.getUserById(Id);
    const passwordHash = await password.encryptPassword(newPassword);
    const resDB = await User.updatePassword(
      Id,
      userDB.idInstitucion,
      userDB.idRol,
      passwordHash
    );
    if (resDB.affectedRows > 0) {
      // Si el registro es exitoso
      res.cookie("success", ["¡Actualización exitosa!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      res.redirect("/myaccount/LogOut");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al actualizar contraseña!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al actualizar contraseña");
    }
  } catch (error) {
    res.redirect("/");
  }
};

// función para cerrar sesión
export const logOut = async (req, res) => {
  res.clearCookie("access_token").redirect("/myaccount/signIn");
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (newPassword, res) => {
  if (newPassword === "") {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
