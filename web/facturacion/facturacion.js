async function actualizarClienteSiCambio() {
    const codigo = document.getElementById("cliCodigo").value.trim();
    const ruc = document.getElementById("cliRuc").value.trim();
    const nombre = document.getElementById("cliNombre").value.trim();
    const direccion = document.getElementById("cliDireccion").value.trim();
    const telefono = document.getElementById("cliTelefono").value.trim();
    const correo = document.getElementById("cliCorreo").value.trim();

    if (!codigo) return; // no hay cliente cargado

    // Verificar si existe en Supabase
    const { data: existe, error: errExiste } = await client
        .from("clientes")
        .select("*")
        .eq("codigo", codigo)
        .maybeSingle();

    if (errExiste) {
        console.error("Error verificando cliente:", errExiste);
        return;
    }

    if (!existe) {
        console.warn("Cliente no existe, no se puede actualizar.");
        return;
    }

    // Comparar si hubo cambios
    const huboCambios =
        existe.ruc !== ruc ||
        existe.nombre !== nombre ||
        existe.direccion !== direccion ||
        existe.telefono !== telefono ||
        existe.correo !== correo;

    if (!huboCambios) return; // nada que actualizar

    // Actualizar cliente
    const { error: errUpdate } = await client
        .from("clientes")
        .update({
            ruc,
            nombre,
            direccion,
            telefono,
            correo
        })
        .eq("codigo", codigo);

    if (errUpdate) {
        console.error("Error actualizando cliente:", errUpdate);
        alert("Error al actualizar el cliente.");
        return;
    }

    alert("Cliente actualizado correctamente.");
}
