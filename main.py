import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
import jwt

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"

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

# --- MIDDLEWARE DE AUTENTICACIÓN ASÍNCRONO ---
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    
    # Rutas públicas
    if path in ["/login", "/api/login", "/debug", "/docs", "/openapi.json"]:
        return await call_next(request)
        
    # Rutas protegidas bajo /web/
    if path.startswith("/web"):
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            
        if not token or not verify_token_string(token):
            return RedirectResponse(url="/login", status_code=307)

    response = await call_next(request)
    return response

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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

@app.get("/debug")
def debug_info():
    files_in_root = [str(p.name) for p in BASE_DIR.iterdir()]
    web_exists = WEB_DIR.exists()
    web_files = [str(p.relative_to(WEB_DIR)) for p in WEB_DIR.glob("**/*")] if web_exists else []
    
    return {
        "base_dir": str(BASE_DIR),
        "files_in_root": files_in_root,
        "web_dir_exists": web_exists,
        "web_files": web_files
    }

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
            secure=True
        )
        return {"access_token": access_token, "token_type": "bearer", "redirect_url": "/web/index.html"}
    
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

@app.get("/login", response_class=HTMLResponse)
def get_login_page():
    login_path = WEB_DIR / "login.html"
    
    if login_path.exists():
        return HTMLResponse(content=login_path.read_text(encoding="utf-8"))
            
    return HTMLResponse(content=f"<h2>Error: No se encontró el archivo {login_path} en el servidor.</h2>", status_code=404)

if WEB_DIR.exists():
    app.mount("/web", StaticFiles(directory=str(WEB_DIR), html=True), name="web")

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