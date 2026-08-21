async function cargarProductos() {
    const url = "https://consupabase-api.onrender.com/productos";

    const res = await fetch(url);
    const json = await res.json();

    const tabla = document.getElementById("tabla-productos");
    tabla.innerHTML = "";

    json.data.forEach(prod => {
        tabla.innerHTML += `
            <tr>
                <td>${prod.codigo}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.marca}</td>
                <td>${prod.proveedor}</td>
            </tr>
        `;
    });
}

cargarProductos();
