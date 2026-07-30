from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return FileResponse("static/index.html")


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

    if descripcion:
        query = query.ilike("descripcion", f"%{descripcion}%")
    if codigo:
        query = query.ilike("codigo", f"%{codigo}%")
    if marca:
        query = query.ilike("marca", f"%{marca}%")
    if proveedor:
        query = query.ilike("codigo_proveedor", f"%{proveedor}%")

    if order_by:
        query = query.order(order_by, desc=(order_dir == "desc"))

    start = page * page_size

    # SDK nuevo: usar limit + offset
    result = query.limit(page_size).offset(start).execute()

    total_result = supabase_client.table("productos").select("codigo", count="exact").execute()
    total = total_result.count
    total_pages = (total // page_size) + 1

    return {
        "data": result.data,
        "total": total,
        "total_pages": total_pages
    }


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

    if nombre:
        query = query.ilike("nombre", f"%{nombre}%")
    if ruc:
        query = query.ilike("ruc", f"%{ruc}%")

    if order_by:
        query = query.order(order_by, desc=(order_dir == "desc"))

    start = page * page_size

    result = query.limit(page_size).offset(start).execute()

    total_result = supabase_client.table("clientes").select("codigo_cliente", count="exact").execute()
    total = total_result.count
    total_pages = (total // page_size) + 1

    return {
        "data": result.data,
        "total": total,
        "total_pages": total_pages
    }
