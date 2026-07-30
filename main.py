$mainPyContent = @'
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
        # Construcción base de la consulta
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

        # Aplicar rango de paginación
        response = query.range(start, end).execute()

        return {"data": response.data, "count": response.count if response.count is not None else len(response.data)}

    except Exception as e:
        # Si falla con count="exact", intentamos una consulta directa limpia
        try:
            start = page * page_size
            end = start + page_size - 1
            fallback_query = supabase_client.table("productos").select("*")
            if descripcion:
                fallback_query = fallback_query.ilike("descripcion", f"%{descripcion}%")
            if codigo:
                fallback_query = fallback_query.ilike("codigo", f"%{codigo}%")
            if marca:
                fallback_query = fallback_query.ilike("marca", f"%{marca}%")
            if proveedor:
                fallback_query = fallback_query.ilike("proveedor", f"%{proveedor}%")
            
            res = fallback_query.range(start, end).execute()
            return {"data": res.data, "count": len(res.data)}
        except Exception as err:
            return {"error": str(err), "data": [], "count": 0}

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

        return {"data": response.data, "count": response.count if response.count is not None else len(response.data)}

    except Exception as e:
        try:
            start = page * page_size
            end = start + page_size - 1
            res = supabase_client.table("clientes").select("*").range(start, end).execute()
            return {"data": res.data, "count": len(res.data)}
        except Exception as err:
            return {"error": str(err), "data": [], "count": 0}
'@

Set-Content -Path "main.py" -Value $mainPyContent -Encoding UTF8

git add main.py
git commit -m "Fix: agregar fallback sin count='exact' para prevenir PGRST125"
git push