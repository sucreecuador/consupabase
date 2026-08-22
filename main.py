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
    naci: Optional[str] = None
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
    naci: Optional[str] = None
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
    orden_columna: str = Query("codigo", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    try:
        query = supabase.table("productos").select("*", count="exact")

        if descripcion and descripcion.strip():
            term = descripcion.strip().replace("%", "")
            query = query.or_(f"descripcion.ilike.*{term}*,codigo.ilike.*{term}*")

        # Mapeo flexible de ordenamiento
        mapa_columnas = {
            "codigo": "codigo",
            "nacionalidad": "naci",
            "naci": "naci",
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

        columna_real = mapa_columnas.get(orden_columna, "codigo")
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
        # Intento de fallback sin ordenamiento en caso de que la columna falle
        try:
            res_fallback = supabase.table("productos").select("*", count="exact").range(0, por_pagina - 1).execute()
            return {
                "data": res_fallback.data,
                "totalPaginas": 1
            }
        except Exception as inner_e:
            return {"data": [], "totalPaginas": 1, "error": str(inner_e)}