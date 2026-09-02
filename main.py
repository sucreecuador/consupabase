import os
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "cambiar_esta_clave_secreta_en_produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="ERP Sucre API",
    version="1.0.0",
    description="Backend FastAPI y Frontend estático protegido para ERP Sucre"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token_string(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except jwt.PyJWTError:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = verify_token_string(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.environ.get("ADMIN_USER", "admin")
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    if form_data.username == admin_user and form_data.password == admin_pass:
        access_token = create_access_token(data={"sub": form_data.username})
        response_data = {"access_token": access_token, "token_type": "bearer"}
        return response_data
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/")
def read_root():
    if os.path.exists("web/login.html"):
        return RedirectResponse(url="/login")
    elif os.path.exists("web/index.html"):
        return RedirectResponse(url="/web/index.html")
    return {"status": "ok", "message": "ERP Sucre API activa en Railway"}

@app.get("/login")
def get_login_page():
    if os.path.exists("web/login.html"):
        return FileResponse("web/login.html")
    return {"status": "ok", "message": "Formulario de login no disponible en web/login.html"}

@app.get("/web/{file_path:path}")
def serve_protected_web(file_path: str, request: Request):
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    
    if not token:
        token = request.cookies.get("access_token")
        
    if not token or not verify_token_string(token):
        if file_path.endswith(".html") or file_path == "":
            return RedirectResponse(url="/login")
        raise HTTPException(status_code=401, detail="Acceso denegado")
        
    target_path = os.path.join("web", file_path)
    if os.path.isdir(target_path):
        target_path = os.path.join(target_path, "index.html")
        
    if os.path.exists(target_path):
        return FileResponse(target_path)
    
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

@app.get("/api/configuracion/empresa")
def get_configuracion_empresa(current_user: str = Depends(get_current_user)):
    return {
        "empresa": "Importadora Comercial Sucre",
        "estado": "activo",
        "usuario": current_user
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)