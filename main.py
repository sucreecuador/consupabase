from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI()

# Inicialización del cliente de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjupfc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjc0MDIsImV4cCI6MjA1NTk0MzQwMn0.GvX_...")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Servir archivos estáticos (HTML, CSS, JS)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Ruta principal para cargar la interfaz web
@app.get("/")
def read_root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    elif os.path.exists("index.html"):
        return FileResponse("index.html")
    else:
        if os.path.exists("static"):
            html_files = [f for f in os.listdir("static") if f.endswith(".html")]
            if html_files:
                return FileResponse(f"static/{html_files[0]}")
    return {"mensaje": "API funcionando correctamente."}

# Endpoint para la tabla de Productos
@app.get("/productos")
def get_productos(
    page: int = 0,
    page_size: int = 50,
    descripcion: str = Query(None),
    codigo: str = Query(None),
    marca: str = Query(None),
    proveedor: str = Query(None),
    order_by: str = Query(None),
    order_dir: str = Query("asc")
):
    try:
        query = supabase_client.table("productos").select("*", count="exact")

        if descripcion:
            query = query.ilike("descripcion", f"%{descripcion}%")
        if codigo:
            query = query.ilike("codigo", f"%{codigo}%")
        if marca:
            query = query.ilike("marca", f"%{marca}%")
        if proveedor:
            query = query.ilike("proveedor", f"%{proveedor}%")

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

# Endpoint para la tabla de Contactos / Clientes
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