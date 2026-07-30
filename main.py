from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("ERROR: Variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY no están definidas.")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    elif os.path.exists("index.html"):
        return FileResponse("index.html")
    else:
        return {"mensaje": "API funcionando correctamente."}

@app.get("/productos")
def get_productos(
    page: int = 0,
    page_size: int = 50,
    descripcion: str | None = Query(default=None),
    codigo: str | None = Query(default=None),
    marca: str | None = Query(default=None),
    proveedor: str | None = Query(default=None),
    order_by: str | None = Query(default=None),
    order_dir: str = Query(default="asc"),
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
            is_desc = order_dir.lower() == "desc"
            query = query.order(order_by, desc=is_desc)

        start = page * page_size
        end = start + page_size - 1

        # Ejecutamos range justo al final de la construcción
        response = query.range(start, end).execute()

        return {"data": response.data, "count": response.count}

    except Exception as e:
        return {"error": str(e), "data": [], "count": 0}

@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: str | None = Query(default=None),
    ruc: str | None = Query(default=None),
    order_by: str | None = Query(default=None),
    order_dir: str = Query(default="asc"),
):
    try:
        query = supabase_client.table("clientes").select("*", count="exact")

        if nombre:
            query = query.ilike("nombre", f"%{nombre}%")
        if ruc:
            query = query.ilike("ruc", f"%{ruc}%")

        if order_by:
            is_desc = order_dir.lower() == "desc"
            query = query.order(order_by, desc=is_desc)

        start = page * page_size
        end = start + page_size - 1

        response = query.range(start, end).execute()

        return {"data": response.data, "count": response.count}

    except Exception as e:
        return {"error": str(e), "data": [], "count": 0}
