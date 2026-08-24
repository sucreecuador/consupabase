from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")

# Servir carpeta web
app.mount("/web", StaticFiles(directory=WEB_DIR), name="web")

# Página principal
@app.get("/")
def root():
    return FileResponse(os.path.join(WEB_DIR, "dashboard", "index.html"))

# -----------------------------
#   CONEXIÓN SUPABASE
# -----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------------
#   API PRODUCTOS
# -----------------------------

@app.get("/api/productos")
def get_productos():
    try:
        data = supabase.table("productos").select("*").execute()
        return data.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/productos")
def crear_producto(producto: dict):
    try:
        data = supabase.table("productos").insert(producto).execute()
        return data.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/productos/{id}")
def actualizar_producto(id: int, producto: dict):
    try:
        data = supabase.table("productos").update(producto).eq("id", id).execute()
        return data.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/productos/{id}")
def eliminar_producto(id: int):
    try:
        data = supabase.table("productos").delete().eq("id", id).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
