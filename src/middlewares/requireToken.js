// para verificar el token del usuario
import jwt from "jsonwebtoken";
// función para verificar si el token es verdadero
export const requireToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) throw new Error("No autorizado");

    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    res.redirect("/myaccount/signIn");
  }
};