console.log("CONTACTOS JS CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let tipoVistaActual = "VENTAS";
let paginaActual = 1;
const registrosPorPagina = 10;
let totalRegistros = 0;

let columnaOrden = "codigo_cliente";
let ordenAscendente = true;
let modalEditar = null;

document.addEventListener("DOMContentLoaded", () => {
    modalEditar = new bootstrap.Modal(document.getElementById("modalEditarContacto"));
    inicializarEventos();
    cargarContactos();
});

function inicializarEventos() {

    document.getElementById("btnGuardarCambiosContacto")
        .addEventListener("click", guardarEdicionContacto);

    document.getElementById("btnVistaVentas").addEventListener("click", () => {
        tipoVistaActual = "VENTAS";
        paginaActual = 1;
        cargarContactos();
    });

    document.getElementById("btnVistaCompras").addEventListener("click", () => {
        tipoVistaActual = "COMPRAS";
        paginaActual = 1;
        cargarContactos();
    });

    document.getElementById("btnAnterior").addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            cargarContactos();
        }
    });

    document.getElementById("btnSiguiente").addEventListener("click", () => {
        const maxPag = Math.ceil(totalRegistros / registrosPorPagina);
        if (paginaActual < maxPag) {
            paginaActual++;
            cargarContactos();
        }
    });
}

function cambiarOrden(col) {
    if (columnaOrden === col) ordenAscendente = !ordenAscendente;
    else {
        columnaOrden = col;
        ordenAscendente = true;
    }
    cargarContactos();
}

function renderizarEncabezado() {
    const thead = document.getElementById("theadContactos");

    if (tipoVistaActual === "VENTAS") {
        thead.innerHTML = `
        <tr>
            <th onclick="cambiarOrden('codigo_cliente')">CÓDIGO</th>
            <th onclick="cambiarOrden('ruc')">RUC</th>
            <th onclick="cambiarOrden('categoria')">CAT</th>
            <th onclick="cambiarOrden('razon_social')">NOMBRE</th>
            <th onclick="cambiarOrden('direccion')">DIRECCIÓN</th>
            <th onclick="cambiarOrden('telefono1')">TELÉFONO</th>
            <th onclick="cambiarOrden('email')">EMAIL</th>
            <th onclick="cambiarOrden('ciudad')">CIUDAD</th>
            <th onclick="cambiarOrden('transporte')">TRANSPORTE</th>
            <th>FEC. NAC</th>
            <th>COMENTARIO</th>
            <th>NECESIDAD</th>
            <th class="text-center">ACCIONES</th>
        </tr>`;
    } else {
        thead.innerHTML = `
        <tr>
            <th onclick="cambiarOrden('codigo_cliente')">CÓDIGO</th>
            <th onclick="cambiarOrden('ruc')">RUC</th>
            <th onclick="cambiarOrden('categoria')">CAT</th>
            <th onclick="cambiarOrden('razon_social')">NOMBRE</th>
            <th onclick="cambiarOrden('direccion')">DIRECCIÓN</th>
            <th onclick="cambiarOrden('telefono1')">TELÉFONO</th>
            <th onclick="cambiarOrden('transporte')">TRANSPORTE</th>
            <th>BANCO</th>
            <th>DATOS BANCARIOS</th>
            <th>COMENTARIO</th>
            <th>NECESIDAD</th>
            <th class="text-center">ACCIONES</th>
        </tr>`;
    }
}

async function cargarContactos() {

    renderizarEncabezado();

    const tbody = document.getElementById("tbodyContactos");
    tbody.innerHTML = `<tr><td colspan="13" class="text-center py-4">
        <i class="fa-solid fa-spinner fa-spin"></i> Cargando...
    </td></tr>`;

    const desde = (paginaActual - 1) * registrosPorPagina;
    const hasta = desde + registrosPorPagina - 1;

    let query = client.from("clientes").select("*", { count: "exact" });

    query = query.order(columnaOrden, { ascending: ordenAscendente })
                 .range(desde, hasta);

    const { data, count, error } = await query;

    if (error) {
        tbody.innerHTML = `<tr><td colspan="13" class="text-danger text-center">
            Error: ${error.message}
        </td></tr>`;
        return;
    }

    totalRegistros = count;
    renderizarTabla(data);
    actualizarPaginacion(desde, hasta);
}

function renderizarTabla(lista) {
    const tbody = document.getElementById("tbodyContactos");
    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" class="text-center py-4">
            No se encontraron contactos.
        </td></tr>`;
        return;
    }

    lista.forEach(item => {

        const comentVal = item.coment_c || item.coment || item.comentario || "-";
        const fecnacVal = item.fecnac_c || item.fecnac || item.fecha_nacimiento || "-";
        const necesiVal = item.necesi_c || item.necesi || item.necesidad || "-";

        const tr = document.createElement("tr");

        if (tipoVistaActual === "VENTAS") {
            tr.innerHTML = `
                <td>${item.codigo_cliente}</td>
                <td>${item.ruc}</td>
                <td>${item.categoria}</td>
                <td>${item.razon_social || item.nombre}</td>
                <td>${item.direccion}</td>
                <td>${item.telefono1}</td>
                <td>${item.email}</td>
                <td>${item.ciudad}</td>
                <td>${item.transporte}</td>
                <td>${fecnacVal}</td>
                <td>${comentVal}</td>
                <td>${necesiVal}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="editarContacto('${item.id}')">✏️</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarContacto('${item.id}')">🗑️</button>
                </td>`;
        } else {
            tr.innerHTML = `
                <td>${item.codigo_cliente}</td>
                <td>${item.ruc}</td>
                <td>${item.categoria}</td>
                <td>${item.razon_social || item.nombre}</td>
                <td>${item.direccion}</td>
                <td>${item.telefono1}</td>
                <td>${item.transporte}</td>

                <!-- BANCO = COMENTARIO -->
                <td>${comentVal}</td>

                <!-- DATOS BANCARIOS = NECESIDAD -->
                <td>${necesiVal}</td>

                <td>${comentVal}</td>
                <td>${necesiVal}</td>

                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="editarContacto('${item.id}')">✏️</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarContacto('${item.id}')">🗑️</button>
                </td>`;
        }

        tbody.appendChild(tr);
    });
}

function actualizarPaginacion(desde, hasta) {
    const lbl = document.getElementById("lblInfoPaginacion");
    const totalPag = Math.ceil(totalRegistros / registrosPorPagina);
    const desdeReal = totalRegistros === 0 ? 0 : desde + 1;
    const hastaReal = Math.min(hasta + 1, totalRegistros);

    lbl.textContent = `Mostrando ${desdeReal}-${hastaReal} de ${totalRegistros} registros (Página ${paginaActual} de ${totalPag})`;
}

window.editarContacto = async (id) => {
    const { data, error } = await client.from("clientes").select("*").eq("id", id).single();
    if (error) return alert("Error al cargar contacto.");

    document.getElementById("editId").value = data.id;
    document.getElementById("editCodigo").value = data.codigo_cliente || "";
    document.getElementById("editRuc").value = data.ruc || "";
    document.getElementById("editCategoria").value = data.categoria || "";
    document.getElementById("editNombre").value = data.razon_social || data.nombre || "";
    document.getElementById("editDireccion").value = data.direccion || "";
    document.getElementById("editCiudad").value = data.ciudad || "";
    document.getElementById("editTelefono").value = data.telefono1 || "";
    document.getElementById("editEmail").value = data.email || "";
    document.getElementById("editTransporte").value = data.transporte || "";

    document.getElementById("editBanco").value = data.coment_c || data.coment || data.comentario || "";
    document.getElementById("editDatosBancarios").value = data.necesi_c || data.necesi || data.necesidad || "";

    document.getElementById("editComentario").value = data.coment_c || data.coment || data.comentario || "";
    document.getElementById("editFecnac").value = data.fecnac_c || data.fecnac || data.fecha_nacimiento || "";
    document.getElementById("editNecesidad").value = data.necesi_c || data.necesi || data.necesidad || "";

    modalEditar.show();
};

async function guardarEdicionContacto() {

    const id = document.getElementById("editId").value;

    const payload = {
        codigo_cliente: editCodigo.value.trim(),
        ruc: editRuc.value.trim(),
        categoria: editCategoria.value.trim(),
        razon_social: editNombre.value.trim(),
        nombre: editNombre.value.trim(),
        direccion: editDireccion.value.trim(),
        ciudad: editCiudad.value.trim(),
        telefono1: editTelefono.value.trim(),
        email: editEmail.value.trim(),
        transporte: editTransporte.value.trim(),

        // BANCO = COMENTARIO
        coment_c: editBanco.value.trim(),

        // DATOS BANCARIOS = NECESIDAD
        necesi_c: editDatosBancarios.value.trim(),

        fecnac_c: editFecnac.value.trim(),
        coment: editComentario.value.trim(),
        necesidad: editNecesidad.value.trim()
    };

    const btn = document.getElementById("