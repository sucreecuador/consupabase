// Inyección forzada del botón "Generar Excel" al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Buscar el botón verde "+ Nuevo" o "Buscar" para posicionar el botón de Excel
    const btnNuevo = document.querySelector("button.btn-success, .btn-primary");
    
    if (btnNuevo && !document.getElementById("btnExcelInyectado")) {
        const btnExcel = document.createElement("button");
        btnExcel.id = "btnExcelInyectado";
        btnExcel.className = "btn btn-outline-success ms-2";
        btnExcel.style.fontWeight = "bold";
        btnExcel.innerHTML = '<i class="bi bi-file-earmark-excel me-1"></i> Generar Excel';
        
        btnExcel.onclick = () => {
            const contacto = document.getElementById("searchContacto")?.value.trim() || "";
            if (!contacto) {
                alert("Por favor ingresa un código de proveedor en el campo 'Contacto / Proveedor' (ejemplo: 319).");
                return;
            }
            window.location.href = `/api/productos/exportar-excel?contacto=${encodeURIComponent(contacto)}`;
        };

        // Insertar justo antes del botón + Nuevo
        btnNuevo.parentNode.insertBefore(btnExcel, btnNuevo);
    }
});