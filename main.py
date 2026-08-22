from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import os

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos desde el directorio 'web'
app.mount("/web", StaticFiles(directory="web", html=True), name="web")

# Conexión a Supabase usando variables de entorno
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjuptc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Modelo Pydantic para actualización de productos
class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    codigo_proveedor: Optional[str] = None
    saldo_temp: Optional[float] = None
    precio_venta: Optional[float] = None


@app.get("/")
def read_root():
    return {"status": "ok", "message": "API Sucre Ecuador corriendo correctamente"}


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

        # Excluir la fila del encabezado importado de Excel
        query = query.neq("codigo", "CODIGO")

        # Filtro de búsqueda multi-campo
        if descripcion and descripcion.strip():
            term = descripcion.strip().replace("%", "")
            query = query.or_(f"descripcion.ilike.*{term}*,codigo.ilike.*{term}*,codigo_proveedor.ilike.*{term}*")

        # Mapeo a los nombres reales de las columnas en Supabase
        mapa_columnas = {
            "codigo": "codigo",
            "descripcion": "descripcion",
            "marca": "marca",
            "proveedor": "codigo_proveedor",
            "codigo_proveedor": "codigo_proveedor",
            "stock": "saldo_temp",
            "saldo_temp": "saldo_temp",
            "precio": "precio_venta",
            "precio_venta": "precio_venta"
        }

        columna_real = mapa_columnas.get(orden_columna, "codigo")
        es_descendente = (orden_direccion.lower() == "desc")

        # Ordenamiento seguro evitando fallos por NULLs
        query = query.order(columna_real, desc=es_descendente, nullsfirst=False)

        # Paginación
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
        print("Error al obtener producto:", str(e))
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
        print("Error al actualizar producto:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    try:
        res = supabase.table("productos").delete().eq("id", producto_id).execute()
        return {"status": "ok", "deleted": res.data}
    except Exception as e:
        print("Error al eliminar producto:", str(e))
        return {"status": "error", "message": str(e)}