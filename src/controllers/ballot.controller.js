// para generar PDF
import PDFDocument from "pdfkit";

// para ver la ruta del logo para el comprobante
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { helpers } from "../helpers/helper.js";

// models
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

// para ver la información completa de la papeleta, imprimirla o descargarla
export const viewBallot = async (req, res) => {
  const { id } = req.params;
  try {
    const [ballot] = await Ballot.getBallotById(id);
    const [rrhh] = await Area.getAreaById(6);
    const [adm] = await Area.getAreaById(2);
    const dateBallot = helpers.formatDate(ballot.fechaPapeleta);
    const dateStart = helpers.formatDate(ballot.desdeDia);
    const dateEnd = helpers.formatDate(ballot.hastaDia);
    const timeStart = ballot.desdeHora;
    const timeEnd = ballot.hastaHora;
    let desde, hasta;
    if (ballot.desdeDia !== null) {
      desde = dateStart;
    } else {
      desde = timeStart;
    }
    if (ballot.hastaDia !== null) {
      hasta = dateEnd;
    } else {
      hasta = timeEnd;
    }
    // Crear un documento PDF
    const doc = new PDFDocument({ size: "A4" });

    // Configurar las cabeceras para que el navegador lo muestre como PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Papeleta_${ballot.numeroPapeleta}.pdf"`
    );
    // Pasa el stream del documento PDF directamente a la respuesta
    doc.pipe(res);

    // Configurar fuente antes de medir texto
    doc.font("Courier-Bold");

    // para establecer la ruta hasta la carpeta "src"
    const _filename = fileURLToPath(import.meta.url);
    const _dirname = path.dirname(_filename);

    // Agregar contenido al PDF
    // Ruta de la imagen a agregar (puedes cambiarla a la ruta local o url que prefieras)
    const imagePath = path.resolve(
      _dirname,
      "../public/assets/img/logo-ue.png"
    );

    // Verificar si la imagen existe
    if (fs.existsSync(imagePath)) {
      // Agregar la imagen al PDF (esto va a la posición 100, 150 en el PDF)
      doc.image(imagePath, {
        fit: [50, 50],
        align: "center",
      });
    } else {
      // Puedes insertar un texto alternativo o un placeholder
      doc.text("Imagen no disponible", {
        align: "center",
      });
    }
    doc.fontSize(7).text(`DIRECCIÓN REGIONAL DE EDUCACIÓN`, 120, 80);
    doc.text(`PIURA`, 170, 90);
    doc.text(`UGEL HUANCABAMBA`, 145, 100);

    doc.fontSize(15).text(`PAPELETA DE COMISIÓN DE`, 280, 80);
    doc.fontSize(15).text(`SERVICIOS Y/O PERMISOS`, 285, 95);

    // Datos principales
    doc.fontSize(15).text(`PAPELETA N° ${ballot.numeroPapeleta}`, 220, 150);
    doc
      .fontSize(10)
      .text("FECHA: ", 70, 185, { continued: true })
      .font("Courier")
      .text(dateBallot)
      .font("Courier-Bold")
      .text("NOMBRES Y APELLIDOS: ", 70, 200, { continued: true })
      .font("Courier")
      .text(ballot.nombrePersonal)
      .font("Courier-Bold")
      .text("DEPENDENCIA/ÁREA: ", 70, 215, { continued: true })
      .font("Courier")
      .text(ballot.nombreArea)
      .font("Courier-Bold")
      .text("CONDICIÓN LABORAL: ", 350, 215, { continued: true })
      .font("Courier")
      .text(ballot.condicionLaboral)
      .font("Courier-Bold")
      .text(`SE AUSENTARÁ:`, 70, 230)
      .text("DESDE: ", 70, 245, { continued: true })
      .font("Courier")
      .text(desde)
      .font("Courier-Bold")
      .text("HASTA: ", 220, 245, { continued: true })
      .font("Courier")
      .text(hasta)
      .font("Courier-Bold")
      .text("MOTIVO: ", 70, 260, { continued: true })
      .font("Courier")
      .text(ballot.motivo)
      .font("Courier-Bold")
      .text("FUNDAMENTACIÓN: ", 70, 275, { continued: true })
      .font("Courier")
      .text(ballot.fundamento)
      .font("Courier-Bold");

    // Firmas
    const drawSignature = (label, person, posX, posY, signed = true) => {
      const lineWidth = 180; // Longitud de la línea de firma
      const lineY = posY + 25;

      // Firmado digitalmente (si corresponde)
      if (signed && person) {
        doc
          .fontSize(7)
          .text("Firmado digitalmente por:", posX, posY)
          .text(person.nombrePersonal, posX, posY + 10)
          .text(`DNI: ${person.dniPersonal}`, posX, posY + 20);
      }

      // Dibuja línea de firma (centrada respecto a posX)
      const lineStartX = posX;
      const lineEndX = posX + lineWidth;
      doc
        .moveTo(lineStartX, lineY + 5)
        .lineTo(lineEndX, lineY + 5)
        .stroke();

      doc.fontSize(10);

      // Centrar la etiqueta debajo de la línea
      const labelWidth = doc.widthOfString(label);
      const labelX = lineStartX + (lineWidth - labelWidth) / 2;
      doc.text(label, labelX, lineY + 10);
    };

    // Posiciones izquierda y derecha (coherentes)
    const leftX = 70;
    const rightX = 350;

    drawSignature("SOLICITANTE", ballot, leftX, 330);
    drawSignature(
      "JEFE DE ÁREA Y/O UNIDAD",
      ballot,
      rightX,
      330,
      ballot.VBjefe === 1
    );
    drawSignature("ESPECIALISTA RR.HH.", rrhh, leftX, 430, ballot.VBrrhh === 1);
    drawSignature(
      "V°B° ADMINISTRACIÓN",
      adm,
      rightX,
      430,
      ballot.VBadministracion === 1
    );

    // Finalizar el documento
    doc.end();
  } catch (error) {
    res
      .cookie("error", ["¡Ocurrió un problema!"], {
        httpOnly: true,
        maxAge: 6000,
      })
      .redirect("/ballots/page1");
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
