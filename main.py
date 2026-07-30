from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI()

# Configuración del cliente de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjupfc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Servir carpeta estática (imágenes, css, js)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Ruta principal: intenta cargar index.html o el primer HTML que encuentre en static
@app.get("/")
def read_root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    elif os.path.exists("index.html"):
        return FileResponse("index.html")
    else:
        # Busca cualquier archivo .html en la carpeta static si no se llama index.html
        if os.path.exists("static"):
            html_files = [f for f in os.listdir("static") if f.endswith(".html")]
            if html_files:
                return FileResponse(f"static/{html_files[0]}")
    return {"mensaje": "API de Supabase funcionando. Visita /contactos para ver los datos."}

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
            is_desc = (order_dir.lower() == "desc")
            query = query.order(order_by, desc=is_desc)

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