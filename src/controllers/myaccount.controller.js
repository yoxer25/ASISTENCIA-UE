import { password } from "../helpers/password.js";
import { genarateToken } from "../helpers/tokenManager.js";
import { User } from "../models/user.model.js";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
      secure: true,
      sameSite: "strict",
      //maxAge: 1000 * 60 * 60, // la cookie durará 1h
    });

    // Verificamos la fecha de cambio de contraseña
    if (user.lastPasswordUpdate) {
      const fechaCambio = dayjs(user.lastPasswordUpdate);
      const hoy = dayjs();
      const diasPasados = hoy.diff(fechaCambio, "day");

      if (diasPasados >= 30) {
        res.cookie(
          "notification",
          JSON.stringify({
            message:
              "Su contraseña ha caducado. Debe cambiarla para continuar.",
            forceChange: true,
          }),
          {
            maxAge: 1000 * 60 * 60,
            httpOnly: false,
            sameSite: "Strict",
          }
        );
      } else if (diasPasados >= 23) {
        const diasFaltantes = 30 - diasPasados;
        res.cookie(
          "notification",
          JSON.stringify({
            message: `Le quedan ${diasFaltantes} días, debe cambiar su contraseña.`,
            forceChange: false,
          }),
          {
            maxAge: 1000 * 60 * 60,
            httpOnly: false,
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
      if (user.especialista === "S/E") {
        return res.redirect("/ballots");
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

// controla lo que se debe mostrar al seleccionar cambiar contraseña
export const getUpdatePassword = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect("/myaccount/signIn");
  }
  res.render("login/password", { user });
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

/* para reestablecer la contraseña por medio de correo
electrónico, cuando el usuario ha olvidado su contraseña */
const RESET_TOKEN_SECRET = process.env.RESET_PASSWORD_SECRET;
const RESET_TOKEN_EXPIRATION = "10m"; // token expira en 10 minutos

// Muestra formulario para ingresar el correo
export const getForgotPasswordForm = (req, res) => {
  res.render("login/forgot-password");
};

// Envía enlace de reseteo por correo
export const sendResetPasswordLink = async (req, res) => {
  const { user } = req.body;
  const userDB = await User.findByUsuario(user);

  if (!userDB) {
    return res
      .cookie("error", ["Usuario no encontrado."])
      .redirect("/myaccount/forgot-password");
  }
  const usuario = userDB[0];
  if (usuario.correo !== "") {
    const token = jwt.sign({ id: usuario.idUsuario }, RESET_TOKEN_SECRET, {
      expiresIn: RESET_TOKEN_EXPIRATION,
    });

    const url = process.env.BASE_URL;

    const resetLink = `${url}/myaccount/reset-password/${token}`;

    // Envío de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Soporte" <soporte@example.com>',
      to: usuario.correo,
      subject: "Restablecer contraseña",
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetLink}">Restablecer Contraseña</a>`,
    });

    res.cookie("success", [`Se ha enviado un mensaje a ${usuario.correo}.`], {
      httpOnly: true,
      maxAge: 6000,
    });
    res.redirect("/myaccount/signIn");
  } else {
    return res
      .cookie("error", ["No tiene un correo registrado. Actualice sus datos."])
      .redirect("/myaccount/forgot-password");
  }
};

// Muestra formulario para ingresar nueva contraseña
export const getResetPasswordForm = (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, RESET_TOKEN_SECRET);
    res.render("login/reset-password", { token });
  } catch (error) {
    res.send("El enlace ha expirado o no es válido.");
  }
};

// Procesa la nueva contraseña
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, RESET_TOKEN_SECRET);
    validationInput(newPassword, res);
    const passwordHash = await password.encryptPassword(newPassword);
    const resDB = await User.updatePassword(decoded.id, passwordHash);
    if (resDB.affectedRows > 0) {
      res.cookie("success", ["¡Contraseña restablecida con éxito!"], {
        httpOnly: true,
        maxAge: 6000,
      });
      res.redirect("/myaccount/signIn");
    } else {
      throw new Error("No se pudo actualizar la contraseña.");
    }
  } catch (error) {
    res.cookie("error", ["Enlace inválido o expirado."], {
      httpOnly: true,
      maxAge: 6000,
    });
    res.redirect("/myaccount/signIn");
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (newPassword, res) => {
  if (newPassword === "") {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    });
    throw new Error("Todos los campos son obligatorios");
  }
};
