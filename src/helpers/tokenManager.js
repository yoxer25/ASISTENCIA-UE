// para generar el token de usuario
import jwt from "jsonwebtoken";

export const genarateToken = (id, name, rol, dniUser) => {
  // const expiresIn = "1h";
  const expiresIn = 1000 * 60 * 60;
  try {
    const token = jwt.sign({ id, name, rol, dniUser }, process.env.SECRET_JWT_KEY, {
      expiresIn,
    });
    return { token };
  } catch (error) {
    const msg = error.message;
  }
};