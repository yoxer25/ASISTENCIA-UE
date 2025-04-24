$(document).ready(function () {
  // para desplegar submenús en el menú lateral
  $(".btn-sideBar-SubMenu").on("click", function () {
    var SubMenu = $(this).next("ul");
    var iconBtn = $(this).children(".zmdi-caret-down");
    if (SubMenu.hasClass("show-sideBar-SubMenu")) {
      iconBtn.removeClass("zmdi-hc-rotate-180");
      SubMenu.removeClass("show-sideBar-SubMenu");
    } else {
      iconBtn.addClass("zmdi-hc-rotate-180");
      SubMenu.addClass("show-sideBar-SubMenu");
    }
  });

  // modal para actualizar la contraseña
  $(".btn-update-password").on("click", function () {
    var idUsuario = $(this).data("id");
    swal({
      title: "¿Estás seguro de actualizar tu contraseña?",
      text: `<form id="passwordForm" action="/myaccount/update${idUsuario}?_method=PUT" method="POST">
              <input type="hidden" name="_method" value="PUT">
              <div class="form-group">
                <label class="control-label">Nueva Contraseña</label>
                <input class="form-control" type="password" id="newPassword" name="newPassword">
              </div>
            </form>`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03A9F4",
      cancelButtonColor: "#F44336",
      confirmButtonText:
        '<i class="zmdi zmdi-badge-check"></i> ¡Sí, Actualizar!',
      cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
    }).then(function () {
      // Realiza el envío del formulario
      $("#passwordForm").submit();
    });
  });

  // modal para cerrar sesión
  $(".btn-exit-system").on("click", function () {
    swal({
      title: "¿Estás seguro?",
      text: "La sesión actual estará cerrada",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03A9F4",
      cancelButtonColor: "#F44336",
      confirmButtonText: '<i class="zmdi zmdi-run"></i> ¡Sí, Salir!',
      cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
    }).then(function () {
      window.location.href = "/myaccount/LogOut";
    });
  });

  // para ocular o mostrar el menú lateral
  $(".btn-menu-dashboard").on("click", function () {
    var body = $(".dashboard-contentPage");
    var sidebar = $(".dashboard-sideBar");
    if (sidebar.css("pointer-events") == "none") {
      body.removeClass("no-paddin-left");
      sidebar.removeClass("hide-sidebar").addClass("show-sidebar");
    } else {
      body.addClass("no-paddin-left");
      sidebar.addClass("hide-sidebar").removeClass("show-sidebar");
    }
  });
});

// modal para confirmar si se desea eliminar un usuario
$(".btn-delete-user").on("click", function () {
  // Obtener los datos del trabajador desde los atributos `data-*` del enlace
  var idUsuario = $(this).data("id");
  var idInstitucion = $(this).data("institucion");
  var idRol = $(this).data("rol");
  swal({
    title: "¿Estás seguro de eliminar sus datos?",
    text: `<form id="deleteFormUser" action="/users/${idUsuario}?_method=PATCH" method="POST">
              <input type="hidden" name="_method" value="PATCH">
              <input class="form-control" type="hidden" id="username" name="username" value="${idInstitucion}">
              <input class="form-control" type="hidden" id="rolUser" name="rolUser" value="${idRol}">
          </form>`,
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#03A9F4",
    cancelButtonColor: "#F44336",
    confirmButtonText: '<i class="zmdi zmdi-badge-check"></i> ¡Sí, Eliminar!',
    cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
  }).then(function () {
    // Realiza el envío del formulario
    $("#deleteFormUser").submit();
  });
});

// modal para confirmar si se desea eliminar una institución
$(".btn-delete-institution").on("click", function () {
  // Obtener los datos del trabajador desde los atributos `data-*` del enlace
  var idInstitucion = $(this).data("id");
  var nombreInstitucion = $(this).data("nombre");
  var direccion = $(this).data("direccion");
  var nombreDirector = $(this).data("director");
  var idNivel = $(this).data("nivel");
  var idDistrito = $(this).data("distrito");
  swal({
    title: "¿Estás seguro de eliminar sus datos?",
    text: `<form id="deleteFormInstitution" action="/institutions/ie${idInstitucion}?_method=PATCH" method="POST">
                <input type="hidden" name="_method" value="PATCH">
                <input class="form-control" type="hidden" id="modularCode" name="modularCode" value="${idInstitucion}">
                <input class="form-control" type="hidden" id="nameInstitution" name="nameInstitution" value="${nombreInstitucion}">
                <input class="form-control" type="hidden" id="address" name="address" value="${direccion}">
                <input class="form-control" type="hidden" id="nameDirector" name="nameDirector" value="${nombreDirector}">
                <input class="form-control" type="hidden" id="level" name="level" value="${idNivel}">
                <input class="form-control" type="hidden" id="district" name="district" value="${idDistrito}">
            </form>`,
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#03A9F4",
    cancelButtonColor: "#F44336",
    confirmButtonText: '<i class="zmdi zmdi-badge-check"></i> ¡Sí, Eliminar!',
    cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
  }).then(function () {
    // Realiza el envío del formulario
    $("#deleteFormInstitution").submit();
  });
});

// modal para confirmar si se desea eliminar un trabajador
$(".btn-delete-personal").on("click", function () {
  // Obtener los datos del trabajador desde los atributos `data-*` del enlace
  var idPersonal = $(this).data("id");
  var dniPersonal = $(this).data("dni");
  var nombrePersonal = $(this).data("nombre");
  var idReloj = $(this).data("idreloj");
  swal({
    title: "¿Estás seguro de eliminar sus datos?",
    text: `<form id="deleteFormPersonal" action="/personals/${idPersonal}?_method=PATCH" method="POST">
              <input type="hidden" name="_method" value="PATCH">
              <input class="form-control" type="hidden" id="documentNumber" name="documentNumber" value="${dniPersonal}">
              <input class="form-control" type="hidden" id="fullName" name="fullName" value="${nombrePersonal}">
              <input class="form-control" type="hidden" id="idReloj" name="idReloj" value="${idReloj}">
          </form>`,
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#03A9F4",
    cancelButtonColor: "#F44336",
    confirmButtonText: '<i class="zmdi zmdi-badge-check"></i> ¡Sí, Eliminar!',
    cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
  }).then(function () {
    // Realiza el envío del formulario
    $("#deleteFormPersonal").submit();
  });
});

// modal para confirmar si se desea eliminar un registro de asistencia
$(".btn-delete-attendanceRecord").on("click", function () {
  // Obtener los datos del trabajador desde los atributos `data-*` del enlace
  var idRegistroAsistencia = $(this).data("id");
  var idInstitucion = $(this).data("institucion");
  var idPersonal = $(this).data("personal");
  swal({
    title: "¿Estás seguro de eliminar sus datos?",
    text: `<form id="deleteFormAttendanceRecord" action="/attendanceRecords/${idRegistroAsistencia}?_method=PATCH" method="POST">
              <input type="hidden" name="_method" value="PATCH">
              <input class="form-control" type="hidden" id="institution" name="institution" value="${idInstitucion}">
              <input class="form-control" type="hidden" id="personal" name="personal" value="${idPersonal}">
          </form>`,
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#03A9F4",
    cancelButtonColor: "#F44336",
    confirmButtonText: '<i class="zmdi zmdi-badge-check"></i> ¡Sí, Eliminar!',
    cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, Cancelar!',
  }).then(function () {
    // Realiza el envío del formulario
    $("#deleteFormAttendanceRecord").submit();
  });
});

// para hacer Scroll en la web
(function ($) {
  $(window).on("load", function () {
    $(".dashboard-sideBar-ct").mCustomScrollbar({
      theme: "light-thin",
      scrollbarPosition: "inside",
      autoHideScrollbar: true,
      scrollButtons: { enable: true },
    });
    $(".dashboard-contentPage, .Notifications-body").mCustomScrollbar({
      theme: "dark-thin",
      scrollbarPosition: "inside",
      autoHideScrollbar: true,
      scrollButtons: { enable: true },
    });
  });
})(jQuery);

// Función para mostrar el Toast(mensajes de éxito o error)
function showToast(id) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.classList.add("show"); // Mostrar el toast
    setTimeout(() => {
      toast.classList.remove("show"); // Ocultar el toast después de 4 segundos
    }, 4000);
  }
}

// Llamamos a la función para mostrar el toast si hay mensajes
window.onload = function () {
  // Mostrar toast de éxito
  if (document.getElementById("toast-success")) {
    showToast("toast-success");
  }
  // Mostrar toast de error
  if (document.getElementById("toast-error")) {
    showToast("toast-error");
  }
};

// Iniciar Select2 en el select
$(document).ready(function () {
  $("#username").select2();
});
