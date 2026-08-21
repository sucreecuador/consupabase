@app.get("/productos")
async def get_productos(
    descripcion: str = "",
    pagina: int = 1,
    por_pagina: int = 20,
    orden_columna: str = "descripcion",
    orden_direccion: str = "asc"
):
    db = await get_db()

    columnas_validas = ["codigo", "descripcion", "marca", "proveedor", "stock", "precio"]
    if orden_columna not in columnas_validas:
        orden_columna = "descripcion"

    if orden_direccion not in ["asc", "desc"]:
        orden_direccion = "asc"

    offset = (pagina - 1) * por_pagina

    query = f"""
        SELECT
            id,
            codigo,
            descripcion,
            marca,
            proveedor,
            stock,
            precio
        FROM public.productos
        WHERE descripcion ILIKE '%' || $1 || '%'
        ORDER BY {orden_columna} {orden_direccion}
        LIMIT $2 OFFSET $3
    """

    rows = await db.fetch(query, descripcion, por_pagina, offset)

    total = await db.fetchval(
        "SELECT COUNT(*) FROM public.productos WHERE descripcion ILIKE '%' || $1 || '%'",
        descripcion
    )

    await db.close()

    total_paginas = (total // por_pagina) + (1 if total % por_pagina else 0)

    return {
        "total": total,
        "totalPaginas": total_paginas,
        "data": [
            {
                "id": r["id"],
                "codigo": r["codigo"],
                "descripcion": r["descripcion"],
                "marca": r["marca"],
                "proveedor": r["proveedor"],
                "stock": r["stock"],
                "precio": r["precio"]
            }
            for r in rows
        ]
    }
