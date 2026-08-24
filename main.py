from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI(title="ERP Sucre API")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://tu-proyecto.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "tu-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/productos")
async def get_productos(request: Request):
    contacto = request.query_params.get("contacto")

    if not contacto:
        contacto = "319"

    val_int = int(contacto) if contacto.isdigit() else -1

    query = (
        supabase
        .from("productos")
        .select("id, codigo, codigo_proveedor, marca, descripcion, unidad, "
                "naci, saldo_temp, costo_prom, precio_venta, pro1, pro2, pro3")
        .or(f"pro1.eq.{contacto},pro2.eq.{contacto},pro3.eq.{contacto},"
            f"pro1.eq.{val_int},pro2.eq.{val_int},pro3.eq.{val_int}")
        .range(0, 4999)
    )

    respuesta = query.execute()
    return respuesta.data

@app.put("/api/productos/{id_producto}")
async def actualizar_producto(id_producto: str, datos: dict):
    respuesta = supabase.from("productos").update(datos).eq("id", id_producto).execute()
    return {"status": "ok", "data": respuesta.data}

@app.delete("/api/productos/{id_producto}")
async def eliminar_producto(id_producto: str):
    respuesta = supabase.from("productos").delete().eq("id", id_producto).execute()
    return {"status": "ok", "data": respuesta.data}

if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

    @app.get("/", methods=["GET", "HEAD"])
    def root():
        return FileResponse("web/index.html")

    # Redirección específica para productos.html según tu árbol de carpetas
    @app.get("/web/productos")
    @app.get("/web/productos/")
    def productos_page():
        return FileResponse("web/productos/productos.html")

    @app.get("/{file_name:path}")
    def servir_archivos_estaticos(file_name: str):
        path_relativo = os.path.join("web", file_name)
        if os.path.isfile(path_relativo):
            return FileResponse(path_relativo)

        path_directo = os.path.join("web", os.path.basename(file_name))
        if os.path.isfile(path_directo):
            return FileResponse(path_directo)

        return FileResponse("web/index.html")