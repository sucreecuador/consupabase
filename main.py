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

        # Excluir fila de encabezados importados
        query = query.neq("codigo", "CODIGO")

        # Filtro de búsqueda multi-columna (Busca en descripción, código de producto y código de proveedor)
        if descripcion and descripcion.strip():
            filtro = descripcion.strip()
            query = query.or_(
                f"descripcion.ilike.%{filtro}%,codigo.ilike.%{filtro}%,codigo_proveedor.ilike.%{filtro}%"
            )

        # Mapeo de seguridad para ordenar por las columnas reales de Supabase
        mapa_columnas = {
            "proveedor": "codigo_proveedor",
            "codigo_proveedor": "codigo_proveedor",
            "stock": "saldo_temp",
            "saldo_temp": "saldo_temp",
            "precio": "precio_venta",
            "precio_venta": "precio_venta"
        }
        columna_real = mapa_columnas.get(orden_columna, orden_columna)

        desc_bool = (orden_direccion.lower() == "desc")
        query = query.order(columna_real, desc=desc_bool)
        
        desde = (pagina - 1) * por_pagina
        hasta = desde + por_pagina - 1
        query = query.range(desde, hasta)

        res = query.execute()

        total_registros = res.count or len(res.data)
        total_paginas = (total_registros + por_pagina - 1) // por_pagina if total_registros > 0 else 1

        return {
            "data": res.data,
            "totalPaginas": total_paginas
        }

    except Exception as e:
        print("Error en consulta Supabase:", e)
        return {"data": [], "totalPaginas": 1}