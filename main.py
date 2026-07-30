@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: str = Query(None),
    ruc: str = Query(None),
    order_by: str = Query(None),
    order_dir: str = Query("asc")
):
    try:
        query = supabase_client.table("clientes").select("*", count="exact")

        if nombre:
            query = query.ilike("nombre", f"%{nombre}%")
        if ruc:
            query = query.ilike("ruc", f"%{ruc}%")

        if order_by:
            # Mapeamos por si el nombre en la vista difiere de la columna real en la BD
            # Si en tu base de datos se llaman 'correo' o 'telefono', colócalos aquí:
            col_mapping = {
                "email": "email",       # Cambia a "correo" si en Supabase tu columna es correo
                "telefono1": "telefono1", # Cambia a "telefono" o "celular" si en Supabase difiere
                "codigo_cliente": "codigo_cliente",
                "ruc": "ruc",
                "nombre": "nombre",
                "direccion": "direccion",
                "ciudad": "ciudad"
            }
            real_col = col_mapping.get(order_by, order_by)
            is_desc = True if order_dir and order_dir.lower() == "desc" else False
            query = query.order(real_col, desc=is_desc)

        start = page * page_size
        end = start + page_size - 1
        query = query.range(start, end)

        response = query.execute()
        data = response.data
        total_count = response.count if hasattr(response, 'count') else len(data)

        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1

        return {
            "data": data,
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))