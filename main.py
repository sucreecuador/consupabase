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
            secure=True  # Habilitado para HTTPS en Railway
        )
        return {"access_token": access_token, "token_type": "bearer", "redirect_url": "/web/index.html"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuario o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )