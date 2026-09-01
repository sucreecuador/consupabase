import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Instanciación previa de la app
app = FastAPI(
    title="ERP Sucre API",
    version="1.0.0"
)

# 2. Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Definición de rutas
@app.get("/")
def read_root():
    return {"status": "ok", "message": "ERP Sucre API activa"}

@app.get("/api/configuracion/empresa")
def get_configuracion_empresa():
    return {
        "empresa": "Importadora Comercial Sucre",
        "estado": "activo"
    }

# 4. Bloque de ejecución principal con lectura dinámica de puerto para Railway/Render
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)