import { Area } from "../models/area.model.js";
import { Ballot } from "../models/ballot.model.js";
import { Correlative } from "../models/correlative.model.js";
import { Personal } from "../models/personal.model.js";
/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de vistar la página de papeletas
export const getBallot = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  const user = req.user;
  const dni = user.dniUser;
  const ie = user.name;

  try {
    let ballotsDB = [];
    let area = 0;
    const personalUE = await Personal.getPersonal(ie);
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    const areas = await Area.getAreas();
    if (Number(dni) === 200006) {
      ballotsDB = await Ballot.getBallots();
    } else {
      const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
      if (jefeArea) {
        area = jefeArea.idArea;
        if (jefeArea.idArea === 2 || jefeArea.idArea === 6) {
          ballotsDB = await Ballot.getBallots();
        } else {
          ballotsDB = await Ballot.getBallots(null, jefeArea.idArea);
        }
      } else {
        ballotsDB = await Ballot.getBallots(personal.idPersonal);
      }
    }
    const ballots = ballotsDB.slice(page * forPage - forPage, page * forPage);
    res.render("ballot/ballot", {
      user,
      ballots,
      personalUE,
      areas,
      area,
      current: page,
      pages: Math.ceil(ballotsDB.length / forPage),
    });
  } catch (error) {
    res.render("ballot/ballot", { user });
  }
};

// controla lo que se debe visualizar en el formulario de nueva papeleta
export const getBallotCreate = async (req, res) => {
  const user = req.user;
  const dni = user.dniUser;
  try {
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    res.render("ballot/create", {
      user,
      personal,
    });
  } catch (error) {
    res.render("ballot/create", { user });
  }
};

/* controla lo que se debe mostrar al momento de visitar la página de papeletas
de salida consultando por fecha o usuario (solo administrador y recursos humanos) */
export const getBallotSearch = async (req, res) => {
  let forPage = 10;
  const user = req.user;
  const ie = user.name;
  const dni = user.dniUser;
  const fechaActual = new Date();
  let year = fechaActual.getFullYear();
  let month = String(fechaActual.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son base 0
  let day = String(fechaActual.getDate()).padStart(2, "0");
  const personalUE = await Personal.getPersonal(ie);
  const areas = await Area.getAreas();
  console.log(user);

  try {
    let { date, page, username, dependency } = req.body;
    if (date !== "") {
      date = date;
    } else {
      date = `${year}-${month}-${day}`;
    }
    page = page || 1;
    let ballotsDB = [];
    let area = 0;
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    if (Number(dni) === 200006) {
      if (username) {
        ballotsDB = await Ballot.getBallotsSearch(
          null,
          null,
          username,
          null,
          date
        );
      }
      if (dependency) {
        ballotsDB = await Ballot.getBallotsSearch(
          null,
          null,
          null,
          dependency,
          date
        );
      }
    } else {
      const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
      if (jefeArea) {
        area = jefeArea.idArea;
        if (jefeArea.idArea === 2 || jefeArea.idArea === 6) {
          if (username) {
            ballotsDB = await Ballot.getBallotsSearch(
              null,
              null,
              username,
              null,
              date
            );
          }
          if (dependency) {
            ballotsDB = await Ballot.getBallotsSearch(
              null,
              null,
              null,
              dependency,
              date
            );
          }
        } else {
          if (username) {
            ballotsDB = await Ballot.getBallotsSearch(
              null,
              jefeArea.idArea,
              username,
              null,
              date
            );
          } else {
            ballotsDB = await Ballot.getBallotsSearch(
              null,
              jefeArea.idArea,
              null,
              null,
              date
            );
          }
        }
      } else {
        ballotsDB = await Ballot.getBallotsSearch(
          personal.idPersonal,
          null,
          null,
          null,
          date
        );
      }
    }
    const ballots = ballotsDB.slice(page * forPage - forPage, page * forPage);
    res.render("ballot/ballot", {
      user,
      ballots,
      area,
      areas,
      personalUE,
      date,
      current: page,
      pages: Math.ceil(ballotsDB.length / forPage),
    });
  } catch (error) {
    console.log(error.message);
    res.render("ballot/ballot", { user, personalUE, areas });
  }
};

// para registrar una papeleta
export const createBallot = async (req, res) => {
  const { applicant, dependency, workingCondition, reason, foundation } =
    req.body;
  let { startDate, endDate, startTime, endTime } = req.body;
  startDate = startDate || null;
  endDate = endDate || null;
  startTime = startTime || null;
  endTime = endTime || null;
  try {
    validationInput(
      applicant,
      dependency,
      workingCondition,
      reason,
      foundation,
      res
    );
    const correlative = await generateCorrelativo();
    const resDB = await Ballot.create(
      correlative,
      applicant,
      dependency,
      workingCondition,
      reason,
      foundation,
      startDate,
      endDate,
      startTime,
      endTime
    );
    if (resDB.affectedRows > 0) {
      await updateCorrelativo();
      // Si el registro es exitoso
      res.cookie("success", ["¡Registro exitoso!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      res.redirect("/ballots/page1");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al agregar registro!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/ballots/page1");
  }
};

// para aprobar papeletas
export const approve = async (req, res) => {
  const user = req.user;
  const dni = user.dniUser;
  const { id } = req.params;
  try {
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
    const [ballot] = await Ballot.getBallotById(id);
    await Ballot.update(id, jefeArea.idArea, ballot.idAreaPersonal);
    res.redirect("/ballots/page1");
  } catch (error) {
    // Si el registro falla
    res.cookie("error", ["¡Error al aprobar papeleta!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/ballots/page1");
  }
};

// Función para obtener y generar el número de las papeletas
const generateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelative();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo

  // Formateamos el correlativo con ceros a la izquierda
  const formattedCorrelativo = `${String(nuevoCorrelativo).padStart(6, "0")}`;

  return formattedCorrelativo; // Devolvemos el correlativo formateado
};

// Función para obtener y actualizar el correlativo en la tabla "correlativo"
const updateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelative();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo
  // Actualizamos el correlativo en la base de datos
  await Correlative.updateCorrelative(nuevoCorrelativo);
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (
  applicant,
  dependency,
  workingCondition,
  reason,
  foundation,
  res
) => {
  if (
    applicant === "" ||
    dependency === "" ||
    workingCondition === "" ||
    reason === "" ||
    foundation === ""
  ) {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
