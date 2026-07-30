from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

# -----------------------------
# CONFIGURACIÓN SUPABASE
# -----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------------
# APP FASTAPI
# -----------------------------
app = FastAPI()

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# SERVIR FRONTEND DESDE /static
# -----------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return FileResponse("static/index.html")


# -----------------------------
# ENDPOINT: PRODUCTOS
# -----------------------------
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
    query = supabase_client.table("productos")

    # FILTROS
    if descripcion:
        query = query.ilike("descripcion", f"%{descripcion}%")
    if codigo:
        query = query.ilike("codigo", f"%{codigo}%")
    if marca:
        query = query.ilike("marca", f"%{marca}%")
    if proveedor:
        query = query.ilike("codigo_proveedor", f"%{proveedor}%")

    # ORDENAMIENTO
    if order_by:
        query = query.order(order_by, desc=(order_dir == "desc"))

    # PAGINACIÓN
    start = page * page_size
    end = start + page_size

    result = query.range(start, end).execute()

    # Conteo correcto usando columna existente
    total_result = supabase_client.table("productos").select("codigo", count="exact").execute()
    total = total_result.count
    total_pages = (total // page_size) + 1

    return {
        "data": result.data,
        "total": total,
        "total_pages": total_pages
    }


# -----------------------------
# ENDPOINT: CONTACTOS
# -----------------------------
@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: str = Query(None),
    ruc: str = Query(None),
    order_by: str = Query(None),
    order_dir: str = Query("asc")
):
    query = supabase_client.table("clientes")

    # FILTROS
    if nombre:
        query = query.ilike("nombre", f"%{nombre}%")
    if ruc:
        query = query.ilike("ruc", f"%{ruc}%")

    # ORDENAMIENTO
    if order_by:
        query = query.order(order_by, desc=(order_dir == "desc"))

    # PAGINACIÓN
    start = page * page_size
    end = start + page_size

    result = query.range(start, end).execute()

    # Conteo correcto usando columna existente
    total_result = supabase_client.table("clientes").select("codigo_cliente", count="exact").execute()
    total = total_result.count
    total_pages = (total // page_size) + 1

    return {
        "data": result.data,
        "total": total,
        "total_pages": total_pages
    }
