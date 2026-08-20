import os
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from supabase import create_client
from typing import Optional

# ============================================================
#  CONFIGURACIÓN SUPABASE (Render → Variables de Entorno)
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("ERROR: Debes configurar SUPABASE_URL y SUPABASE_KEY en Render.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()


# ============================================================
#  MODELO DE PRODUCTO
# ============================================================

class Producto(BaseModel):
    codigo: str
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    proveedor: Optional[str] = None


# ============================================================
#  LISTAR PRODUCTOS (con filtros + paginación)
# ============================================================

@app.get("/productos")
def listar_productos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=500),
    descripcion: Optional[str] = None,
    codigo: Optional[str] = None,
    marca: Optional[str] = None,
    proveedor: Optional[str] = None,
):
    query = supabase.table("productos").select("*")

    if descripcion:
        query = query.ilike("descripcion", f"%{descripcion}%")
    if codigo:
        query = query.ilike("codigo", f"%{codigo}%")
    if marca:
        query = query.ilike("marca", f"%{marca}%")
    if proveedor:
        query = query.ilike("proveedor", f"%{proveedor}%")

    # Total de registros
    total_res = query.execute()
    total = len(total_res.data)

    # Paginación
    from_idx = page * page_size
    to_idx = from_idx + page_size - 1

    page_res = query.range(from_idx, to_idx).execute()

    return {
        "data": page_res.data,
        "count": total,
        "page": page,
        "page_size": page_size,
    }


# ============================================================
#  CREAR PRODUCTO
# ============================================================

@app.post("/productos")
def crear_producto(prod: Producto):
    res = supabase.table("productos").insert(prod.dict()).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return {"status": "ok", "data": res.data}


# ============================================================
#  MODIFICAR PRODUCTO
# ============================================================

@app.put("/productos/{codigo}")
def modificar_producto(codigo: str, prod: Producto):
    res = supabase.table("productos").update(prod.dict()).eq("codigo", codigo).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return {"status": "ok", "data": res.data}


# ============================================================
#  ELIMINAR PRODUCTO
# ============================================================

@app.delete("/productos/{codigo}")
def eliminar_producto(codigo: str):
    res = supabase.table("productos").delete().eq("codigo", codigo).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return {"status": "ok"}
