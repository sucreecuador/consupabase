// Inicializar Supabase si no está global
const supabaseUrl = 'https://TU_SUPABASE_URL.supabase.co';
const supabaseKey = 'TU_SUPABASE_KEY';
const _supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

document.addEventListener('DOMContentLoaded', () => {
  cargarConfiguracion();

  const btnGuardar = document.querySelector('button.btn-success, #btnGuardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarConfiguracion);
  }
});

// 1. CARGAR DATOS EN LOS INPUTS AL ABRIR LA PÁGINA
async function cargarConfiguracion() {
  try {
    // Si usas Supabase (Tabla: configuracion_empresa):
    const { data, error } = await _supabase
      .from('configuracion_empresa')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error al obtener datos:', error);
      return;
    }

    if (data) {
      document.querySelectorAll('.card-body input, .main-content input')[0].value = data.nombre_comercial || '';
      document.querySelectorAll('.card-body input, .main-content input')[1].value = data.ruc || '';
      document.querySelectorAll('.card-body input, .main-content input')[2].value = data.direccion || '';
      document.querySelectorAll('.card-body input, .main-content input')[3].value = data.telefono || '';
    }
  } catch (err) {
    console.warn('Cargando desde almacenamiento local o fallback:', err);
  }
}

// 2. GUARDAR / ACTUALIZAR DATOS EN SUPABASE
async function guardarConfiguracion(e) {
  e.preventDefault();

  const inputs = document.querySelectorAll('.main-content input, .card input');
  
  const payload = {
    id: 1, // ID fijo para la configuración global de la empresa
    nombre_comercial: inputs[0]?.value.trim(),
    ruc: inputs[1]?.value.trim(),
    direccion: inputs[2]?.value.trim(),
    telefono: inputs[3]?.value.trim(),
    updated_at: new Date()
  };

  try {
    const { error } = await _supabase
      .from('configuracion_empresa')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    alert('¡Datos de la empresa guardados correctamente!');
  } catch (err) {
    console.error('Error guardando en Supabase:', err);
    alert('Error al guardar la configuración: ' + err.message);
  }
}