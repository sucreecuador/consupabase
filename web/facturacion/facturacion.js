console.log("FACTURACION CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let detalle = [];
let ivaPorc = 15;

// ------------------------------------------------------
// INICIO
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  inicializarSidebar();
  inicializarEventosFactura();
  await cargarIVAConfig();
  await inicializarFormularioFactura();
});

async function inicializarFormularioFactura() {
  limpiarFactura();
  await generarNumeroFactura();
}

// ------------------------------------------------------
// SIDEBAR
// ------------------------------------------------------
function inicializarSidebar() {
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
}

// ------------------------------------------------------
// EVENTOS PRINCIPALES
// ------------------------------------------------------
function inicializarEventosFactura() {
  document.getElementById("btnNuevaFactura")?.addEventListener("click", inicializarFormularioFactura);
  document.getElementById("btnBuscarProducto")?.addEventListener("click", buscarProductos);
  document.getElementById("btnGuardarFactura")?.addEventListener("click", guardarFactura);

  document.getElementById("btnSalirFactura")?.addEventListener("click", () => {
    window.location.href = "../productos/productos.html";
  });

  document.getElementById("facDescuentoPorc")?.addEventListener("input", recalcularTotales);

  // ENTER EN BÚSQUEDA DE PRODUCTOS
  ["buscarNombreProd", "buscarMarcaProd", "buscarCodigoProd", "buscarGeneralProd"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarProductos();
      }
    });
  });

  // CLIENTE POR CÉDULA / RUC
  const cliRucInput = document.getElementById("cliRuc");
  cliRucInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarClienteAuto(true);
    }
  });
  cliRucInput?.addEventListener("blur", () => buscarClienteAuto(false));

  // CLIENTE POR NOMBRE
  const cliNombreInput = document.getElementById("cliNombre");
  cliNombreInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarClienteAuto(true);
    }
  });
  cliNombreInput?.addEventListener("blur", () => buscarClienteAuto(false));

  // CREAR CLIENTE
  document.getElementById("btnCrearCliente")?.addEventListener("click", () => {
    const modalEl = document.getElementById("modalCrearCliente");
    if (modalEl) new bootstrap.Modal(modalEl).show();
  });

  document.getElementById("btnGuardarNuevoCliente")?.addEventListener("click", guardarNuevoCliente);
  document.getElementById("btnActualizarCliente")?.addEventListener("click", actualizarClienteManual);

  ["cliRuc", "cliNombre", "cliDireccion", "cliTelefono", "cliCorreo"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", detectarCambiosCliente);
  });
}

// ------------------------------------------------------
// CONFIGURACIÓN E INICIALIZACIÓN
// ------------------------------------------------------
async function cargarIVAConfig() {
  try {
    const { data } = await client
      .from("config")
      .select("iva_porcentaje")
      .eq("id", 1)
      .maybeSingle();

    if (data && data.iva_porcentaje != null) {
      ivaPorc = Number(data.iva_porcentaje);
    }
  } catch (err) {
    console.warn("No se pudo cargar IVA, usando por defecto:", ivaPorc);
  }
}

async function generarNumeroFactura() {
  const inputNumero = document.getElementById("facNumero");
  if (!inputNumero) return;

  try {
    const { data } = await client
      .from("facturas")
      .select("numero")
      .order("id", { ascending: false })
      .limit(1);

    let nuevo = "FAC-000001";
    if (data && data.length > 0) {
      const ultimo = data[0].numero || "FAC-000000";
      const num = parseInt(ultimo.replace(/\D/g, "") || "0", 10) + 1;
      nuevo = "FAC-" + String(num).padStart(6, "0");
    }
    inputNumero.value = nuevo;
  } catch (e) {
    inputNumero.value = "FAC-000001";
  }
}

function limpiarFactura() {
  detalle = [];
  renderizarDetalle();

  const hoy = new Date().toISOString().slice(0, 10);
  document.getElementById("facFecha").value = hoy;
  document.getElementById("facResponsable").value = "";
  document.getElementById("facFormaPago").value = "EFECTIVO";

  document.getElementById("cliRuc").value = "";
  document.getElementById("cliNombre").value = "";
  document.getElementById("cliTelefono").value = "";
  document.getElementById("cliCodigo").value = "";
  document.getElementById("cliDireccion").value = "";
  document.getElementById("cliCorreo").value = "";
  document.getElementById("facDescuentoPorc").value = 0;

  ocultarBotonActualizar();
  actualizarPieFactura(0, 0, 0, 0, 0, 0);
}

// ------------------------------------------------------
// CLIENTES
// ------------------------------------------------------
async function buscarClienteAuto(esEnter = false) {
  const cedula = document.getElementById("cliRuc").value.trim();
  const nombre = document.getElementById("cliNombre").value.trim();

  if (!cedula && !nombre) return;

  let query = client.from("clientes").select("*").limit(1);

  if (cedula.length === 10 || cedula.length === 13) {
    query = query.eq("ruc", cedula);
  } else if (esEnter && cedula.length > 0) {
    query = query.ilike("ruc", `${cedula}%`);
  } else if (esEnter && nombre.length >= 3) {
    query = query.ilike("nombre", `%${nombre}%`);
  } else {
    return;
  }

  const { data } = await query;
  if (!data || data.length === 0) {
    ocultarBotonActualizar();
    return;
  }

  const c = data[0];
  document.getElementById("cliCodigo").value = c.codigo_cliente || "";
  document.getElementById("cliRuc").value = c.ruc || "";
  document.getElementById("cliNombre").value = c.nombre || "";
  document.getElementById("cliDireccion").value = c.direccion || "";
  document.getElementById("cliTelefono").value = c.telefono1 || "";
  document.getElementById("cliCorreo").value = c.email || "";

  ocultarBotonActualizar();
}

function detectarCambiosCliente() {
  const codigo = document.getElementById("cliCodigo").value.trim();
  if (!codigo) return ocultarBotonActualizar();

  client
    .from("clientes")
    .select("*")
    .eq("codigo_cliente", codigo)
    .maybeSingle()
    .then(({ data: existe }) => {
      if (!existe) return ocultarBotonActualizar();

      const ruc = document.getElementById("cliRuc").value.trim();
      const nombre = document.getElementById("cliNombre").value.trim();
      const direccion = document.getElementById("cliDireccion").value.trim();
      const telefono = document.getElementById("cliTelefono").value.trim();
      const correo = document.getElementById("cliCorreo").value.trim();

      const huboCambios =
        existe.ruc !== ruc ||
        existe.nombre !== nombre ||
        existe.direccion !== direccion ||
        existe.telefono1 !== telefono ||
        existe.email !== correo;

      if (huboCambios) mostrarBotonActualizar();
      else ocultarBotonActualizar();
    });
}

function mostrarBotonActualizar() {
  document.getElementById("btnActualizarCliente").style.display = "inline-block";
}

function ocultarBotonActualizar() {
  document.getElementById("btnActualizarCliente").style.display = "none";
}

async function actualizarClienteManual() {
  const codigo = document.getElementById("cliCodigo").value.trim();
  const ruc = document.getElementById("cliRuc").value.trim();
  const nombre = document.getElementById("cliNombre").value.trim();
  const direccion = document.getElementById("cliDireccion").value.trim();
  const telefono = document.getElementById("cliTelefono").value.trim();
  const correo = document.getElementById("cliCorreo").value.trim();

  if (!codigo) return alert("No hay cliente cargado.");

  const { error } = await client
    .from("clientes")
    .update({ ruc, nombre, razon_social: nombre, direccion, telefono1: telefono, email: correo })
    .eq("codigo_cliente", codigo);

  if (error) return alert("Error al actualizar cliente.");
  alert("Cliente actualizado correctamente.");
  ocultarBotonActualizar();
}

async function guardarNuevoCliente() {
  const codigo = document.getElementById("newCliCodigo").value.trim();
  const ruc = document.getElementById("newCliRuc").value.trim();
  const nombre = document.getElementById("newCliNombre").value.trim();
  const direccion = document.getElementById("newCliDireccion").value.trim();
  const telefono = document.getElementById("newCliTelefono").value.trim();
  const correo = document.getElementById("newCliCorreo").value.trim();

  if (!codigo || !ruc || !nombre) return alert("Código, RUC y Nombre son obligatorios.");

  const { error } = await client.from("clientes").insert({
    codigo_cliente: codigo,
    ruc,
    nombre,
    razon_social: nombre,
    direccion,
    telefono1: telefono,
    email: correo,
  });

  if (error) return alert("Error al crear cliente.");

  document.getElementById("cliCodigo").value = codigo;
  document.getElementById("cliRuc").value = ruc;
  document.getElementById("cliNombre").value = nombre;
  document.getElementById("cliDireccion").value = direccion;
  document.getElementById("cliTelefono").value = telefono;
  document.getElementById("cliCorreo").value = correo;

  alert("Cliente creado correctamente.");
  const modalEl = document.getElementById("modalCrearCliente");
  bootstrap.Modal.getInstance(modalEl)?.hide();
}

// ------------------------------------------------------
// BÚSQUEDA Y SELECCIÓN DE PRODUCTOS
// ------------------------------------------------------
async function buscarProductos() {
  const nom = document.getElementById("buscarNombreProd").value.trim();
  const mar = document.getElementById("buscarMarcaProd").value.trim();
  const cod = document.getElementById("buscarCodigoProd").value.trim();
  const gen = document.getElementById("buscarGeneralProd").value.trim();

  if (!nom && !mar && !cod && !gen) {
    alert("Ingrese al menos un criterio de búsqueda.");
    return;
  }

  let query = client.from("productos").select("*").limit(50);

  if (nom) query = query.or(`descripcion.ilike.%${nom}%,nombre.ilike.%${nom}%`);
  if (mar) query = query.ilike("marca", `%${mar}%`);
  if (cod) query = query.ilike("codigo", `%${cod}%`);
  if (gen) {
    query = query.or(
      `codigo.ilike.%${gen}%,descripcion.ilike.%${gen}%,nombre.ilike.%${gen}%,marca.ilike.%${gen}%`
    );
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    alert("No se encontraron productos con el criterio ingresado.");
    return;
  }

  const tbody = document.getElementById("tbodyResultadosProductos");
  tbody.innerHTML = "";

  data.forEach((p) => {
    const desc = p.descripcion || p.nombre || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.codigo || ""}</strong></td>
      <td>${p.naci || p.ori || ""}</td>
      <td>${p.marca || ""}</td>
      <td>${desc}</td>
      <td>${p.unidad || p.uni || ""}</td>
      <td><span class="badge ${(p.saldo_temp ?? p.saldo ?? 0) > 0 ? "bg-success" : "bg-danger"}">${p.saldo_temp ?? p.saldo ?? 0}</span></td>
      <td><strong>$${Number(p.pvp || 0).toFixed(2)}</strong></td>
      <td class="text-center">
        <button class="btn btn-sm btn-primary" onclick='seleccionarProductoModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
          <i class="fa-solid fa-plus me-1"></i> Seleccionar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const modalEl = document.getElementById("modalBuscarProductos");
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

window.seleccionarProductoModal = (p) => {
  agregarProductoAlDetalle(p);
  const modalEl = document.getElementById("modalBuscarProductos");
  bootstrap.Modal.getInstance(modalEl)?.hide();
};

function agregarProductoAlDetalle(p) {
  const item = {
    codigo: p.codigo,
    ori: p.naci || p.ori || "",
    marca: p.marca || "",
    nombre: p.descripcion || p.nombre || "",
    uni: p.unidad || p.uni || "",
    saldo: p.saldo_temp ?? p.saldo ?? 0,
    pvp: Number(p.pvp || 0),
    cant: 1,
    subpvp: Number(p.pvp || 0),
  };

  detalle.push(item);
  renderizarDetalle();
  recalcularTotales();
}

// ------------------------------------------------------
// DETALLE DE VENTA Y TOTALES
// ------------------------------------------------------
function renderizarDetalle() {
  const tbody = document.getElementById("tbodyDetalleFactura");
  tbody.innerHTML = "";

  if (!detalle.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-3">Sin productos en el detalle.</td></tr>`;
    return;
  }

  detalle.forEach((d, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.codigo}</td>
      <td>${d.ori}</td>
      <td>${d.marca}</td>
      <td>${d.nombre}</td>
      <td>${d.uni}</td>
      <td>${d.saldo}</td>
      <td>${d.pvp.toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${d.cant}"
               class="form-control form-control-sm" style="width: 70px"
               onchange="actualizarCantidad(${idx}, this.value)">
      </td>
      <td>${d.subpvp.toFixed(2)}</td>
      <td class="text-center">
        <button class="action-btn" onclick="eliminarDetalle(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.actualizarCantidad = (idx, valor) => {
  const cant = Math.max(1, Number(valor) || 1);
  detalle[idx].cant = cant;
  detalle[idx].subpvp = cant * detalle[idx].pvp;
  renderizarDetalle();
  recalcularTotales();
};

window.eliminarDetalle = (idx) => {
  detalle.splice(idx, 1);
  renderizarDetalle();
  recalcularTotales();
};

function recalcularTotales() {
  const items = detalle.length;
  const subtotal = detalle.reduce((acc, d) => acc + d.subpvp, 0);
  const porcDcto = Number(document.getElementById("facDescuentoPorc").value || 0);
  const valDcto = subtotal * (porcDcto / 100);
  const baseIva = subtotal - valDcto;
  const iva = baseIva * (ivaPorc / 100);
  const total = baseIva + iva;

  actualizarPieFactura(items, subtotal, porcDcto, valDcto, iva, total);
}

function actualizarPieFactura(items, subtotal, porcDcto, valDcto, iva, total) {
  document.getElementById("facItems").value = items;
  document.getElementById("facSubtotal").value = subtotal.toFixed(2);
  document.getElementById("facPorcDescuento").value = porcDcto.toFixed(2);
  document.getElementById("facValDescuento").value = valDcto.toFixed(2);
  document.getElementById("facIva").value = iva.toFixed(2);
  document.getElementById("facTotal").value = total.toFixed(2);
}

// ------------------------------------------------------
// GUARDAR FACTURA
// ------------------------------------------------------
async function guardarFactura() {
  if (!detalle.length) return alert("No hay productos en el detalle.");

  const numero = document.getElementById("facNumero").value.trim();
  const fecha = document.getElementById("facFecha").value;
  const responsable = document.getElementById("facResponsable").value.trim();
  const formaPago = document.getElementById("facFormaPago").value;
  const cliCodigo = document.getElementById("cliCodigo").value.trim();

  const subtotal = Number(document.getElementById("facSubtotal").value || 0);
  const valDcto = Number(document.getElementById("facValDescuento").value || 0);
  const iva = Number(document.getElementById("facIva").value || 0);
  const total = Number(document.getElementById("facTotal").value || 0);

  const { data: facData, error: facErr } = await client
    .from("facturas")
    .insert({
      numero,
      fecha,
      responsable,
      forma_pago: formaPago,
      codigo_cliente: cliCodigo,
      subtotal,
      descuento: valDcto,
      iva,
      total,
    })
    .select()
    .single();

  if (facErr) return alert("Error al guardar la cabecera de la factura.");

  const detallesInsert = detalle.map((d) => ({
    factura_id: facData.id,
    codigo_producto: d.codigo,
    cantidad: d.cant,
    pvp: d.pvp,
    subtotal: d.subpvp,
  }));

  const { error: detErr } = await client.from("factura_detalle").insert(detallesInsert);

  if (detErr) return alert("Error al guardar el detalle de la factura.");

  alert("Factura guardada correctamente.");
  await inicializarFormularioFactura();
}