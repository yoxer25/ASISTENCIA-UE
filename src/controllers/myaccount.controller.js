import { genarateToken } from "../helpers/tokenManager.js";
import { User } from "../models/user.model.js";
//función para mostrar la vista del login
export const getSignIn = async (req, res) => {
  res.render("login/login");
};

// función para iniciar sesión
export const signIn = async (req, res) => {
  const { userModularCode, userPassword } = req.body;
  try {
    const user = await User.login(userModularCode, userPassword);
    const { token, expiresIn } = genarateToken(
      user.idUser,
      user.nombre,
      user.rol
    );
    res
      .cookie("access_token", token, expiresIn, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      })
      .redirect("/");
  } catch (error) {
    res.redirect("/myaccount/signIn");
  }
};

// función para cerrar sesión
export const logOut = async (req, res) => {
  res.clearCookie("access_token").redirect("/myaccount/signIn");
};
