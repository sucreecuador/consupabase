@app.get("/api/productos")
async def obtener_productos(
    descripcion: str = Query(None, alias="descripcion"),
    pagina: int = Query(1, alias="pagina"),
    por_pagina: int = Query(20, alias="porPagina"),
    orden_columna: str = Query("codigo", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    try:
        query = supabase.table("productos").select("*", count="exact")

        # Filtro para omitir el encabezado del archivo original
        query = query.neq("codigo", "CODIGO")

        # Búsqueda en múltiples columnas (descripción, código de producto y código de proveedor)
        if descripcion and descripcion.strip():
            term = descripcion.strip()
            query = query.or_(f"descripcion.ilike.%{term}%,codigo.ilike.%{term}%,codigo_proveedor.ilike.%{term}%")

        # Diccionario de equivalencias para garantizar el nombre exacto de la columna en Supabase
        mapa_columnas = {
            "codigo": "codigo",
            "descripcion": "descripcion",
            "marca": "marca",
            "proveedor": "codigo_proveedor",
            "codigo_proveedor": "codigo_proveedor",
            "stock": "saldo_temp",
            "saldo_temp": "saldo_temp",
            "precio": "precio_venta",
            "precio_venta": "precio_venta"
        }

        columna_real = mapa_columnas.get(orden_columna, "codigo")
        es_descendente = (orden_direccion.lower() == "desc")

        query = query.order(columna_real, desc=es_descendente)

        desde = (pagina - 1) * por_pagina
        hasta = desde + por_pagina - 1
        query = query.range(desde, hasta)

        res = query.execute()

        total_registros = res.count if res.count is not None else len(res.data)
        total_paginas = (total_registros + por_pagina - 1) // por_pagina if total_registros > 0 else 1

        return {
            "data": res.data,
            "totalPaginas": total_paginas
        }

    except Exception as e:
        print("Error en endpoint /api/productos:", e)
        return {"data": [], "totalPaginas": 1}