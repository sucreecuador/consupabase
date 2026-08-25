import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client

app = FastAPI()

# Configuración de Supabase desde variables de entorno
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Archivos estáticos
app.mount("/web", StaticFiles(directory="web"), name="web")

# Rutas de frontend
@app.get("/")
async def read_root():
    return FileResponse("web/index.html")

# Endpoint para consultar la tabla 'clientes' de Supabase
@app.get("/api/contactos")
async def get_contactos():
    try:
        response = supabase.table("clientes").select("*").execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)