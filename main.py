from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Montar los archivos estáticos de la carpeta web
app.mount("/web", StaticFiles(directory="web", html=True), name="web")

# Redireccionar la raíz '/' hacia la página principal
@app.get("/")
def read_root():
    return RedirectResponse(url="/web/index.html")