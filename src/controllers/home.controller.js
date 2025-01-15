// exportamos todas las constantes para poder llamarlas desde la carpeta "routes" que tienen todas las rutas de la web
export const getHome = (req, res) => {
    res.render("home");
};