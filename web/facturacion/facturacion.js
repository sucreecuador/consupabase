// facturacion.js

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let detalle = [];
let ivaPorc = 15; // default, luego se lee de Supabase

document.addEventListener("DOMContentLoaded", async () => {
    inicializarSidebar();
    inicializarEventosFactura();
    await cargarIVAConfig();
    await generarNumeroFactura();
    limpiarFactura();
});

function inicializarSidebar() {
    const btnToggle = document.getElementById("btnToggleSidebar");
    const sidebar = document.getElementById("sidebar");
    if (!btnToggle || !sidebar) return;

    btnToggle.addEventListener("click", () => {
        sidebar.classList.toggle("d-none");
        btnToggle.textContent = sidebar.classList.contains("d-none")
            ? "Mostrar menú"
            : "Ocultar menú";
    });
}

function inicializarEventosFactura() {
    document.getElementById("btnNuevaFactura").addEventListener("click", () => {
        limpiarFactura();
        generarNumeroFactura();
    });

    document.getElementById("btnBuscarProducto").addEventListener("click", buscarProductos);

    document.getElementById("btnGuardarFactura").addEventListener("click", guardarFactura);

    document.getElementById("btnSalirFactura").addEventListener("click", () => {
        window.location.href = "../productos/productos.html";
    });

    document.getElementById("facDescuentoPorc").addEventListener("input", () => {
        recalcularTotales();
    });
}

async function cargarIVAConfig() {
    const { data, error } = await client
        .from("config")
        .select("iva_porcentaje")
        .eq("id", 1)
        .maybeSingle();

    if (!error && data && data.iva_porcentaje != null) {
        ivaPorc = Number(data.iva_porcentaje);
    }
}

async function generarNumeroFactura() {
    const inputNumero = document.getElementById("facNumero");
    if (!inputNumero) return;

    const { data, error } = await client
        .from("facturas")
        .select("numero")
        .order("id", { ascending: false })
        .limit(1);

    let nuevo = "FAC-000001";
    if (!error && data && data.length > 0) {
        const ultimo = data[0].numero || "FAC-000000";
        const num = parseInt(ultimo.replace(/\D/g, "") || "0", 10) + 1;
        nuevo = "FAC-" + String(num).padStart(6, "0");
    }
    inputNumero.value = nuevo; // editable por el usuario
}

function limpiarFactura() {
    detalle = [];
    renderizarDetalle();

    document.getElementById("facFecha").value = new Date().toISOString().slice(0, 10);
    document.getElementById("facResponsable").value = "";
    document.getElementById("facFormaPago").value = "EFECTIVO";

    document.getElementById("cliRuc").value = "";
    document.getElementById("cliNombre").value = "";
    document.getElementById("cliTelefono").value = "";
    document.getElementById("cliCodigo").value = "";
    document.getElementById("cliDireccion").value = "";
    document.getElementById("cliCorreo").value = "";
    document.getElementById("facDescuentoPorc").value = 0;

    actualizarPieFactura(0, 0, 0, 0, 0, 0);
}

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
            saldo,
            saldo_bext,
            pvp
        `)
        .limit(50);

    if (nom) query = query.ilike("descripcion", `%${nom}%`);
    if (mar) query = query.ilike("marca", `%${mar}%`);
    if (cod) query = query.ilike("codigo", `%${cod}%`);
    if (gen) {
        query = query.or(
            `codigo.ilike.%${gen}%,descripcion.ilike.%${gen}%,marca.ilike.%${gen}%`
        );
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error buscando productos:", error);
        return;
    }

    if (!data || data.length === 0) {
        alert("No se encontraron productos.");
        return;
    }

    // Por ahora: agregamos el primero al detalle (luego puedes hacer modal de selección)
    agregarProductoAlDetalle(data[0]);
}

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
        subpvp: p.pvp ?? 0
    };
    detalle.push(item);
    renderizarDetalle();
    recalcularTotales();
}

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
    const cliRuc = document.getElementById("cliRuc").value.trim();
    const cliNombre = document.getElementById("cliNombre").value.trim();
    const cliDireccion = document.getElementById("cliDireccion").value.trim();
    const cliTelefono = document.getElementById("cliTelefono").value.trim();
    const cliCorreo = document.getElementById("cliCorreo").value.trim();

    const porcDcto = Number(document.getElementById("facDescuentoPorc").value || 0);
    const subtotal = Number(document.getElementById("facSubtotal").value || 0);
    const valDcto = Number(document.getElementById("facValDescuento").value || 0);
    const iva = Number(document.getElementById("facIva").value || 0);
    const total = Number(document.getElementById("facTotal").value || 0);

    const { data: facData, error: facError } = await client
        .from("facturas")
        .insert({
            numero,
            fecha,
            responsable,
            forma_pago: formaPago,
            cliente_codigo: cliCodigo,
            cliente_ruc: cliRuc,
            cliente_nombre: cliNombre,
            cliente_direccion: cliDireccion,
            cliente_telefono: cliTelefono,
            cliente_correo: cliCorreo,
            descuento_porcentaje: porcDcto,
            descuento_valor: valDcto,
            subtotal,
            iva,
            total
        })
        .select()
        .single();

    if (facError) {
        console.error("Error guardando factura:", facError);
        alert("Error al guardar la factura.");
        return;
    }

    const facturaId = facData.id;

    const detallePayload = detalle.map(d => ({
        factura_id: facturaId,
        codigo: d.codigo,
        ori: d.ori,
        marca: d.marca,
        nombre: d.nombre,
        unidad: d.uni,
        saldo: d.saldo,
        pvp: d.pvp,
        cantidad: d.cant,
        subtotal: d.subpvp
    }));

    const { error: detError } = await client
        .from("facturas_detalle")
        .insert(detallePayload);

    if (detError) {
        console.error("Error guardando detalle:", detError);
        alert("Factura guardada, pero hubo error en el detalle.");
        return;
    }

    alert("Factura guardada correctamente.");
    limpiarFactura();
    await generarNumeroFactura();
}
