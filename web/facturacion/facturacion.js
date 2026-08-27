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

  // Búsqueda flexible (insensible a mayúsculas/minúsculas)
  if (nom) {
    query = query.or(`descripcion.ilike.%${nom}%,nombre.ilike.%${nom}%`);
  }
  if (mar) query = query.ilike("marca", `%${mar}%`);
  if (cod) query = query.ilike("codigo", `%${cod}%`);
  if (gen) {
    query = query.or(
      `codigo.ilike.%${gen}%,descripcion.ilike.%${gen}%,nombre.ilike.%${gen}%,marca.ilike.%${gen}%`
    );
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    alert("No se encontraron coincidencias.");
    return;
  }

  // Renderizado en Modal
  const tbody = document.getElementById("tbodyResultadosProductos");
  tbody.innerHTML = "";

  data.forEach((p) => {
    const desc = p.descripcion || p.nombre || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.codigo || ''}</strong></td>
      <td>${p.naci || p.ori || ''}</td>
      <td>${p.marca || ''}</td>
      <td>${desc}</td>
      <td>${p.unidad || p.uni || ''}</td>
      <td><span class="badge ${ (p.saldo_temp ?? p.saldo ?? 0) > 0 ? 'bg-success' : 'bg-danger'}">${p.saldo_temp ?? p.saldo ?? 0}</span></td>
      <td><strong>$${Number(p.pvp || 0).toFixed(2)}</strong></td>
      <td class="text-center">
        <button class="btn btn-sm btn-primary" onclick='seleccionarProductoDesdeModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
          <i class="fa-solid fa-plus me-1"></i> Seleccionar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const modalBusqueda = new bootstrap.Modal(
    document.getElementById("modalBuscarProductos")
  );
  modalBusqueda.show();
}