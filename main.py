@app.get("/api/productos")
async def obtener_productos(
    descripcion: str = Query(None, alias="descripcion"),
    pagina: int = Query(1, alias="pagina"),
    por_pagina: int = Query(20, alias="porPagina"),
    orden_columna: str = Query("descripcion", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    query = supabase.table("productos").select("*", count="exact")

    # Aplica filtro solo si el usuario escribió algo
    if descripcion and descripcion.strip():
        query = query.ilike("descripcion", f"%{descripcion.strip()}%")

    # Ordenamiento y Paginación
    desc_bool = (orden_direccion.lower() == "desc")
    query = query.order(orden_columna, desc=desc_bool)
    
    desde = (pagina - 1) * por_pagina
    hasta = desde + por_pagina - 1
    query = query.range(desde, hasta)

    res = query.execute()

    total_registros = res.count or 0
    total_paginas = (total_registros + por_pagina - 1) // por_pagina if total_registros > 0 else 1

    return {
        "data": res.data,
        "totalPaginas": total_paginas
    }