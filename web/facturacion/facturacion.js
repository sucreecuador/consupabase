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
  await generarNumeroFactura();
  limpiarFactura();
});

// ------------------------------------------------------
// SIDEBAR
// ------------------------------------------------------
function inicializarSidebar() {
  const btnToggle = document.getElementById("btnToggleSidebar");
  const sidebar = document.getElementById("sidebar");

  btnToggle.addEventListener("click", () => {
    sidebar.classList.toggle("d-none");
    btnToggle.textContent = sidebar.classList.contains("d-none")
      ? "Mostrar menú"
      : "Ocultar menú";
  });
}

// ------------------------------------------------------
// EVENTOS PRINCIPALES
// ------------------------------------------------------
function inicializarEventosFactura() {
  document.getElementById("btnNuevaFactura").addEventListener("click", () => {
    limpiarFactura();
    generarNumeroFactura();
  });

  document
    .getElementById("btnBuscarProducto")
    .addEventListener("click", buscarProductos);

  document
    .getElementById("btnGuardarFactura")
    .addEventListener("click", guardarFactura);

  document.getElementById("btnSalirFactura").addEventListener("click", () => {
    window.location.href = "../productos/productos.html";
  });

  document
    .getElementById("facDescuentoPorc")
    .addEventListener("input", () => {
      recalcularTotales();
    });

  // BÚSQUEDA AUTOMÁTICA POR RUC
  document.getElementById("cliRuc").addEventListener("input", buscarClienteAuto);
  document.getElementById("cliRuc").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarClienteAuto();
  });

  // BÚSQUEDA AUTOMÁTICA POR NOMBRE
  document.getElementById("cliNombre").addEventListener("input", buscarClienteAuto);
  document.getElementById("cliNombre").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarClienteAuto();
  });

  // CREAR CLIENTE
  document
    .getElementById("btnCrearCliente")
    .addEventListener("click", () => {
      const modal = new bootstrap.Modal(
        document.getElementById("modalCrearCliente")
      );
      modal.show();
    });

  document
    .getElementById("btnGuardarNuevoCliente")
    .addEventListener("click", guardarNuevoCliente);

  // BOTÓN ACTUALIZAR CLIENTE
  document
    .getElementById("btnActualizarCliente")
    .addEventListener("click", actualizarClienteManual);

  // DETECTAR CAMBIOS
  ["cliRuc", "cliNombre", "cliDireccion", "cliTelefono", "cliCorreo"].forEach(id => {
    document.getElementById(id).addEventListener("input", detectarCambiosCliente);
  });
}

// ------------------------------------------------------
// CARGAR IVA DESDE SUPABASE
// ------------------------------------------------------
async function cargarIVAConfig() {
  const { data } = await client
    .from("config")
    .select("iva_porcentaje")
    .eq("id", 1)
    .maybeSingle();

  if (data && data.iva_porcentaje != null) {
    ivaPorc = Number(data.iva_porcentaje);
  }
}

// ------------------------------------------------------
// NUMERACIÓN AUTOMÁTICA EDITABLE
// ------------------------------------------------------
async function generarNumeroFactura() {
  const inputNumero = document.getElementById("facNumero");

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
}

// ------------------------------------------------------
// LIMPIAR FACTURA
// ------------------------------------------------------
function limpiarFactura() {
  detalle = [];
  renderizarDetalle();

  document.getElementById("facFecha").value =
    new Date().toISOString().slice(0, 10);
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
// BÚSQUEDA AUTOMÁTICA DE CLIENTE
// ------------------------------------------------------
async function buscarClienteAuto() {
  const cedula = document.getElementById("cliRuc").value.trim();
  const nombre = document.getElementById("cliNombre").value.trim();

  if (!cedula && !nombre) return;

  let query = client.from("clientes").select("*").limit(1);

  if (cedula.length >= 4) {
    query = query.ilike("ruc", `${cedula}%`);
  } else if (nombre.length >= 3) {
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

// ------------------------------------------------------
// DETECTAR CAMBIOS EN EL CLIENTE
// ------------------------------------------------------
function detectarCambiosCliente() {
  const codigo = document.getElementById("cliCodigo").value.trim();
  if (!codigo) return ocultarBotonActualizar();

  client
    .from("clientes")
    .select("*")
    .eq("codigo_cliente", codigo)
    .maybeSingle()
    .then(({ data: existe }) => {
      if (!existe) {
        ocultarBotonActualizar();
        return;
      }

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
  document.getElementById("btnActualizarCliente").style.display = "block";
}

function ocultarBotonActualizar() {
  document.getElementById("btnActualizarCliente").style.display = "none";
}

// ------------------------------------------------------
// ACTUALIZAR CLIENTE MANUAL
// ------------------------------------------------------
async function actualizarClienteManual() {
  const codigo = document.getElementById("cliCodigo").value.trim();
  const ruc = document.getElementById("cliRuc").value.trim();
  const nombre = document.getElementById("cliNombre").value.trim();
  const direccion = document.getElementById("cliDireccion").value.trim();
  const telefono = document.getElementById("cliTelefono").value.trim();
  const correo = document.getElementById("cliCorreo").value.trim();

  if (!codigo) {
    alert("No hay cliente cargado.");
    return;
  }

  const { error } = await client
    .from("clientes")
    .update({
      ruc,
      nombre,
      razon_social: nombre,
      direccion,
      telefono1: telefono,
      email: correo
    })
    .eq("codigo_cliente", codigo);

  if (error) {
    alert("Error al actualizar el cliente.");
    return;
  }

  alert("Cliente actualizado correctamente.");
  ocultarBotonActualizar();
}

// ------------------------------------------------------
// CREAR CLIENTE
// ------------------------------------------------------
async function guardarNuevoCliente() {
  const codigo = document.getElementById("newCliCodigo").value.trim();
  const ruc = document.getElementById("newCliRuc").value.trim();
  const nombre = document.getElementById("newCliNombre").value.trim();
  const direccion = document.getElementById("newCliDireccion").value.trim();
  const telefono = document.getElementById("newCliTelefono").value.trim();
  const correo = document.getElementById("newCliCorreo").value.trim();

  if (!codigo || !ruc || !nombre) {
    alert("Código, RUC y Nombre son obligatorios.");
    return;
  }

  const { error } = await client.from("clientes").insert({
    codigo_cliente: codigo,
    ruc,
    nombre,
    razon_social: nombre,
    direccion,
    telefono1: telefono,
    email: correo,
  });

  if (error) {
    alert("Error al crear cliente.");
    return;
  }

  document.getElementById("cliCodigo").value = codigo;
  document.getElementById("cliRuc").value = ruc;
  document.getElementById("cliNombre").value = nombre;
  document.getElementById("cliDireccion").value = direccion;
  document.getElementById("cliTelefono").value = telefono;
  document.getElementById("cliCorreo").value = correo;

  alert("Cliente creado correctamente.");

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalCrearCliente")
  );
  modal.hide();
}

// ------------------------------------------------------
// BUSCAR PRODUCTOS
// ------------------------------------------------------
async function buscarProductos() {
  const nom = document.getElementById("buscarNombreProd").value.trim();
  const mar = document.getElementById("buscarMarcaProd").value.trim();
  const cod = document.getElementById("buscarCodigoProd").value.trim();
  const gen = document.getElementById("buscarGeneralProd").value.trim();

  let query = client
    .from("productos")
    .select(`
        codigo,
        naci,
        marca,
        descripcion,
        unidad,
        saldo_temp,
        pvp
      `)
    .limit(50);

  if (nom) query = query.ilike("descripcion", `%${nom}%`);
  if (mar) query = query.ilike("marca", `%${mar}%`);
  if (cod) query = query.ilike("codigo", `%${cod}%`);
  if (gen)
    query = query.or(
      `codigo.ilike.%${gen}%,descripcion.ilike.%${gen}%,marca.ilike.%${gen}%`
    );

  const { data } = await query;

  if (!data || data.length === 0) {
    alert("No se encontraron productos.");
    return;
  }

  agregarProductoAlDetalle(data[0]);
}

// ------------------------------------------------------
// AGREGAR PRODUCTO AL DETALLE
// ------------------------------------------------------
function agregarProductoAlDetalle(p) {
  const item = {
    codigo: p.codigo,
    ori: p.naci || "",
    marca: p.marca || "",
    nombre: p.descripcion || "",
    uni: p.unidad || "",
    saldo: p.saldo_temp ?? 0,
    pvp: p.pvp ?? 0,
    cant: 1,
    subpvp: p.pvp ?? 0,
  };

  detalle.push(item);
  renderizarDetalle();
  recalcularTotales();
}

// ------------------------------------------------------
// RENDER DETALLE
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
               class="form-control form-control-sm"
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

// ------------------------------------------------------
// TOTALES
// ------------------------------------------------------
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
// GUARDAR FACTURA + DETALLE
// ------------------------------------------------------
async function guardarFactura() {
  if (!detalle.length) {
    alert("No hay productos en el detalle.");
    return;
  }

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

  if (facErr) {
    alert("Error al guardar la cabecera de la factura.");
    return;
  }

  const detallesInsert = detalle.map((d) => ({
    factura_id: facData.id,
    codigo_producto: d.codigo,
    cantidad: d.cant,
    pvp: d.pvp,
    subtotal: d.subpvp,
  }));

  const { error: detErr } = await client
    .from("factura_detalle")
    .insert(detallesInsert);

  if (detErr) {
    alert("Error al guardar el detalle de la factura.");
    return;
  }

  alert("Factura guardada correctamente.");
  limpiarFactura();
  await generarNumeroFactura();
}