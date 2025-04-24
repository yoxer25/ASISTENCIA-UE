import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";
import { TurnPersonal } from "../models/turnPersonal.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de trabajadores por II.EE
export const getPersonalByIE = async (req, res) => {
  let forPage = 10;
  const user = req.session;
  let { username, page } = req.body;
  if (page !== "") {
    page = page;
  } else {
    page = 1;
  }
  try {
    if (username) {
      const personalsDB = await Personal.getPersonal(username);
      const institutions = await Institution.getInstitution();
      const [ieDB] = await Institution.getInstitutionById(username);
      const ie = `${ieDB.nombreNivel} - ${ieDB.nombreInstitucion}`;
      let personals = personalsDB.slice(
        page * forPage - forPage,
        page * forPage
      );
      res.render("personal/index", {
        user,
        institutions,
        username,
        ie,
        personals,
        current: page,
        pages: Math.ceil(personalsDB.length / forPage),
      });
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Seleccione una IE para buscar!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Seleccione una IE para buscar");
    }
  } catch (error) {
    res.redirect("/personals/page1");
  }
};

// controla lo que se debe mostrar al momento de visitar la página de trabajadores
export const getPersonal = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.session;
  const institution = user.user.name;
  const institutions = await Institution.getInstitution();
  try {
    const personals = await Personal.getPersonal(institution, ofset);
    const [counts] = await Personal.countPersonals(institution);

    res.render("personal/index", {
      user,
      institutions,
      personals,
      current: page,
      pages: Math.ceil(counts.personals / forPage),
    });
  } catch (error) {
    res.render("personal/index", { user, institutions });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de crear nuevo trabajador
export const getCreate = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  try {
    const [institutionDB] = await Institution.getInstitutionById(institution);
    const turnPersonalDB = await TurnPersonal.getTurnPersonal();
    const turnPersonal = turnPersonalDB.slice(0, 2);
    res.render("personal/create", {
      user,
      turnPersonal,
      turnoIE: institutionDB.idTurnoInstitucion,
    });
  } catch (error) {
    res.render("personal/create", { user });
  }
};

/* función para crear un nuevo trabajador, se consulta
a la base de datos si existe un registro con el
número de DNI; si no existe, se guarda en la db */

/* Si a través del formulario nos envían el _method PUT
o PATCH, se actualizará la información del trabajador;
caso contrario, si no se envía el _method, se procederá
a crear un nuevo trabajador */
export const set = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  const { documentNumber, fullName, idReloj, _method } = req.body;
  let { turnPersonal } = req.body;
  const { Id } = req.params;
  const [institutionDB] = await Institution.getInstitutionById(institution);
  if (institutionDB.nombreHorario === "regular") {
    turnPersonal = turnPersonal;
  } else {
    const [turnPersonalDB] = await TurnPersonal.getByName(
      institutionDB.nombreHorario
    );
    turnPersonal = turnPersonalDB.idTurnoPersonal;
  }
  try {
    validationInput(documentNumber, fullName, idReloj, res);
    if (_method) {
      const [relojId] = await Personal.getIdReloj(institution, idReloj);
      const [personal] = await Personal.getForCreate(
        documentNumber,
        institution
      );
      if (relojId) {
        if (personal) {
          if (
            personal.idPersonal === Number(Id) &&
            relojId.idPersonal === Number(Id)
          ) {
            const resDb = await Personal.set(
              documentNumber,
              institution,
              fullName,
              idReloj,
              turnPersonal,
              Id,
              _method
            );
            if (resDb.affectedRows > 0) {
              // Si el registro es exitoso
              res.cookie("success", ["¡Actualización exitosa!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              res.redirect("/personals/page1");
            } else {
              // Si el registro falla
              res.cookie("error", ["¡Error al agregar registro!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              throw new Error("Error al agregar registro");
            }
          } else {
            // Si el registro falla
            res.cookie("error", ["¡Registro ya existe!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            throw new Error("Registro ya existe");
          }
        } else {
          if (relojId.idPersonal === Number(Id)) {
            const resDb = await Personal.set(
              documentNumber,
              institution,
              fullName,
              idReloj,
              turnPersonal,
              Id,
              _method
            );
            if (resDb.affectedRows > 0) {
              // Si el registro es exitoso
              res.cookie("success", ["¡Actualización exitosa!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              res.redirect("/personals/page1");
            } else {
              // Si el registro falla
              res.cookie("error", ["¡Error al agregar registro!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              throw new Error("Error al agregar registro");
            }
          } else {
            // Si el registro falla
            res.cookie("error", ["¡Registro ya existe!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            throw new Error("Registro ya existe");
          }
        }
      } else {
        if (personal) {
          if (personal.idPersonal === Number(Id)) {
            const resDb = await Personal.set(
              documentNumber,
              institution,
              fullName,
              idReloj,
              turnPersonal,
              Id,
              _method
            );
            if (resDb.affectedRows > 0) {
              // Si el registro es exitoso
              res.cookie("success", ["¡Actualización exitosa!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              res.redirect("/personals/page1");
            } else {
              // Si el registro falla
              res.cookie("error", ["¡Error al agregar registro!"], {
                httpOnly: true,
                maxAge: 6000,
              }); // 6 segundos
              throw new Error("Error al agregar registro");
            }
          } else {
            // Si el registro falla
            res.cookie("error", ["¡Registro ya existe!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            throw new Error("Registro ya existe");
          }
        } else {
          const resDb = await Personal.set(
            documentNumber,
            institution,
            fullName,
            idReloj,
            turnPersonal,
            Id,
            _method
          );
          if (resDb.affectedRows > 0) {
            // Si el registro es exitoso
            res.cookie("success", ["¡Actualización exitosa!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            res.redirect("/personals/page1");
          } else {
            // Si el registro falla
            res.cookie("error", ["¡Error al agregar registro!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            throw new Error("Error al agregar registro");
          }
        }
      }
    } else {
      const [relojId] = await Personal.getIdReloj(institution, idReloj);
      if (!relojId) {
        const [personal] = await Personal.getForCreate(
          documentNumber,
          institution
        );
        if (!personal) {
          const resDb = await Personal.set(
            documentNumber,
            institution,
            fullName,
            idReloj,
            turnPersonal
          );
          if (resDb.affectedRows > 0) {
            // Si el registro es exitoso
            res.cookie("success", ["¡Registro exitoso!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            res.redirect("/personals/page1");
          } else {
            // Si el registro falla
            res.cookie("error", ["¡Error al agregar registro!"], {
              httpOnly: true,
              maxAge: 6000,
            }); // 6 segundos
            throw new Error("Error al agregar registro");
          }
        } else {
          // Si el registro falla
          res.cookie("error", ["¡Registro ya existe!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          throw new Error("Registro ya existe");
        }
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Registro ya existe!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Registro ya existe");
      }
    }
  } catch (error) {
    res.redirect("/personals/create");
  }
};

// controla lo que se debe mostrar al momento de visitar la página de actualizar datos de un trabajador
export const getById = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  try {
    const { Id } = req.params;
    const [personal] = await Personal.getPersonalById(Id);

    const turnPersonalDB = await TurnPersonal.getSelectTurnPersonal(Id);
    const turnPersonal = turnPersonalDB.slice(0, 1);
    const [institutionDB] = await Institution.getInstitutionById(institution);
    res.render("personal/update", {
      user,
      personal,
      turnPersonal,
      turnoIE: institutionDB.idTurnoInstitucion,
    });
  } catch (error) {
    res.render("personal/update", { user });
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (documentNumber, fullName, idReloj, res) => {
  if (documentNumber === "" || fullName === "" || idReloj === "") {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
  if (documentNumber.length < 8 || documentNumber.length > 8) {
    res.cookie("error", ["¡DNI Inválido!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("DNI Inválido");
  }
};
