import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

app = FastAPI(
    title="ERP Sucre API",
    version="1.0.0",
    description="Backend FastAPI y Frontend estático para ERP Sucre"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir carpeta estática 'web' (donde están index.html, facturacion.js, etc.)
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

@app.get("/")
def read_root():
    # Redirige automáticamente a la interfaz web si existe index.html
    if os.path.exists("web/index.html"):
        return RedirectResponse(url="/web/index.html")
    return {"status": "ok", "message": "ERP Sucre API activa en Railway"}

@app.get("/api/configuracion/empresa")
def get_configuracion_empresa():
    return {
        "empresa": "Importadora Comercial Sucre",
        "estado": "activo"
    }

if __name__ == "__main__":
    import uvicorn
    # Toma el puerto asignado por la plataforma (PORT) o usa 8080 por defecto
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)