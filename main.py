import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

app = FastAPI()

# Configuración CORS para permitir peticiones desde la web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def home():
    return {"message": "API de Consulta Sucre funcionando correctamente"}

# ----------------------------------------------------
# RUTA 1: PRODUCTOS
# ----------------------------------------------------
@app.get("/productos")
def get_productos(
    page: int = 0,
    page_size: int = 50,
    descripcion: str = "",
    codigo: str = "",
    marca: str = "",
    proveedor: str = ""
):
    try:
        start = page * page_size
        end = start + page_size - 1

        query = supabase.table('productos').select('*', count='exact')

        if descripcion.strip():
            query = query.ilike('descripcion', f'%{descripcion.strip()}%')
        if codigo.strip():
            query = query.ilike('codigo', f'%{codigo.strip()}%')
        if marca.strip():
            query = query.ilike('marca', f'%{marca.strip()}%')
        if proveedor.strip():
            query = query.ilike('codigo_proveedor', f'%{proveedor.strip()}%')

        response = query.range(start, end).execute()

        total_records = response.count or 0
        total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

        return {
            "data": response.data,
            "page": page,
            "total_pages": total_pages,
            "total": total_records
        }
    except Exception as e:
        print(f"Error en /productos: {e}")
        return {"error": str(e)}, 500

# ----------------------------------------------------
# RUTA 2: CONTACTOS (Tabla 'clientes')
# ----------------------------------------------------
@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: str = "",
    ruc: str = "",
    codigo: str = ""
):
    try:
        start = page * page_size
        end = start + page_size - 1

        query = supabase.table('clientes').select('*', count='exact')

        if nombre.strip():
            query = query.ilike('nombre', f'%{nombre.strip()}%')
        if codigo.strip():
            query = query.ilike('codigo_cliente', f'%{codigo.strip()}%')

        response = query.range(start, end).execute()

        total_records = response.count or 0
        total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

        return {
            "data": response.data,
            "page": page,
            "total_pages": total_pages,
            "total": total_records
        }
    except Exception as e:
        print(f"Error en /contactos: {e}")
        return {"error": str(e)}, 500