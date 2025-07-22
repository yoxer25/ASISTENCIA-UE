import dayjs from "dayjs";

export const authorize = (roles, allowedSpecialties) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) return res.redirect("/myaccount/signIn");

    const { rol, especialista, lastPasswordUpdate } = user;

    // Chequeo de contraseña caducada
    const now = dayjs();
    const lastUpdate = dayjs(lastPasswordUpdate);
    const daysSinceUpdate = now.diff(lastUpdate, "day");

    // Permitir siempre el acceso a la ruta de cambio de contraseña
    const isChangingPassword = req.path.includes("/changePassword");

    if (daysSinceUpdate >= 30 && !isChangingPassword) {
      // Redirigir obligatoriamente a cambiar la contraseña
      return res.redirect("/myaccount/changePassword");
    }

    // Verificar rol permitido
    if (!roles.includes(rol)) {
      return res.render("errors/403");
    }

    // Verificar especialidad si es "otros"
    if (rol === "otros") {
      if (!allowedSpecialties || !allowedSpecialties.includes(especialista)) {
        return res.render("errors/403");
      }
    }

    // Todo ok
    next();
  };
};
