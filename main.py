from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/web", StaticFiles(directory="web", html=True), name="web")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjuptc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ProductoCreate(BaseModel):
    codigo: str
    nacionalidad: Optional[str] = None  # Reemplaza codigo_ori por nacionalidad / naci
    codigo_proveedor: Optional[str] = None
    descripcion: str
    marca: Optional[str] = None
    uni: Optional[str] = None
    pvp: Optional[float] = 0.0
    saldo_temp: Optional[float] = 0.0
    saldo_uio: Optional[float] = 0.0
    saldo_gye: Optional[float] = 0.0
    costo_prom: Optional[float] = 0.0
    pro1: Optional[str] = None

class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nacionalidad: Optional[str] = None
    codigo_proveedor: Optional[str] = None
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    uni: Optional[str] = None
    pvp: Optional[float] = None
    saldo_temp: Optional[float] = None
    saldo_uio: Optional[float] = None
    saldo_gye: Optional[float] = None
    costo_prom: Optional[float] = None
    pro1: Optional[str] = None

@app.get("/api/productos")
async def obtener_productos(
    descripcion: str = Query(None, alias="descripcion"),
    pagina: int = Query(1, alias="pagina"),
    por_pagina: int = Query(20, alias="porPagina"),
    orden_columna: str = Query("nacionalidad", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    try:
        query = supabase.table("productos").select("*", count="exact")

        query = query.neq("codigo", "CODIGO")

        if descripcion and descripcion.strip():
            term = descripcion.strip().replace("%", "")
            query = query.or_(f"descripcion.ilike.*{term}*,codigo.ilike.*{term}*,codigo_proveedor.ilike.*{term}*,nacionalidad.ilike.*{term}*")

        mapa_columnas = {
            "codigo": "codigo",
            "nacionalidad": "nacionalidad",  # Cambia a "naci" si el nombre exacto de la columna en Supabase es "naci"
            "codigo_proveedor": "codigo_proveedor",
            "descripcion": "descripcion",
            "marca": "marca",
            "uni": "uni",
            "pvp": "pvp",
            "saldo_temp": "saldo_temp",
            "saldo_uio": "saldo_uio",
            "saldo_gye": "saldo_gye",
            "costo_prom": "costo_prom",
            "pro1": "pro1"
        }

        columna_real = mapa_columnas.get(orden_columna, "nacionalidad")
        es_descendente = (orden_direccion.lower() == "desc")

        query = query.order(columna_real, desc=es_descendente, nullsfirst=False)

        desde = (pagina - 1) * por_pagina
        hasta = desde + por_pagina - 1
        query = query.range(desde, hasta)

        res = query.execute()

        total_registros = res.count if res.count is not None else len(res.data)
        total_paginas = (total_registros + por_pagina - 1) // por_pagina if total_registros > 0 else 1

        return {
            "data": res.data,
            "totalPaginas": total_paginas
        }

    except Exception as e:
        print("Error en endpoint /api/productos:", str(e))
        return {"data": [], "totalPaginas": 1, "error": str(e)}

@app.get("/api/productos/{producto_id}")
async def obtener_producto_por_id(producto_id: str):
    try:
        res = supabase.table("productos").select("*").eq("id", producto_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/productos")
async def crear_producto(producto: ProductoCreate):
    try:
        datos = producto.dict()
        res = supabase.table("productos").insert(datos).execute()
        return {"status": "ok", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/productos/{producto_id}")
async def actualizar_producto(producto_id: str, producto: ProductoUpdate):
    try:
        datos_actualizar = producto.dict(exclude_unset=True)
        if not datos_actualizar:
            raise HTTPException(status_code=400, detail="No se enviaron datos para actualizar")

        res = supabase.table("productos").update(datos_actualizar).eq("id", producto_id).execute()
        return {"status": "ok", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        res = supabase.table("productos").delete().eq("id", producto_id).execute()
        return {"status": "ok", "deleted": res.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}