import { password } from "../helpers/password.js";
import { genarateToken } from "../helpers/tokenManager.js";
import { User } from "../models/user.model.js";
import dayjs from "dayjs";

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
  const { userName, userPassword } = req.body;
  try {
    const user = await User.login(userName, userPassword);
    const { token } = genarateToken(
      user.idUser,
      user.nombre,
      user.rol,
      user.dniUser,
      user.especialista,
      user.lastPasswordUpdate
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      //secure: true,
      sameSite: "strict",
      //maxAge: 1000 * 60 * 60, // la cookie durará 1h
    });

    // Verificamos la fecha de cambio de contraseña
    if (user.lastPasswordUpdate) {
      const fechaCambio = dayjs(user.lastPasswordUpdate);
      const hoy = dayjs();
      const diasPasados = hoy.diff(fechaCambio, "day");

      if (diasPasados >= 30) {
        // Cambiar la cookie para indicar que la contraseña ha caducado
        res.cookie(
          "notification",
          JSON.stringify({
            message:
              "Su contraseña ha caducado. Debe cambiarla para continuar.",
            forceChange: true,
          }),
          {
            maxAge: 1000 * 60 * 60, // 1 hora (para hacer pruebas más largas)
            httpOnly: false, // Esto es importante para que puedas acceder desde JS
            sameSite: "Strict",
          }
        );
      } else if (diasPasados >= 23) {
        const diasFaltantes = 30 - diasPasados;
        // Cambiar la cookie para indicar que la contraseña está cerca de caducar
        res.cookie(
          "notification",
          JSON.stringify({
            message: `Le quedan ${diasFaltantes} días, debe cambiar su contraseña.`,
            forceChange: false,
          }),
          {
            maxAge: 1000 * 60 * 60, // 1 hora
            httpOnly: false, // Esto es importante para que puedas acceder desde JS
            sameSite: "Strict",
          }
        );
      }
    }

    if (user.rol === "otros") {
      if (user.especialista === "AGP") {
        return res.redirect("/documents"); //
      }
      if (user.especialista === "RECURSOS HUMANOS") {
        return res.redirect("/");
      }
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    // Si el registro falla
    res.cookie("error", ["¡Datos Incorrectos!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/myaccount/signIn");
  }
};

// controlalo que se debe mostrar al seleccionar cambiar contraseña
export const getUpdatePassword = async (req, res) => {
  const user = req.session;
  console.log(user);

  if (!user) {
    return res.redirect("/myaccount/signIn"); // por si accede sin sesión
  }

  console.log("Usuario en sesión:", user);

  res.render("login/password", { user }); // ✅ ahora sí es el usuario real
};

/* función para actualizar la contraseña */
export const updatePassword = async (req, res) => {
  const { Id } = req.params;
  const { newPassword } = req.body;
  try {
    validationInput(newPassword, res);
    const passwordHash = await password.encryptPassword(newPassword);
    const resDB = await User.updatePassword(Id, passwordHash);
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
