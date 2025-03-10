// para encriptar y descifrar la contraseña del usuario
import bcrytp from "bcrypt";

// exportamos "password" para poder usar en todo el proyecto
export const password = {};

//para encriptar las contraseñas
password.encryptPassword = async (passwordFrontEnd) => {
  const salt = await bcrytp.genSalt(15);
  const hash = await bcrytp.hash(passwordFrontEnd, salt);
  return hash;
};

// para comparar la contraseña que ingresa el user con la que est guardada en la BD
password.matchPassword = async (passwordFrontEnd, passwordDB) => {
  try {
      return await bcrytp.compare(passwordFrontEnd, passwordDB);
  } catch (error) {
      console.log(error);
  }
};
