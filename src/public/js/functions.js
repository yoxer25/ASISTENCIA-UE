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
  const tecla = e.key; // Obtener la tecla presionada
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]$/; // Expresión regular que permite letras, vocales con tildes, ñ y espacio

  // Si la tecla no coincide con la expresión regular, evitamos que se ingrese
  if (!regex.test(tecla)) {
    e.preventDefault(); // Evitar que la tecla sea registrada
  }
};
