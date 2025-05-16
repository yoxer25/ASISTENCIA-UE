// importamos las herramientas necesarias para desarrollar toda la web
import morgan from "morgan";
// framework
import express from "express";
import "dotenv/config";
// para las vistas
import { engine } from "express-handlebars";
// facilitar la posibilidad de modificar las cookies
import cookieParser from "cookie-parser";
// para mostrar mensajes
import flash from "connect-flash";
// para peoder usar todos los métodos HTTP (GET, POST, PUT, PATCH, DELETE)
import methodOverride from "method-override";
// para establecer la ruta de los archivos handlebars
import path from "path";
import { fileURLToPath } from "url";
// para especificar en la configuración de las vistas donde se encuentran los helpers
import { helpers } from "./helpers/helper.js";

// desde la carpeta "routes" todos los archivos para poder establecer las rutas de la web
import myaccountRoutes from "./routes/myaccount.route.js";
import homeRoutes from "./routes/home.route.js";
import institutionRoutes from "./routes/institution.route.js";
import userRoutes from "./routes/user.route.js";
import personalRoutes from "./routes/personal.route.js";
import attendanceRecordRoutes from "./routes/attendanceRecord.route.js";
import reportRoutes from "./routes/report.route.js";
import documentsRoutes from "./routes/documents.route.js";
import areaRoutes from "./routes/area.route.js";
import specialistRoutes from "./routes/specialist.route.js";

//constantes
// para iniciar el servidor
const app = express();
app.use(morgan("dev"));

// para establecer la ruta hasta la carpeta "src"
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// estructura para los archivos handlebars donde le especificamos que la extención utilizada para los archivos será ".hbs" y el archivo principal será "main.hbs"
app.engine(
  "hbs",
  engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: helpers,
  })
);
app.set("view engine", ".hbs");
app.set("views", path.resolve(_dirname + "/views"));

// especificamos la ruta pública
app.use(express.static(path.resolve(_dirname + "/public")));
// para especificar que solo se trabajarán con datos soncillos como datos string
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// modificar cookies
app.use(cookieParser(process.env.SECRET_JWT_KEY));
// para peoder usar todos los métodos HTTP (GET, POST, PUT, PATCH, DELETE)
app.use(methodOverride("_method"));
app.use(flash()); // Conectar connect-flash después de session

// Middleware para manejar los mensajes flash
app.use((req, res, next) => {
  // Recuperar los mensajes flash desde las cookies
  res.locals.success_messages = req.cookies.success || [];
  res.locals.error_messages = req.cookies.error || [];

  // Limpiar los mensajes flash después de ser mostrados
  res.clearCookie("success");
  res.clearCookie("error");

  next();
});
// rutas de la web
app.use(homeRoutes);
app.use("/myaccount", myaccountRoutes);
app.use("/institutions", institutionRoutes);
app.use("/users", userRoutes);
app.use("/personals", personalRoutes);
app.use("/attendanceRecords", attendanceRecordRoutes);
app.use("/reports", reportRoutes);
app.use("/documents", documentsRoutes);
app.use("/areas", areaRoutes);
app.use("/specialists", specialistRoutes);

// ruta 404
app.use((req, res) => {
  res.render("errors/404");
});

// exportamos la constante "app" para poder utilizarla en otras parte del proyecto
export default app;
