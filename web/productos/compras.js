function exportarExcel() {
    const filas = productosFiltrados.map(p => ({
        codigo: p.codigo || "",
        origen: p.naci || "",
        marca: p.marca || "",
        descripcion: p.descripcion || p.nombre || "",
        unidad: p.unidad || "",
        costo: p.precio_compra ?? p.costo ?? 0,
        saldo_temp: p.saldo_temp ?? 0,
        saldo_uio: p.saldo ?? 0,
        saldo_gye: p.saldobext ?? p.saldo_bext ?? 0,
        peso: p.peso ?? 0,
        medidas: p.medidas || ""
    }));

    let csv = "CÓDIGO,ORI,MARCA,NOMBRE,UNI,COSTO,S.TEM,S.UIO,S.GYE,PESO,MEDIDAS\n";

    filas.forEach(f => {
        const codigo = `"${String(f.codigo).replace(/"/g, '""')}"`;
        const origen = `"${String(f.origen).replace(/"/g, '""')}"`;
        const marca = `"${String(f.marca).replace(/"/g, '""')}"`;
        const descripcion = `"${String(f.descripcion).replace(/"/g, '""')}"`;
        const unidad = `"${String(f.unidad).replace(/"/g, '""')}"`;
        const costo = f.costo;
        const saldo_temp = f.saldo_temp;
        const saldo_uio = f.saldo_uio;
        const saldo_gye = f.saldo_gye;
        const peso = f.peso;

        // MEDIDAS con comillas y escape
        const medidas = `"${String(f.medidas).replace(/"/g, '""')}"`;

        csv += [
            codigo,
            origen,
            marca,
            descripcion,
            unidad,
            costo,
            saldo_temp,
            saldo_uio,
            saldo_gye,
            peso,
            medidas
        ].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compras_sucre.csv";
    a.click();
    URL.revokeObjectURL(url);
}
