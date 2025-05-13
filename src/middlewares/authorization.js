export const authorize = (roles, allowedSpecialties) => {
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
};
