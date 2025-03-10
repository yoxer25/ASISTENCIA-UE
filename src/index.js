// importamos la constante "app" desde "src/app.js"
import app from "./app.js";
// definimos un puerto, si no hay un puerto en el sistema, tomará el puerto 4000
// el puerto es una variable de entorno
const PORT = process.env.PORT || 3000;
app.set("port", PORT);
// inicializamos el servidor
app.listen(app.get("port"), () => {
  console.log(`http://localhost:${PORT}`);
});
