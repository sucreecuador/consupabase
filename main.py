import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos desde la carpeta 'static'
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

def get_clean_env(var_name: str) -> str:
    value = os.environ.get(var_name, "")
    if not value:
        return ""
    # Quitar comillas, espacios y barras sobrantes
    return value.strip().strip("'").strip('"').rstrip("/")

SUPABASE_URL = get_clean_env("SUPABASE_URL")
SUPABASE_KEY = get_clean_env("SUPABASE_KEY")

# Asegurar protocolo https://
if SUPABASE_URL and not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = f"https://{SUPABASE_URL}"

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500, 
            detail=f"Faltan variables en Render. URL leída: '{SUPABASE_URL}' | KEY presente: {bool(SUPABASE_KEY)}"
        )
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error conectando a '{SUPABASE_URL}': {str(e)}"
        )


@app.get("/")
def read_root():
    return RedirectResponse(url="/static/index.html")


@app.get("/test-connection")
def test_connection():
    """Endpoint de prueba para verificar qué URL se está usando."""
    return {
        "supabase_url_detectada": SUPABASE_URL,
        "supabase_key_configurada": bool(SUPABASE_KEY),
        "key_longitud": len(SUPABASE_KEY) if SUPABASE_KEY else 0
    }


@app.get("/productos")
def get_productos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=200),
    descripcion: Optional[str] = None,
    codigo: Optional[str] = None,
    marca: Optional[str] = None,
    proveedor: Optional[str] = None
):
    supabase = get_supabase_client()

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
        raise HTTPException(status_code=500, detail=f"Error en consulta de productos (URL: {SUPABASE_URL}): {str(e)}")


@app.get("/contactos")
def get_contactos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=200),
    nombre: Optional[str] = None,
    codigo: Optional[str] = None
):
    supabase = get_supabase_client()

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
        raise HTTPException(status_code=500, detail=f"Error en consulta de clientes (URL: {SUPABASE_URL}): {str(e)}")