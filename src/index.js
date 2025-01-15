// importamos la constante "app" desde "src/app.js"
import app from "./app.js";
// definimos un puerto, si no hay un puerto en el sistema, tomará el puerto 4000
// el puerto es una variable de entorno
app.set('port', process.env.PORT || 4000);
// inicializamos el servidor
app.listen(app.get('port'), () => {
    console.log('APP EJECUTÁNDOSE EN EL PUERTO', app.get('port'));
})