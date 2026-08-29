console.log("CONTACTOS JS CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let tipoVistaActual = "COMPRAS"; // "VENTAS" o "COMPRAS"
let paginaActual = 1;
const registrosPorPagina = 10;
let totalRegistros = 0;

let columnaOrden = "codigo_cliente";
let ordenAscendente = true;
let modalEditar = null;

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  cargarContactos();
});

function inicializarEventos() {
  // Modal de Edición Bootstrap
  const modalEl = document.getElementById("modalEditarContacto");
  if (modalEl) {
    modalEditar = new bootstrap.Modal(modalEl);
  }

  // Evento Guardar en Modal
  document.getElementById("btnGuardarCambiosContacto")?.addEventListener("click", guardarEdicionContacto);

  // Toggle Sidebar
  const btnToggle = document.getElementById("btnToggleSidebar");
  const sidebar = document.getElementById("sidebar");
  if (btnToggle && sidebar) {
    btnToggle.addEventListener("click", () => {
      sidebar.classList.toggle("d-none");
      btnToggle.textContent = sidebar.classList.contains("d-none")
        ? "Mostrar menú"
        : "Ocultar menú";
    });
  }

  // Cambio de Vista (Ventas / Compras)
  const btnVentas = document.getElementById("btnVistaVentas");
  const btnCompras = document.getElementById("btnVistaCompras");

  if (btnVentas && btnCompras) {
    btnVentas.addEventListener("click", () => {
      tipoVistaActual = "VENTAS";
      btnVentas.className = "btn btn-sm btn-secondary rounded-pill active px-3";
      btnCompras.className = "btn btn-sm btn-outline-secondary rounded-pill px-3";
      paginaActual = 1;
      cargarContactos();
    });

    btnCompras.addEventListener("click", () => {
      tipoVistaActual = "COMPRAS";
      btnCompras.className = "btn btn-sm btn-secondary rounded-pill active px-3";
      btnVentas.className = "btn btn-sm btn-outline-secondary rounded-pill px-3";
      paginaActual = 1;
      cargarContactos();
    });
  }

  // Inputs de búsqueda en tiempo real
  const inputs = ["buscarNombre", "buscarCedula", "buscarCodigo", "buscarGeneral"];
  inputs.forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      paginaActual = 1;
      cargarContactos();
    });
  });

  // Botón Mostrar Todos
  document.getElementById("btnMostrarTodos")?.addEventListener("click", () => {
    inputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    paginaActual = 1;
    cargarContactos();
  });

  // Botón Editar por Código
  document.getElementById("btnEditarPorCodigo")?.addEventListener("click", async () => {
    const cod = prompt("Ingrese el Código de Cliente a editar:");
    if (cod) {
      const { data, error } = await client.from("clientes").select("*").eq("codigo_cliente", cod.trim()).maybeSingle();
      if (error || !data) {
        alert("No se encontró ningún contacto con el código: " + cod);
        return;
      }
      abrirModalEdicion(data);
    }
  });

  // Paginación
  document.getElementById("btnAnterior")?.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarContactos();
    }
  });

  document.getElementById("btnSiguiente")?.addEventListener("click", () => {
    const maxPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual < maxPaginas) {
      paginaActual++;
      cargarContactos();
    }
  });

  document.getElementById("btnIrPagina")?.addEventListener("click", () => {
    const pag = parseInt(document.getElementById("inputPagina").value, 10);
    const maxPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;
    if (pag >= 1 && pag <= maxPaginas) {
      paginaActual = pag;
      cargarContactos();
    }
  });
}

function cambiarOrden(columna) {
  if (columnaOrden === columna) {
    ordenAscendente = !ordenAscendente;
  } else {
    columnaOrden = columna;
    ordenAscendente = true;
  }
  cargarContactos();
}

function obtenerIconoOrden(columna) {
  if (columnaOrden !== columna) {
    return `<i class="fa-solid fa-sort th-sort-icon"></i>`;
  }
  return ordenAscendente
    ? `<i class="fa-solid fa-sort-up th-sort-icon active"></i>`
    : `<i class="fa-solid fa-sort-down th-sort-icon active"></i>`;
}

function renderizarEncabezado() {
  const thead = document.getElementById("theadContactos");
  if (tipoVistaActual === "VENTAS") {
    thead.innerHTML = `
      <tr>
        <th onclick="cambiarOrden('codigo_cliente')">CÓDIGO ${obtenerIconoOrden('codigo_cliente')}</th>
        <th onclick="cambiarOrden('ruc')">RUC ${obtenerIconoOrden('ruc')}</th>
        <th onclick="cambiarOrden('categoria')">CAT ${obtenerIconoOrden('categoria')}</th>
        <th onclick="cambiarOrden('razon_social')">NOMBRE / RAZÓN SOCIAL ${obtenerIconoOrden('razon_social')}</th>
        <th onclick="cambiarOrden('direccion')">DIRECCIÓN ${obtenerIconoOrden('direccion')}</th>
        <th onclick="cambiarOrden('telefono1')">TELÉFONO ${obtenerIconoOrden('telefono1')}</th>
        <th onclick="cambiarOrden('email')">EMAIL ${obtenerIconoOrden('email')}</th>
        <th onclick="cambiarOrden('ciudad')">CIUDAD ${obtenerIconoOrden('ciudad')}</th>
        <th onclick="cambiarOrden('transporte')">TRANSPORTE ${obtenerIconoOrden('transporte')}</th>
        <th>COMENTARIO</th>
        <th>FEC. NAC</th>
        <th>NECESIDAD</th>
        <th class="text-center" style="cursor: default;">ACCIONES</th>
      </tr>
    `;
  } else {
    // VISTA COMPRAS: BANCO usa coment_c y DATOS BANCARIOS usa necesi_c. Sin FEC. NAC.
    thead.innerHTML = `
      <tr>
        <th onclick="cambiarOrden('codigo_cliente')">CÓDIGO ${obtenerIconoOrden('codigo_cliente')}</th>
        <th onclick="cambiarOrden('categoria')">CAT ${obtenerIconoOrden('categoria')}</th>
        <th onclick="cambiarOrden('razon_social')">NOMBRE / RAZÓN SOCIAL ${obtenerIconoOrden('razon_social')}</th>
        <th onclick="cambiarOrden('telefono1')">TELÉFONO ${obtenerIconoOrden('telefono1')}</th>
        <th onclick="cambiarOrden('ruc')">RUC ${obtenerIconoOrden('ruc')}</th>
        <th onclick="cambiarOrden('coment_c')">BANCO ${obtenerIconoOrden('coment_c')}</th>
        <th onclick="cambiarOrden('necesi_c')">DATOS BANCARIOS ${obtenerIconoOrden('necesi_c')}</th>
        <th onclick="cambiarOrden('transporte')">TRANSPORTE ${obtenerIconoOrden('transporte')}</th>
        <th class="text-center" style="cursor: default;">ACCIONES</th>
      </tr>
    `;
  }
}

async function cargarContactos() {
  renderizarEncabezado();

  const tbody = document.getElementById("tbodyContactos");
  const numColumnas = tipoVistaActual === "VENTAS" ? 13 : 9;
  tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i>Buscando registros...</td></tr>`;

  const nom = document.getElementById("buscarNombre")?.value.trim() || "";
  const ced = document.getElementById("buscarCedula")?.value.trim() || "";
  const cod = document.getElementById("buscarCodigo")?.value.trim() || "";
  const gen = document.getElementById("buscarGeneral")?.value.trim() || "";

  const desde = (paginaActual - 1) * registrosPorPagina;
  const hasta = desde + registrosPorPagina - 1;

  try {
    let query = client.from("clientes").select("*", { count: "exact" });

    if (nom) {
      query = query.or(`nombre.ilike.%${nom}%,razon_social.ilike.%${nom}%`);
    }
    if (ced) {
      query = query.ilike("ruc", `%${ced}%`);
    }
    if (cod) {
      query = query.ilike("codigo_cliente", `%${cod}%`);
    }
    if (gen) {
      query = query.or(
        `codigo_cliente.ilike.%${gen}%,ruc.ilike.%${gen}%,nombre.ilike.%${gen}%,razon_social.ilike.%${gen}%,direccion.ilike.%${gen}%,categoria.ilike.%${gen}%`
      );
    }

    query = query.order(columnaOrden, { ascending: ordenAscendente }).range(desde, hasta);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error en consulta Supabase:", error);
      tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-danger fw-bold">Error: ${error.message}</td></tr>`;
      return;
    }

    totalRegistros = count || 0;
    renderizarTabla(data);
    actualizarPaginacion(desde, hasta);

  } catch (err) {
    console.error("Error inesperado:", err);
    tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-danger fw-bold">Error de conexión al servidor.</td></tr>`;
  }
}

function renderizarTabla(lista) {
  const tbody = document.getElementById("tbodyContactos");
  tbody.innerHTML = "";
  const numColumnas = tipoVistaActual === "VENTAS" ? 13 : 9;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-muted fw-bold">No se encontraron contactos.</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const tr = document.createElement("tr");
    const catLetra = item.categoria ? item.categoria.toString().trim().charAt(0).toUpperCase() : "-";
    const nombreMostrado = item.razon_social || item.nombre || "-";

    // Soporte para variantes de nombres de columnas COBOL en Supabase
    const bancoVal = item.coment_c || item.coment || item.comentario || "-"; // BANCO
    const datosBancariosVal = item.necesi_c || item.necesi || item.necesidad || "-"; // DATOS BANCARIOS
    const fecnacVal = item.fecnac_c || item.fecnac || item.fecha_nacimiento || "-"; // FEC. NAC

    if (tipoVistaActual === "VENTAS") {
      tr.innerHTML = `
        <td><span class="badge-code">${item.codigo_cliente || "-"}</span></td>
        <td>${item.ruc || "-"}</td>
        <td><span class="badge-cat">${catLetra}</span></td>
        <td class="fw-bold">${nombreMostrado}</td>
        <td>${item.direccion || "-"}</td>
        <td>${item.telefono1 || "-"}</td>
        <td>${item.email || "-"}</td>
        <td>${item.ciudad || "-"}</td>
        <td>${item.transporte || "-"}</td>
        <td>${bancoVal}</td>
        <td>${fecnacVal}</td>
        <td>${datosBancariosVal}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="editarContacto('${item.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="eliminarContacto('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
    } else {
      // VISTA COMPRAS: Mapeado BANCO = coment_c, DATOS BANCARIOS = necesi_c. Sin FEC. NAC.
      tr.innerHTML = `
        <td><span class="badge-code">${item.codigo_cliente || "-"}</span></td>
        <td><span class="badge-cat">${catLetra}</span></td>
        <td class="fw-bold">${nombreMostrado}</td>
        <td>${item.telefono1 || "-"}</td>
        <td>${item.ruc || "-"}</td>
        <td>${bancoVal}</td>
        <td>${datosBancariosVal}</td>
        <td>${item.transporte || "-"}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="editarContacto('${item.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="eliminarContacto('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
    }

    tbody.appendChild(tr);
  });
}

function actualizarPaginacion(desde, hasta) {
  const lblInfo = document.getElementById("lblInfoPaginacion");
  const btnAnt = document.getElementById("btnAnterior");
  const btnSig = document.getElementById("btnSiguiente");
  const inputPag = document.getElementById("inputPagina");

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;
  const registroHasta = Math.min(hasta + 1, totalRegistros);
  const registroDesde = totalRegistros === 0 ? 0 : desde + 1;

  if (lblInfo) lblInfo.textContent = `Mostrando ${registroDesde}-${registroHasta} de ${totalRegistros} registros (Página ${paginaActual} de ${totalPaginas})`;
  if (inputPag) inputPag.value = paginaActual;

  if (btnAnt) btnAnt.disabled = paginaActual <= 1;
  if (btnSig) btnSig.disabled = paginaActual >= totalPaginas;
}

window.editarContacto = async (id) => {
  try {
    const { data, error } = await client.from("clientes").select("*").eq("id", id).single();
    if (error) throw error;
    abrirModalEdicion(data);
  } catch (err) {
    console.error("Error al obtener contacto:", err);
    alert("No se pudo cargar la información del contacto.");
  }
};

function abrirModalEdicion(item) {
  document.getElementById("editId").value = item.id || "";
  document.getElementById("editCodigo").value = item.codigo_cliente || "";
  document.getElementById("editCategoria").value = item.categoria || "";
  document.getElementById("editRuc").value = item.ruc || "";
  document.getElementById("editNombre").value = item.razon_social || item.nombre || "";
  document.getElementById("editDireccion").value = item.direccion || "";
  document.getElementById("editCiudad").value = item.ciudad || "";
  document.getElementById("editTelefono").value = item.telefono1 || "";
  document.getElementById("editEmail").value = item.email || "";
  document.getElementById("editTransporte").value = item.transporte || "";

  // Asignar campos COBOL al modal
  document.getElementById("editComentario").value = item.coment_c || item.coment || item.comentario || "";
  document.getElementById("editNecesidad").value = item.necesi_c || item.necesi || item.necesidad || "";
  document.getElementById("editFecnac").value = item.fecnac_c || item.fecnac || item.fecha_nacimiento || "";

  if (modalEditar) modalEditar.show();
}

async function guardarEdicionContacto() {
  const id = document.getElementById("editId").value;
  if (!id) return;

  const payload = {
    codigo_cliente: document.getElementById("editCodigo").value.trim(),
    categoria: document.getElementById("editCategoria").value.trim().toUpperCase(),
    ruc: document.getElementById("editRuc").value.trim(),
    razon_social: document.getElementById("editNombre").value.trim(),
    nombre: document.getElementById("editNombre").value.trim(),
    direccion: document.getElementById("editDireccion").value.trim(),
    ciudad: document.getElementById("editCiudad").value.trim(),
    telefono1: document.getElementById("editTelefono").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    transporte: document.getElementById("editTransporte").value.trim(),
    // Guardado en columnas COBOL
    coment_c: document.getElementById("editComentario").value.trim(),
    necesi_c: document.getElementById("editNecesidad").value.trim(),
    fecnac_c: document.getElementById("editFecnac").value.trim()
  };

  const btnGuardar = document.getElementById("btnGuardarCambiosContacto");
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Guardando...`;

  const { error } = await client.from("clientes").update(payload).eq("id", id);

  btnGuardar.disabled = false;
  btnGuardar.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Guardar Cambios`;

  if (error) {
    console.error("Error al actualizar:", error);
    alert("Error al guardar los cambios: " + error.message);
  } else {
    if (modalEditar) modalEditar.hide();
    cargarContactos();
  }
}

window.eliminarContacto = async (id) => {
  if (confirm("¿Está seguro de eliminar este contacto?")) {
    const { error } = await client.from("clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar contacto.");
    else cargarContactos();
  }
};