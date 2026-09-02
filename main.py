import os
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
import jwt

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "sucre_secret_key_2026_prod")
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

def verify_token_string(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except jwt.PyJWTError:
        return None

# --- MIDDLEWARE DE AUTENTICACIÓN PARA PROTECCIÓN DE LA CARPETA /web ---
@app.middleware("http")
def auth_middleware(request: Request, call_next):
    path = request.url.path
    
    # Proteger todas las rutas bajo /web/ (excepto assets estáticos de login si los hubiera)
    if path.startswith("/web"):
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            
        if not token or not verify_token_string(token):
            return RedirectResponse(url="/login", status_code=307)

    response = call_next(request)
    return response

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

def get_current_user(request: Request, token: Optional[str] = Depends(oauth2_scheme)):
    cookie_token = request.cookies.get("access_token")
    active_token = token or cookie_token
    
    if not active_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = verify_token_string(active_token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username

@app.post("/api/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.environ.get("ADMIN_USER", "admin")
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    if form_data.username == admin_user and form_data.password == admin_pass:
        access_token = create_access_token(data={"sub": form_data.username})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=False
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return RedirectResponse(url="/login")

@app.get("/")
def read_root(request: Request):
    token = request.cookies.get("access_token")
    if token and verify_token_string(token):
        return RedirectResponse(url="/web/index.html")
    return RedirectResponse(url="/login")

# Endpoint para servir la pantalla de login (URL de acceso: https://tu-domain.up.railway.app/login)
@app.get("/login")
def get_login_page(request: Request):
    token = request.cookies.get("access_token")
    if token and verify_token_string(token):
        return RedirectResponse(url="/web/index.html")
    if os.path.exists("web/login.html"):
        return FileResponse("web/login.html")
    raise HTTPException(status_code=404, detail="El archivo web/login.html no existe en el proyecto")

# Montura de la carpeta /web para servir los archivos del ERP
app.mount("/web", StaticFiles(directory="web", html=True), name="web")

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