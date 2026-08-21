from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir carpeta web/
app.mount("/web", StaticFiles(directory="web"), name="web")

@app.get("/")
def root():
    return {
        "status": "ERP CONSUPABASE funcionando",
        "version": "1.0",
        "dashboard": "/web/dashboard/dashboard.html",
        "sidebar": "/web/components/sidebar/sidebar.html"
    }
