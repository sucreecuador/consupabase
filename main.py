import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

app = FastAPI()

# Configurar CORS para permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'static'
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# Variables de entorno para Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error al inicializar cliente Supabase: {e}")


@app.get("/")
def read_root():
    """Redirige automáticamente la raíz al archivo index.html"""
    return RedirectResponse(url="/static/index.html")


@app.get("/productos")
def get_productos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=200),
    descripcion: Optional[str] = None,
    codigo: Optional[str] = None,
    marca: Optional[str] = None,
    proveedor: Optional[str] = None
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado correctamente en el servidor")

    try:
        query = supabase.table("productos").select("*", count="exact")

        if descripcion:
            query = query.ilike("descripcion", f"%{descripcion}%")
        if codigo:
            query = query.ilike("codigo", f"%{codigo}%")
        if marca:
            query = query.ilike("marca", f"%{marca}%")
        if proveedor:
            query = query.ilike("codigo_proveedor", f"%{proveedor}%")

        start = page * page_size
        end = start + page_size - 1
        query = query.range(start, end)

        res = query.execute()

        total_count = res.count if res.count is not None else len(res.data)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

        return {
            "data": res.data,
            "page": page,
            "page_size": page_size,
            "total": total_count,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/contactos")
def get_contactos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=200),
    nombre: Optional[str] = None,
    codigo: Optional[str] = None
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado correctamente en el servidor")

    try:
        query = supabase.table("clientes").select("*", count="exact")

        if nombre:
            query = query.ilike("nombre", f"%{nombre}%")
        if codigo:
            query = query.ilike("codigo_cliente", f"%{codigo}%")

        start = page * page_size
        end = start + page_size - 1
        query = query.range(start, end)

        res = query.execute()

        total_count = res.count if res.count is not None else len(res.data)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

        return {
            "data": res.data,
            "page": page,
            "page_size": page_size,
            "total": total_count,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))