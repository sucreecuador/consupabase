from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI()

# Inicialización del cliente de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjupfc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjc0MDIsImV4cCI6MjA1NTk0MzQwMn0.GvX_...") # Si usas variable de entorno en Render, puedes dejarlo con os.getenv
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Montar archivos estáticos para que carguen el CSS, JS, etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_index():
    return FileResponse("static/index.html")

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