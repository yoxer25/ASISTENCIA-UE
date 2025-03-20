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

// función para que el input solo deje escribir letras
const soloLetras = (e) => {
  var letra = e.keyCode;
  if (
    (letra > 64 && letra < 91) ||
    (letra > 96 && letra < 123) ||
    letra == 32
  ) {
    return true;
  } else {
    return false;
  }
};
