from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os

app = FastAPI(title="ERP Sucre API")

# Rutas de tus endpoints backend (ejemplo)
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Montar la carpeta web para servir el Frontend
# Verifica que la carpeta 'web' exista en la raíz del proyecto
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

@app.get("/")
def read_root():
    # Redirige la raíz automáticamente a productos
    return RedirectResponse(url="/web/productos/index.html")

# Agrega aquí el resto de tus endpoints de productos, clientes, etc.