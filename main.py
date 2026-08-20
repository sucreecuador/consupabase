import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ============================================================
# VALIDACIÓN DE VARIABLES DE ENTORNO
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("ERROR: Debes configurar SUPABASE_URL y SUPABASE_KEY en Render.")

# ============================================================
# CLIENTE SUPABASE
# ============================================================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(title="CONSUPABASE API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {"status": "ok", "message": "API CONSUPABASE funcionando"}

# ---------------------- PRODUCTOS ---------------------------

@app.get("/productos")
def get_productos(page: int = 0, page_size: int = 20):
    try:
        start = page * page_size
        end = start + page_size

        data = (
            supabase.table("productos")
            .select("*")
            .range(start, end)
            .execute()
        )

        return data.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------- CONTACTOS ---------------------------

@app.get("/contactos")
def get_contactos(page: int = 0, page_size: int = 20):
    try:
        start = page * page_size
        end = start + page_size

        data = (
            supabase.table("contactos")
            .select("*")
            .range(start, end)
            .execute()
        )

        return data.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# EJECUCIÓN UVICORN (solo local)
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
