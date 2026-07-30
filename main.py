from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os
import math

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
            # Validar dirección de orden
            is_desc = True if order_dir and order_dir.lower() == "desc" else False
            query = query.order(order_by, desc=is_desc)

        start = page * page_size
        end = start + page_size - 1

        result = query.range(start, end).execute()

        data = result.data if result.data else []
        total_records = result.count if hasattr(result, 'count') and result.count is not None else len(data)
        total_pages = math.ceil(total_records / page_size) if page_size > 0 else 1

        return {
            "data": data,
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        print(f"ERROR EN /productos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
            is_desc = True if order_dir and order_dir.lower() == "desc" else False
            query = query.order(order_by, desc=is_desc)

        start = page * page_size
        end = start + page_size - 1

        result = query.range(start, end).execute()

        data = result.data if result.data else []
        total_records = result.count if hasattr(result, 'count') and result.count is not None else len(data)
        total_pages = math.ceil(total_records / page_size) if page_size > 0 else 1

        return {
            "data": data,
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        print(f"ERROR EN /contactos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))