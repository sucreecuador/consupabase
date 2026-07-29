import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def home():
    return jsonify({"message": "API de Consulta Sucre funcionando correctamente"})

# ----------------------------------------------------
# RUTA 1: PRODUCTOS
# ----------------------------------------------------
@app.route('/productos', methods=['GET'])
def get_productos():
    try:
        page = int(request.args.get('page', 0))
        page_size = int(request.args.get('page_size', 50))
        
        descripcion = request.args.get('descripcion', '').strip()
        codigo = request.args.get('codigo', '').strip()
        marca = request.args.get('marca', '').strip()
        proveedor = request.args.get('proveedor', '').strip()

        start = page * page_size
        end = start + page_size - 1

        query = supabase.table('productos').select('*', count='exact')

        if descripcion:
            query = query.ilike('descripcion', f'%{descripcion}%')
        if codigo:
            query = query.ilike('codigo', f'%{codigo}%')
        if marca:
            query = query.ilike('marca', f'%{marca}%')
        if proveedor:
            query = query.ilike('codigo_proveedor', f'%{proveedor}%')

        response = query.range(start, end).execute()

        total_records = response.count or 0
        total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

        return jsonify({
            "data": response.data,
            "page": page,
            "total_pages": total_pages,
            "total": total_records
        })
    except Exception as e:
        print(f"Error en /productos: {e}")
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------
# RUTA 2: CONTACTOS (Tabla 'clientes')
# ----------------------------------------------------
@app.route('/contactos', methods=['GET'])
def get_contactos():
    try:
        page = int(request.args.get('page', 0))
        page_size = int(request.args.get('page_size', 50))
        
        nombre = request.args.get('nombre', '').strip()
        ruc = request.args.get('ruc', '').strip()
        codigo = request.args.get('codigo', '').strip()

        start = page * page_size
        end = start + page_size - 1

        query = supabase.table('clientes').select('*', count='exact')

        # Filtro flexible para evitar errores de columnas inexistentes
        if nombre:
            try:
                query = query.ilike('nombre', f'%{nombre}%')
            except:
                pass
        if ruc:
            try:
                query = query.ilike('ruc', f'%{ruc}%')
            except:
                pass
        if codigo:
            try:
                query = query.ilike('codigo_cliente', f'%{codigo}%')
            except:
                pass

        response = query.range(start, end).execute()

        total_records = response.count or 0
        total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

        return jsonify({
            "data": response.data,
            "page": page,
            "total_pages": total_pages,
            "total": total_records
        })
    except Exception as e:
        print(f"Error en /contactos: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)