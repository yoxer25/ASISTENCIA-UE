// importamos las herramientas necesarias para desarrollar toda la web
// framework
import express from "express";
// para las vistas
import { engine } from "express-handlebars";
// para establecer la ruta de los archivos handlebars
import path from "path"; //
import { fileURLToPath } from "url";
// para leer archivos .xlsx
import xlsx from "xlsx-populate"

// desde la carpeta "routes" todos los archivos para poder establecer las rutas de la web
import homeRoutes from "./routes/home.route.js";

//constantes
// para iniciar el servidor
const app = express();

// para establecer la ruta hasta la carpeta "src"
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// para especificar que solo se trabajarán con datos soncillos como datos string
app.use(express.urlencoded({ extended: false }));

// estructura para los archivos handlebars donde le especificamos que la extención utilizada para los archivos será ".hbs" y el archivo principal será "main.hbs"
app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set("view engine", ".hbs" );
app.set('views', path.resolve(_dirname + "/views"));

// especificamos la ruta pública
app.use(express.static(path.resolve(_dirname + "/public")));

// rutas de la web
app.use(homeRoutes);
//app.use('/servicios',servicesRoutes);

// exportamos la constante "app" para poder utilizarla en otras parte del proyecto
export default app;