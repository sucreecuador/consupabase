from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os

app = FastAPI()

# ================================
#   CONFIGURAR SUPABASE
# ================================
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ================================
#   CORS
# ================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
#   ENDPOINT /api/productos
#   Filtra por cualquier contacto
# ================================
@app.get("/api/productos")
async def get_productos(request: Request):
    contacto = request.query_params.get("contacto")

    # Si no envías contacto, usa 319 por defecto
    if not contacto:
        contacto = "319"

    query = (
        supabase
        .from("productos")
        .select("id, codigo, codigo_proveedor, marca, descripcion, unidad, "
                "naci, saldo_temp, costo_prom, precio_venta, pro1, pro2, pro3")
        .limit(5000)
        .or(f"pro1.eq.{contacto},pro2.eq.{contacto},pro3.eq.{contacto}")
    )

    data = query.execute()
    return data.data

# ================================
#   ENDPOINT DE PRUEBA
# ================================
@app.get("/")
def root():
    return {"status": "API funcionando"}
