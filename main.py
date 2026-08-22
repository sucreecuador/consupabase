@app.get("/api/productos")
def listar_productos(
    pagina: int = 1,
    porPagina: int = 20,
    ordenColumna: str = "codigo",
    ordenDireccion: str = "asc",
    columnaFiltro: str = "descripcion",
    valorFiltro: str = ""
):
    offset = (pagina - 1) * porPagina
    
    # Mapeo de nombres de frontend a columnas reales de la BD
    columnas_permitidas = {
        "codigo": "codigo",
        "codigo_proveedor": "codigo_proveedor",
        "descripcion": "descripcion",
        "naci": "naci",
        "marca": "marca",
        "uni": "uni",
        "pvp": "pvp",
        "saldo_temp": "saldo_temp",
        "saldo_uio": "saldo_uio",
        "saldo_gye": "saldo_gye",
        "costo_prom": "costo_prom",
        "pro1": "pro1"
    }

    col_bd = columnas_permitidas.get(columnaFiltro, "descripcion")
    
    # Iniciar query en Supabase
    query = supabase.table("productos").select("*", count="exact")

    # Aplicar filtro dinámico en toda la BD
    if valorFiltro.strip():
        # ilike busca coincidencias parciales (ej: %ACE%)
        query = query.ilike(col_bd, f"%{valorFiltro.strip()}%")

    # Aplicar orden y paginación
    es_asc = (ordenDireccion == "asc")
    col_orden = columnas_permitidas.get(ordenColumna, "codigo")
    
    query = query.order(col_orden, desc=not es_asc).range(offset, offset + porPagina - 1)
    
    respuesta = query.execute()
    total_registros = respuesta.count or 0
    total_paginas = (total_registros + porPagina - 1) // porPagina

    return {
        "data": respuesta.data,
        "total": total_registros,
        "pagina": pagina,
        "totalPaginas": total_paginas
    }