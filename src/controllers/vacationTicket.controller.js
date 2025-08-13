// para generar PDF
import PDFDocument from "pdfkit";

// para calcular los días
import dayjs from "dayjs";

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
import { VacationTicket } from "../models/vacationTicket.model.js";
/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de vistar la página de papeletas
export const getTicket = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  const user = req.user;
  const dni = user.dniUser;
  const ie = user.name;

  try {
    let ticketsDB = [];
    let area = 0;
    const personalUE = await Personal.getPersonal(ie);
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    const areas = await Area.getAreas();
    if (Number(dni) === 200006) {
      ticketsDB = await VacationTicket.getTickets();
    } else {
      const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
      if (jefeArea) {
        area = jefeArea.idArea;
        if (jefeArea.idArea === 6) {
          ticketsDB = await VacationTicket.getTickets();
        } else {
          ticketsDB = await VacationTicket.getTickets(null, jefeArea.idArea);
        }
      } else {
        ticketsDB = await VacationTicket.getTickets(personal.idPersonal);
      }
    }
    const tickets = ticketsDB.slice(page * forPage - forPage, page * forPage);
    res.render("vacationTicket/ticket", {
      user,
      tickets,
      personalUE,
      areas,
      area,
      current: page,
      pages: Math.ceil(ticketsDB.length / forPage),
    });
  } catch (error) {
    res.render("vacationTicket/ticket", { user });
  }
};

// controla lo que se debe visualizar en el formulario de nueva papeleta
export const getTicketCreate = async (req, res) => {
  const user = req.user;
  const dni = user.dniUser;
  try {
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    res.render("vacationTicket/create", {
      user,
      personal,
    });
  } catch (error) {
    res.render("vacationTicket/create", { user });
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
export const createTicket = async (req, res) => {
  const {
    applicant,
    dependency,
    charge,
    workCenter,
    reference,
    period,
    observation,
    startDate,
    endDate,
  } = req.body;
  try {
    validationInput(
      applicant,
      dependency,
      charge,
      workCenter,
      reference,
      period,
      observation,
      startDate,
      endDate,
      res
    );
    const correlative = await generateCorrelativo();
    const resDB = await VacationTicket.create(
      correlative,
      applicant,
      dependency,
      charge,
      workCenter,
      reference,
      period,
      observation,
      startDate,
      endDate
    );
    if (resDB.affectedRows > 0) {
      await updateCorrelativo();
      // Si el registro es exitoso
      res.cookie("success", ["¡Registro exitoso!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      res.redirect("/vacationTickets/page1");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al agregar registro!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/vacationTickets/page1");
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
    res.redirect("/vacationTickets/page1");
  } catch (error) {
    // Si el registro falla
    res.cookie("error", ["¡Error al aprobar papeleta!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/vacationTickets/page1");
  }
};

// para ver la información completa de la papeleta de vacaciones, imprimirla o descargarla
export const viewTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const [ticket] = await VacationTicket.getTicketById(id);
    const [jefe] = await Area.getAreaById(ticket.idAreaPersonal);
    const dateTicket = helpers.formatDate(ticket.fechaPV);
    const dateStart = helpers.formatDate(ticket.desde);
    const dateEnd = helpers.formatDate(ticket.hasta);
    // Crear un documento PDF
    const doc = new PDFDocument({ size: "A4" });

    // Configurar las cabeceras para que el navegador lo muestre como PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Papeleta_${ticket.numeroPV}.pdf"`
    );
    // Pasa el stream del documento PDF directamente a la respuesta
    doc.pipe(res);
    // Función para dibujar encabezado
    function drawHeader(doc) {
      doc
        .fontSize(12)
        .text("GERENCIA REGIONAL DE DESARROLLO SOCIAL", 160, 40)
        .text("DIRECCIÓN GENERAL DE EDUCACIÓN", 190, 55)
        .text("UNIDAD DE GESTIÓN EDUCATIVA LOCAL HUANCABAMBA", 138, 70)
        .moveTo(50, 85)
        .lineTo(550, 85)
        .stroke();
    }

    // Dibujar encabezado en la primera página
    drawHeader(doc);

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

    const imageGore = path.resolve(
      _dirname,
      "../public/assets/img/logo-gore.jpg"
    );

    // Verificar si la imagen existe
    if (fs.existsSync(imagePath)) {
      // Agregar la imagen al PDF (esto va a la posición 100, 150 en el PDF)
      doc.image(imagePath, 490, 40, { width: 60 });
    } else {
      // Puedes insertar un texto alternativo o un placeholder
      doc.text("Imagen no disponible", {
        align: "center",
      });
    }

    if (fs.existsSync(imageGore)) {
      // Agregar la imagen al PDF (esto va a la posición 100, 150 en el PDF)
      doc.image(imageGore, 50, 35, { width: 60 });
    } else {
      // Puedes insertar un texto alternativo o un placeholder
      doc.text("Imagen no disponible", {
        align: "center",
      });
    }

    // Datos principales
    doc
      .fontSize(14)
      .text(`PAPELETA DE SALIDA DE VACACIONES N° ${ticket.numeroPV}`, 120, 120);
    doc.fontSize(10);

    const tableX = 70; // margen izquierdo de la tabla
    const tableY = 160; // posición inicial vertical
    const col1Width = 140; // ancho de columna 1 (etiquetas)
    const col2Width = 300; // ancho de columna 2 (valores)
    const rowHeight = 20; // altura de cada fila

    const days = calcularDiasEntreFechas(dateStart, dateEnd);

    const rows = [
      ["NOMBRES Y APELLIDOS", ticket.nombrePersonal],
      ["CARGO", ticket.cargo],
      ["CENTRO DE TRABAJO", ticket.institucion],
      ["REFERENCIA", ticket.referencia],
      ["PERIODO", ticket.periodo],
      ["FECHA DE INICIO", dateStart],
      ["FECHA DE TERMINO", dateEnd],
      ["DÍAS", days],
      ["OBSERVACIÓN", ticket.observacion],
      ["FECHA DE EXPEDICIÓN", dateTicket],
    ];

    // Dibujar filas
    rows.forEach((row, i) => {
      const y = tableY + i * rowHeight;

      // Dibujar celda izquierda
      doc.rect(tableX, y, col1Width, rowHeight).stroke();
      doc.font("Courier-Bold").text(row[0], tableX + 5, y + 5, {
        width: col1Width - 10,
        height: rowHeight - 10,
      });

      // Dibujar celda derecha
      doc.rect(tableX + col1Width, y, col2Width, rowHeight).stroke();
      doc.font("Courier").text(row[1], tableX + col1Width + 5, y + 5, {
        width: col2Width - 10,
        height: rowHeight - 10,
      });
    });

    // Firmas
    const drawSignature = (label, person, posX, posY, signed = true) => {
      const lineWidth = 180; // Longitud de la línea de firma
      const lineY = posY + 25;

      // Firmado digitalmente (si corresponde)
      if (signed && person) {
        doc
          .fontSize(7)
          .font("Courier-Bold")
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

    drawSignature("SOLICITANTE", ticket, leftX, 420);
    drawSignature(
      "JEFE DE ÁREA Y/O UNIDAD",
      jefe,
      rightX,
      420,
      ticket.VBjefe === 1
    );

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.log(error.message);
    res
      .cookie("error", ["¡Ocurrió un problema!"], {
        httpOnly: true,
        maxAge: 6000,
      })
      .redirect("/vacationTickets/page1");
  }
};

// Función para obtener y generar el número de las papeletas
const generateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelativeVacation();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo

  // Formateamos el correlativo con ceros a la izquierda
  const formattedCorrelativo = `${String(nuevoCorrelativo).padStart(6, "0")}`;

  return formattedCorrelativo; // Devolvemos el correlativo formateado
};

// Función para obtener y actualizar el correlativo en la tabla "correlativo"
const updateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelativeVacation();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo
  // Actualizamos el correlativo en la base de datos
  await Correlative.updateCorrelativeVacation(nuevoCorrelativo);
};

// calcular días para las papeletas
const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
  const inicio = dayjs(fechaInicio);
  const fin = dayjs(fechaFin);
  return fin.diff(inicio, "day") + 1;
};

// función para validar que el usuario llene completamente el formulario de crear papeleta de vacaciones
const validationInput = (
  applicant,
  dependency,
  charge,
  workCenter,
  reference,
  period,
  observation,
  startDate,
  endDate,
  res
) => {
  if (
    applicant === "" ||
    dependency === "" ||
    charge === "" ||
    workCenter === "" ||
    reference === "" ||
    period === "" ||
    observation === "" ||
    startDate === "" ||
    endDate === ""
  ) {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
