import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";

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
  try {
    const personals = await Personal.getPersonal(institution, ofset);
    console.log(personals)
    const [counts] = await Personal.countPersonals(institution);
    const institutions = await Institution.getInstitution();

    res.render("personal/index", {
      user,
      institutions,
      personals,
      current: page,
      pages: Math.ceil(counts.personals / forPage),
    });
  } catch (error) {
    res.render("personal/index", { user });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de crear nuevo trabajador
export const getCreate = async (req, res) => {
  const user = req.session;
  try {
    const rolUser = await RolUser.getRolUser();
    const institution = await Institution.getInstitution();
    res.render("personal/create", { user, rolUser, institution });
  } catch (error) {
    res.render("personal/create", { user });
  }
};

/* función para crear un nuevo trabajador, se consulta
a la base de datos si existe un registro con el
número de DNI; si no existe, se guarda en la db */
export const set = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  const { documentNumber, fullName, idReloj, _method } = req.body;
  const { Id } = req.params;
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
            idReloj
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
    console.log(error.message);
    res.redirect("/personals/create");
  }
};

// controla lo que se debe mostrar al momento de visitar la página de actualizar datos de un trabajador
export const getById = async (req, res) => {
  const user = req.session;
  try {
    const { Id } = req.params;
    const [personal] = await Personal.getPersonalById(Id);
    res.render("personal/update", {
      user,
      personal,
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
