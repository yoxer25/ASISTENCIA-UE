// para verificar el token del usuario
import jwt from "jsonwebtoken";
// función para verificar si el token es verdadero
export const requireToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) throw new Error("No Autorizado");

    const data = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.session = { user: null };
    req.session.user = data;

    next();
  } catch (error) {
    res.redirect("/myaccount/signIn")
  }
};
