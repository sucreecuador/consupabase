from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Ruta base del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")

# Servir carpeta web completa
app.mount("/web", StaticFiles(directory=WEB_DIR), name="web")

# Página principal del ERP
@app.get("/")
def root():
    index_path = os.path.join(WEB_DIR, "dashboard", "index.html")
    return FileResponse(index_path)
