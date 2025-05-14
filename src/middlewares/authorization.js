/* export const authorize = (roles, allowedSpecialties) => {
  return (req, res, next) => {
    const { rol, especialista } = req.session.user;

    // Verificar si el rol está permitido
    if (!roles.includes(rol)) {
      return res.render("403/403");
    }

    // Si el rol es "otros", verificar especialidad
    if (rol === "otros") {
      // Denegar acceso si no tiene una especialidad válida
      if (!allowedSpecialties || !allowedSpecialties.includes(especialista)) {
        return res.render("403/403");
      }
    }

    // Si es administrador o directivo, no se aplica restricción por especialidad
    next();
  };
}; */

import dayjs from "dayjs";

export const authorize = (roles, allowedSpecialties) => {
  return (req, res, next) => {
    const user = req.session.user;

    if (!user) return res.redirect("/myaccount/signIn");

    const { rol, especialista, lastPasswordUpdate } = user;

    // 1. Chequeo de contraseña caducada
    const now = dayjs();
    const lastUpdate = dayjs(lastPasswordUpdate);
    const daysSinceUpdate = now.diff(lastUpdate, "day");

    // Permitir siempre el acceso a la ruta de cambio de contraseña
    const isChangingPassword = req.path.includes("/changePassword");

    if (daysSinceUpdate >= 30 && !isChangingPassword) {
      // Redirigir obligatoriamente a cambiar la contraseña
      return res.redirect("/myaccount/changePassword");
    }

    // 2. Verificar rol permitido
    if (!roles.includes(rol)) {
      return res.render("403/403");
    }

    // 3. Verificar especialidad si es "otros"
    if (rol === "otros") {
      if (!allowedSpecialties || !allowedSpecialties.includes(especialista)) {
        return res.render("403/403");
      }
    }

    // Todo ok
    next();
  };
};
