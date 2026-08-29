console.log("CONTACTOS JS CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let tipoVistaActual = "VENTAS"; // "VENTAS" (tipo = 'C') o "COMPRAS" (tipo != 'C')
let paginaActual = 1;
const registrosPorPagina = 10;
let totalRegistros = 0;

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  cargarContactos();
});

function inicializarEventos() {
  document.querySelectorAll("#pestañasContactos .nav-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("#pestañasContactos .nav-link").forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      tipoVistaActual = e.currentTarget.getAttribute("data-tipo");
      paginaActual = 1;
      cargarContactos();
    });
  });

  document.getElementById("btnBuscar")?.addEventListener("click", () => {
    paginaActual = 1;
    cargarContactos();
  });

  document.getElementById("inputBusqueda")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      paginaActual = 1;
      cargarContactos();
    }
  });

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
    } else {
      alert(`Página inválida. Ingrese un valor entre 1 y ${maxPaginas}`);
    }
  });
}

function renderizarEncabezado() {
  const thead = document.getElementById("theadContactos");
  if (tipoVistaActual === "VENTAS") {
    thead.innerHTML = `
      <tr>
        <th>CÓDIGO <i class="fa-solid fa-sort"></i></th>
        <th>CÉDULA O RUC <i class="fa-solid fa-sort"></i></th>
        <th>CAT <i class="fa-solid fa-sort"></i></th>
        <th>NOMBRE / RAZÓN SOCIAL <i class="fa-solid fa-sort"></i></th>
        <th>DIRECCIÓN <i class="fa-solid fa-sort"></i></th>
        <th>TELÉFONO <i class="fa-solid fa-sort"></i></th>
        <th>EMAIL <i class="fa-solid fa-sort"></i></th>
        <th>CIUDAD <i class="fa-solid fa-sort"></i></th>
        <th>TRANSPORTE <i class="fa-solid fa-sort"></i></th>
        <th class="text-center">ACCIONES</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr>
        <th>CÓDIGO <i class="fa-solid fa-sort"></i></th>
        <th>CAT <i class="fa-solid fa-sort"></i></th>
        <th>NOMBRE / RAZÓN SOCIAL <i class="fa-solid fa-sort"></i></th>
        <th>TELÉFONO <i class="fa-solid fa-sort"></i></th>
        <th>CÉDULA O RUC <i class="fa-solid fa-sort"></i></th>
        <th>BANCO <i class="fa-solid fa-sort"></i></th>
        <th>TRANSPORTE <i class="fa-solid fa-sort"></i></th>
        <th class="text-center">ACCIONES</th>
      </tr>
    `;
  }
}

async function cargarContactos() {
  renderizarEncabezado();

  const tbody = document.getElementById("tbodyContactos");
  const numColumnas = tipoVistaActual === "VENTAS" ? 10 : 8;
  tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i>Buscando registros...</td></tr>`;

  const textoBusqueda = document.getElementById("inputBusqueda").value.trim();
  const campoFiltro = document.getElementById("selectFiltroCampo").value;

  const desde = (paginaActual - 1) * registrosPorPagina;
  const hasta = desde + registrosPorPagina - 1;

  try {
    let query = client.from("clientes").select("*", { count: "exact" });

    if (tipoVistaActual === "VENTAS") {
      query = query.eq("tipo", "C");
    } else {
      query = query.neq("tipo", "C");
    }

    if (textoBusqueda) {
      if (campoFiltro === "todos") {
        query = query.or(
          `codigo_cliente.ilike.%${textoBusqueda}%,ruc.ilike.%${textoBusqueda}%,nombre.ilike.%${textoBusqueda}%,razon_social.ilike.%${textoBusqueda}%,categoria.ilike.%${textoBusqueda}%,direccion.ilike.%${textoBusqueda}%`
        );
      } else if (campoFiltro === "codigo") {
        query = query.ilike("codigo_cliente", `%${textoBusqueda}%`);
      } else if (campoFiltro === "ruc") {
        query = query.ilike("ruc", `%${textoBusqueda}%`);
      } else if (campoFiltro === "nombre") {
        query = query.or(`nombre.ilike.%${textoBusqueda}%,razon_social.ilike.%${textoBusqueda}%`);
      } else if (campoFiltro === "categoria") {
        query = query.ilike("categoria", `%${textoBusqueda}%`);
      } else if (campoFiltro === "direccion") {
        query = query.ilike("direccion", `%${textoBusqueda}%`);
      }
    }

    query = query.order("id", { ascending: true }).range(desde, hasta);

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
  const numColumnas = tipoVistaActual === "VENTAS" ? 10 : 8;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${numColumnas}" class="text-center py-4 text-muted fw-bold">No se encontraron contactos.</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const tr = document.createElement("tr");
    
    // Recortar Categoría a la primera letra
    const catLetra = item.categoria ? item.categoria.toString().trim().charAt(0).toUpperCase() : "-";
    const nombreMostrado = item.razon_social || item.nombre || "-";

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
        <td class="text-center">
          <button class="btn btn-sm btn-primary py-0 px-2" onclick="editarContacto('${item.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger py-0 px-2" onclick="eliminarContacto('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
    } else {
      // VISTA COMPRAS
      tr.innerHTML = `
        <td><span class="badge-code">${item.codigo_cliente || "-"}</span></td>
        <td><span class="badge-cat">${catLetra}</span></td>
        <td class="fw-bold">${nombreMostrado}</td>
        <td>${item.telefono1 || "-"}</td>
        <td>${item.ruc || "-"}</td>
        <td>${item.requiere || "-"}</td>
        <td>${item.transporte || "-"}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-primary py-0 px-2" onclick="editarContacto('${item.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger py-0 px-2" onclick="eliminarContacto('${item.id}')">
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

  lblInfo.textContent = `Mostrando ${registroDesde}-${registroHasta} de ${totalRegistros} registros (Página ${paginaActual} de ${totalPaginas})`;
  inputPag.value = paginaActual;

  btnAnt.disabled = paginaActual <= 1;
  btnSig.disabled = paginaActual >= totalPaginas;
}

window.editarContacto = (id) => {
  alert("Editar contacto ID: " + id);
};

window.eliminarContacto = async (id) => {
  if (confirm("¿Está seguro de eliminar este contacto?")) {
    const { error } = await client.from("clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar contacto.");
    else cargarContactos();
  }
};