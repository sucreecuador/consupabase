const API = "https://consupabase-api.onrender.com/facturacion";

const tabla = document.getElementById("tablaFacturas");

const btnNueva = document.getElementById("btnNuevaFactura");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardarFactura");
const btnAgregarItem = document.getElementById("btnAgregarItem");

const modal = document.getElementById("modal");

const itemsBody = document.getElementById("itemsBody");

let items = [];

// Abrir modal
btnNueva.onclick = () => {
    items = [];
    itemsBody.innerHTML = "";
    actualizarTotales();
    modal.style.display = "flex";
};

// Cerrar modal
btnCerrar.onclick = () => modal.style.display = "none";

// Agregar item
btnAgregarItem.onclick = () => {
    const id = Date.now();

    items.push({
        id,
        producto: "",
        cantidad: 0,
        precio: 0
    });

    renderItems();
};

// Render items
function renderItems() {
    itemsBody.innerHTML = "";

    items.forEach(item => {
        itemsBody.innerHTML += `
            <tr>
                <td><input value="${item.producto}" onchange="updateItem(${item.id}, 'producto', this.value)"></td>
                <td><input type="number" value="${item.cantidad}" onchange="updateItem(${item.id}, 'cantidad', this.value)"></td>
                <td><input type="number" value="${item.precio}" onchange="updateItem(${item.id}, 'precio', this.value)"></td>
                <td>${(item.cantidad * item.precio).toFixed(2)}</td>
                <td><button onclick="removeItem(${item.id})">🗑️</button></td>
            </tr>
        `;
    });

    actualizarTotales();
}

// Actualizar item
function updateItem(id, campo, valor) {
    const item = items.find(i => i.id === id);
    item[campo] = campo === "producto" ? valor : Number(valor);
    renderItems();
}

// Eliminar item
function removeItem(id) {
    items = items.filter(i => i.id !== id);
    renderItems();
}

// Totales
function actualizarTotales() {
    const subtotal = items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0);
    const iva = subtotal * 0.15;
    const total = subtotal + iva;

    document.getElementById("tSubtotal").innerText = subtotal.toFixed(2);
    document.getElementById("tIVA").innerText = iva.toFixed(2);
    document.getElementById("tTotal").innerText = total.toFixed(2);
}

// Guardar factura
btnGuardar.onclick = async () => {
    const data = {
        cliente: document.getElementById("facCliente").value,
        fecha: document.getElementById("facFecha").value,
        items,
        subtotal: Number(document.getElementById("tSubtotal").innerText),
        iva: Number(document.getElementById("tIVA").innerText),
        total: Number(document.getElementById("tTotal").innerText)
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    modal.style.display = "none";
    cargarFacturas();
};

// Cargar facturas
async function cargarFacturas() {
    const res = await fetch(API);
    const json = await res.json();

    tabla.innerHTML = "";

    json.data.forEach(f => {
        tabla.innerHTML += `
            <tr>
                <td>${f.numero}</td>
                <td>${f.cliente}</td>
                <td>${f.fecha}</td>
                <td>${f.subtotal.toFixed(2)}</td>
                <td>${f.iva.toFixed(2)}</td>
                <td>${f.total.toFixed(2)}</td>
                <td>
                    <button onclick="window.open('${API}/pdf/${f.id}')">📄</button>
                    <button onclick="window.open('${API}/excel/${f.id}')">📊</button>
                </td>
            </tr>
        `;
    });
}

// Inicial
cargarFacturas();
