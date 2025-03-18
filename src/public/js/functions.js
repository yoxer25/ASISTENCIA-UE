// función para que el input solo deje escribir números
const solonumeros = (e) => {
  key = e.keyCode || e.which;
  teclado = String.fromCharCode(key);
  numeros = "1234567890";
  especiales = "8-37-38-46";
  teclado_especial = false;
  for (var i in especiales) {
    if (key == especiales[i]) {
      teclado_especial = true;
    }
  }
  if (numeros.indexOf(teclado) == -1 && !teclado_especial) {
    return false;
  }
};
