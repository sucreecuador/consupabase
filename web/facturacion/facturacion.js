// Mostrar botón "Actualizar Cliente" solo si hay cambios
function detectarCambiosCliente() {
    const codigo = document.getElementById("cliCodigo").value.trim();
    if (!codigo) return ocultarBotonActualizar();

    client
        .from("clientes")
        .select("*")
        .eq("codigo_cliente", codigo)
        .maybeSingle()
        .then(({ data: existe, error }) => {
            if (error || !existe) {
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

// Detectar cambios en tiempo real
["cliRuc", "cliNombre", "cliDireccion", "cliTelefono", "cliCorreo"].forEach(id => {
    document.getElementById(id).addEventListener("input", detectarCambiosCliente);
});

// Acción del botón Actualizar Cliente
document.getElementById("btnActualizarCliente").addEventListener("click", async () => {
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
        console.error("Error actualizando cliente:", error);
        alert("Error al actualizar el cliente.");
        return;
    }

    alert("Cliente actualizado correctamente.");
    ocultarBotonActualizar();
});
