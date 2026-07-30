from fastapi import FastAPI, Query
# Asegúrate de mantener tus demás importaciones arriba (como supabase_client, etc.)

app = FastAPI()

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
            # Usamos order_by directamente o ajustamos según corresponda
            is_desc = (order_dir.lower() == "desc")
            query = query.order(order_by, desc=is_desc)

        # Paginación
        start = page * page_size
        end = start + page_size - 1
        query = query.range(start, end)

        response = query.execute()
        return {
            "data": response.data,
            "count": response.count
        }
    except Exception as e:
        return {"error": str(e)}