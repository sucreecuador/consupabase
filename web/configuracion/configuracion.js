const API = "https://consupabase-api.onrender.com/configuracion";
const panel = document.getElementById("panel");

// Abrir sección
function openSection(seccion) {
    if (seccion === "empresa") renderEmpresa();
    if (seccion === "impuestos") renderImpuestos();
    if (seccion === "usuarios") renderUsuarios();
    if (seccion === "preferencias") renderPreferencias();
}

/* ============================
   SECCIÓN: EMPRESA
============================ */
function renderEmpresa() {
    panel.innerHTML = `
        <h2>Datos de la Empresa</h2>

        <label>Nombre Comercial</label>
        <input id="empNombre">

        <label>RUC</label>
        <input id="empRuc">

        <label>Dirección</label>
        <input id="empDireccion">

        <label>Teléfono</label>
        <input id="empTelefono">

        <button onclick="guardarEmpresa()">Guardar</button>
    `;
}

async function guardarEmpresa() {
    const data = {
        nombre: document.getElementById("empNombre").value,
        ruc: document.getElementById("empRuc").value,
        direccion: document.getElementById("empDireccion").value,
        telefono: document.getElementById("empTelefono").value
    };

    await fetch(`${API}/empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Datos de empresa guardados");
}

/* ============================
   SECCIÓN: IMPUESTOS
============================ */
function renderImpuestos() {
    panel.innerHTML = `
        <h2>Impuestos del Sistema</h2>

        <label>IVA (%)</label>
        <input id="impIVA" type="number" step="0.01">

        <label>Retención (%)</label>
        <input id="impRetencion" type="number" step="0.01">

        <button onclick="guardarImpuestos()">Guardar</button>
    `;
}

async function guardarImpuestos() {
    const data = {
        iva: Number(document.getElementById("impIVA").value),
        retencion: Number(document.getElementById("impRetencion").value)
    };

    await fetch(`${API}/impuestos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Impuestos actualizados");
}

/* ============================
   SECCIÓN: USUARIOS
============================ */
function renderUsuarios() {
    panel.innerHTML = `
        <h2>Usuarios y Seguridad</h2>

        <label>Usuario</label>
        <input id="usrNombre">

        <label>Rol</label>
        <select id="usrRol">
            <option value="admin">Administrador</option>
            <option value="operador">Operador</option>
            <option value="consulta">Consulta</option>
        </select>

        <button onclick="guardarUsuario()">Guardar</button>
    `;
}

async function guardarUsuario() {
    const data = {
        usuario: document.getElementById("usrNombre").value,
        rol: document.getElementById("usrRol").value
    };

    await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Usuario registrado");
}

/* ============================
   SECCIÓN: PREFERENCIAS
============================ */
function renderPreferencias() {
    panel.innerHTML = `
        <h2>Preferencias del Sistema</h2>

        <label>Tema</label>
        <select id="prefTema">
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
        </select>

        <label>Idioma</label>
        <select id="prefIdioma">
            <option value="es">Español</option>
            <option value="en">Inglés</option>
        </select>

        <button onclick="guardarPreferencias()">Guardar</button>
    `;
}

async function guardarPreferencias() {
    const data = {
        tema: document.getElementById("prefTema").value,
        idioma: document.getElementById("prefIdioma").value
    };

    await fetch(`${API}/preferencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Preferencias guardadas");
}
