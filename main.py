from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# ------------------------------------------------------------
# 1) Servir carpeta /web como archivos estáticos
# ------------------------------------------------------------
app.mount("/web", StaticFiles(directory="web"), name="web")

# ------------------------------------------------------------
# 2) Ruta raíz → dashboard principal
# ------------------------------------------------------------
@app.get("/")
def root():
    return FileResponse("web/dashboard/dashboard.html")

# ------------------------------------------------------------
# 3) Rutas para archivos HTML dentro de /web
# ------------------------------------------------------------
@app.get("/web/{folder}/{file}")
def serve_html(folder: str, file: str):
    path = f"web/{folder}/{file}"
    if os.path.exists(path):
        return FileResponse(path)
    return {"error": "Archivo no encontrado", "path": path}

# ------------------------------------------------------------
# 4) Rutas para subcarpetas más profundas
#    Ejemplo: /web/components/sidebar/sidebar.html
# ------------------------------------------------------------
@app.get("/web/{folder}/{subfolder}/{file}")
def serve_html_nested(folder: str, subfolder: str, file: str):
    path = f"web/{folder}/{subfolder}/{file}"
    if os.path.exists(path):
        return FileResponse(path)
    return {"error": "Archivo no encontrado", "path": path}

# ------------------------------------------------------------
# 5) Ruta directa para productos (opcional)
# ------------------------------------------------------------
@app.get("/productos")
def productos():
    return FileResponse("web/productos/productos.html")
