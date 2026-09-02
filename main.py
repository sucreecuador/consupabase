import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt

BASE_DIR = Path(__file__).resolve().parent

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "sucre_secret_key_2026_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="ERP Sucre API",
    version="1.0.0",
    description="Backend FastAPI para ERP Sucre"
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

def render_page(title: str, active_tab: str, content_html: str):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP SUCRE - {title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {{ background-color: #e9ecef; font-family: system-ui, -apple-system, sans-serif; }}
        .top-navbar {{
            background-color: #e2e8f0;
            border-bottom: 1px solid #cbd5e1;
            padding: 8px 24px;
        }}
        .brand-title {{
            font-weight: 800;
            color: #1e293b;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .user-pill {{
            font-weight: 500;
            color: #334155;
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        .sidebar {{
            min-height: calc(100vh - 49px);
            background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
            padding-top: 10px;
        }}
        .sidebar .nav-link {{
            color: #94a3b8;
            font-weight: 500;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.95rem;
            border-radius: 0;
            transition: all 0.2s;
        }}
        .sidebar .nav-link:hover {{
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.05);
        }}
        .sidebar .nav-link.active {{
            color: #ffffff;
            background-color: #2563eb;
        }}
        .main-content {{
            padding: 24px 32px;
            background-color: #f1f5f9;
            min-height: calc(100vh - 49px);
        }}
        .page-title {{
            color: #0f172a;
            font-weight: 700;
            margin-bottom: 24px;
            font-size: 1.5rem;
        }}
        .tile-card {{
            border: none;
            border-radius: 14px;
            padding: 24px 16px;
            text-align: center;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 140px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }}
        .tile-card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }}
        .tile-icon {{ font-size: 2.5rem; margin-bottom: 8px; line-height: 1; }}
        .tile-label {{ font-weight: 600; font-size: 1.05rem; }}
        .tile-contacts {{ background-color: #bfdbfe; color: #1e3a8a; }}
        .tile-products {{ background-color: #fed7aa; color: #7c2d12; }}
        .tile-inventory {{ background-color: #bbf7d0; color: #14532d; }}
        .tile-billing {{ background-color: #e9d5ff; color: #581c87; }}
        .tile-indicators {{ background-color: #fef08a; color: #713f12; }}
        .tile-reports {{ background-color: #a7f3d0; color: #064e3b; }}
        .tile-config {{ background-color: #cbd5e1; color: #334155; }}
        .tile-empty {{ background-color: #e2e8f0; border: 2px dashed #cbd5e1; }}
    </style>
</head>
<body>

<header class="top-navbar d-flex justify-content-between align-items-center">
    <div class="brand-title">
        <i class="bi bi-three-dots-vertical text-success"></i> ERP SUCRE
    </div>
    <div class="user-pill">
        <span>Bienvenido, <strong id="user-display-name">Ricardo</strong></span>
        <i class="bi bi-person-circle fs-4"></i>
        <a href="/api/logout" class="btn btn-sm btn-outline-danger ms-2" title="Cerrar Sesión">
            <i class="bi bi-box-arrow-right"></i>
        </a>
    </div>
</header>

<div class="container-fluid p-0">
    <div class="row g-0">
        <nav class="col-md-2 sidebar">
            <div class="nav flex-column">
                <a class="nav-link {'active' if active_tab == 'inicio' else ''}" href="/dashboard"><i class="bi bi-house-door-fill"></i> Inicio</a>
                <a class="nav-link {'active' if active_tab == 'contactos' else ''}" href="/contactos"><i class="bi bi-people-fill"></i> Contactos</a>
                <a class="nav-link {'active' if active_tab == 'productos' else ''}" href="/productos"><i class="bi bi-box-seam-fill"></i> Productos</a>
                <a class="nav-link {'active' if active_tab == 'inventario' else ''}" href="/inventario"><i class="bi bi-basket3-fill"></i> Inventario</a>
                <a class="nav-link {'active' if active_tab == 'facturacion' else ''}" href="/facturacion"><i class="bi bi-file-earmark-text-fill"></i> Facturación</a>
                <a class="nav-link {'active' if active_tab == 'indicadores' else ''}" href="/indicadores"><i class="bi bi-graph-up-arrow"></i> Indicadores</a>
                <a class="nav-link {'active' if active_tab == 'reportes' else ''}" href="/reportes"><i class="bi bi-table"></i> Reportes</a>
                <a class="nav-link {'active' if active_tab == 'configuracion' else ''}" href="/configuracion"><i class="bi bi-gear-fill"></i> Configuración</a>
            </div>
        </nav>

        <main class="col-md-10 main-content">
            <h3 class="page-title">{title}</h3>
            {content_html}
        </main>
    </div>
</div>

<script>
async function cargarUsuario() {{
    const token = localStorage.getItem("access_token");
    try {{
        const response = await fetch("/api/configuracion/empresa", {{
            headers: token ? {{ "Authorization": "Bearer " + token }} : {{}}
        }});
        if (response.ok) {{
            const data = await response.json();
            if (data.usuario) {{
                document.getElementById("user-display-name").textContent = data.usuario;
            }}
        }}
    }} catch (e) {{
        console.warn("Cargando perfil por defecto");
    }}
}}
cargarUsuario();
</script>

</body>
</html>"""

@app.post("/api/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.environ.get("ADMIN_USER", "admin")
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    if form_data.username == admin_user and form_data.password == admin_pass:
        access_token = create_access_token(data={"sub": form_data.username})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=False,
            samesite="lax",
            path="/"
        )
        return {"access_token": access_token, "token_type": "bearer", "redirect_url": "/dashboard"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return RedirectResponse(url="/login")

@app.get("/")
def read_root():
    return RedirectResponse(url="/login")

@app.get("/web/index.html")
def redirect_legacy_web():
    return RedirectResponse(url="/dashboard")

@app.get("/login", response_class=HTMLResponse)
def get_login_page():
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP SUCRE - Iniciar Sesión</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f4f6f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        .login-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 2.5rem; width: 100%; max-width: 400px; }
        .btn-primary-sucre { background-color: #1a365d; border-color: #1a365d; color: white; padding: 0.6rem; font-weight: 500; }
        .btn-primary-sucre:hover { background-color: #0f2942; border-color: #0f2942; }
    </style>
</head>
<body>
<div class="login-card">
    <h3 class="text-center mb-4 fw-bold text-dark">ERP SUCRE</h3>
    <div id="alert-error" class="alert alert-danger d-none text-center" role="alert"></div>

    <form id="login-form">
        <div class="mb-3">
            <label for="username" class="form-label text-secondary">Usuario</label>
            <input type="text" class="form-control" id="username" name="username" required placeholder="admin">
        </div>
        <div class="mb-4">
            <label for="password" class="form-label text-secondary">Contraseña</label>
            <input type="password" class="form-control" id="password" name="password" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn btn-primary-sucre w-100">Ingresar</button>
    </form>
</div>
<script>
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertError = document.getElementById("alert-error");
    alertError.classList.add("d-none");
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    const formData = new URLSearchParams();
    formData.append("username", usernameInput);
    formData.append("password", passwordInput);
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("access_token", data.access_token);
            window.location.replace("/dashboard");
        } else {
            alertError.textContent = data.detail || "Usuario o contraseña incorrectos";
            alertError.classList.remove("d-none");
        }
    } catch (err) {
        alertError.textContent = "Error de conexión con el servidor";
        alertError.classList.remove("d-none");
    }
});
</script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard_page():
    dashboard_grid = """
    <div class="row g-4">
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/contactos" class="tile-card tile-contacts">
                <i class="bi bi-people tile-icon"></i>
                <span class="tile-label">Contactos</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/productos" class="tile-card tile-products">
                <i class="bi bi-box-seam tile-icon"></i>
                <span class="tile-label">Productos</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/inventario" class="tile-card tile-inventory">
                <i class="bi bi-buildings tile-icon"></i>
                <span class="tile-label">Inventario</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/facturacion" class="tile-card tile-billing">
                <i class="bi bi-receipt tile-icon"></i>
                <span class="tile-label">Facturación</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/indicadores" class="tile-card tile-indicators">
                <i class="bi bi-graph-up tile-icon"></i>
                <span class="tile-label">Indicadores</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/reportes" class="tile-card tile-reports">
                <i class="bi bi-layout-three-columns tile-icon"></i>
                <span class="tile-label">Reportes</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
            <a href="/configuracion" class="tile-card tile-config">
                <i class="bi bi-gear tile-icon"></i>
                <span class="tile-label">Configuración</span>
            </a>
        </div>
        <div class="col-12 col-sm-6 col-md-4"><div class="tile-card tile-empty"></div></div>
        <div class="col-12 col-sm-6 col-md-4"><div class="tile-card tile-empty"></div></div>
    </div>
    """
    return HTMLResponse(content=render_page("Inicio", "inicio", dashboard_grid))

@app.get("/contactos", response_class=HTMLResponse)
def get_contactos_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Módulo de Contactos</h5><p class="text-muted">Gestión de clientes y proveedores.</p></div>"""
    return HTMLResponse(content=render_page("Contactos", "contactos", content))

@app.get("/productos", response_class=HTMLResponse)
def get_productos_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Catálogo de Productos</h5><p class="text-muted">Gestión de productos y lista de precios.</p></div>"""
    return HTMLResponse(content=render_page("Productos", "productos", content))

@app.get("/inventario", response_class=HTMLResponse)
def get_inventario_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Gestión de Inventario</h5><p class="text-muted">Control de existencias y bodegas.</p></div>"""
    return HTMLResponse(content=render_page("Inventario", "inventario", content))

@app.get("/facturacion", response_class=HTMLResponse)
def get_facturacion_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Módulo de Facturación</h5><p class="text-muted">Emisión de comprobantes y proformas.</p></div>"""
    return HTMLResponse(content=render_page("Facturación", "facturacion", content))

@app.get("/indicadores", response_class=HTMLResponse)
def get_indicadores_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Indicadores</h5><p class="text-muted">Métricas de desempeño y ventas.</p></div>"""
    return HTMLResponse(content=render_page("Indicadores", "indicadores", content))

@app.get("/reportes", response_class=HTMLResponse)
def get_reportes_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Reportes</h5><p class="text-muted">Generación de reportes ejecutivos.</p></div>"""
    return HTMLResponse(content=render_page("Reportes", "reportes", content))

@app.get("/configuracion", response_class=HTMLResponse)
def get_configuracion_page():
    content = """<div class="card p-4 border-0 shadow-sm"><h5>Configuración del Sistema</h5><p class="text-muted">Parámetros generales de la empresa y permisos.</p></div>"""
    return HTMLResponse(content=render_page("Configuración", "configuracion", content))

@app.get("/api/configuracion/empresa")
def get_configuracion_empresa(current_user: str = Depends(get_current_user)):
    return {
        "empresa": "Importadora Comercial Sucre",
        "estado": "activo",
        "usuario": "Ricardo" if current_user == "admin" else current_user
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)