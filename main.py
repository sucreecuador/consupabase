import os
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from supabase import create_client, Client

app = FastAPI(title="ERP Sucre API")

# Configuración Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/api/productos")
async def obtener_productos(
    descripcion: str = Query(None, alias="descripcion"),
    pagina: int = Query(1, alias="pagina"),
    por_pagina: int = Query(20, alias="porPagina"),
    orden_columna: str = Query("descripcion", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    try:
        if supabase:
            query = supabase.table("productos").select("*", count="exact")

            if descripcion and descripcion.strip():
                query = query.ilike("descripcion", f"%{descripcion.strip()}%")

            desc_bool = (orden_direccion.lower() == "desc")
            query = query.order(orden_columna, desc=desc_bool)
            
            desde = (pagina - 1) * por_pagina
            hasta = desde + por_pagina - 1
            query = query.range(desde, hasta)

            res = query.execute()

            if res.data and len(res.data) > 0:
                total_registros = res.count or len(res.data)
                total_paginas = (total_registros + por_pagina - 1) // por_pagina
                return {
                    "data": res.data,
                    "totalPaginas": total_paginas
                }

        # Fallback de prueba si Supabase no tiene registros o no está configurado
        datos_demo = [
            {"id": 1, "codigo": "PROD001", "descripcion": "Toldo Impermeable 4 Personas", "marca": "Coleman", "proveedor": "Distribuidora Andes", "stock": 15, "precio": 120.50},
            {"id": 2, "codigo": "PROD002", "descripcion": "Linterna LED Recargable", "marca": "FlashPro", "proveedor": "Importadora Fluvial", "stock": 42, "precio": 25.00},
            {"id": 3, "codigo": "PROD003", "descripcion": "Camiseta Algodón 50/50", "marca": "TextilSucre", "proveedor": "Confecciones GYE", "stock": 100, "precio": 12.99}
        ]
        
        return {
            "data": datos_demo,
            "totalPaginas": 1
        }

    except Exception as e:
        print("Error en consulta Supabase:", e)
        return {"data": [], "totalPaginas": 1}

# Montar frontend web
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

@app.get("/")
def read_root():
    return RedirectResponse(url="/web/productos/index.html")