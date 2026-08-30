// Obtener URL base del dominio desplegado en Render
const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Manejo de Pestañas
  const tabs = [
    { btn: 'tabEmpresa', sec: 'secEmpresa' },
    { btn: 'tabImpuestos', sec: 'secImpuestos' },
    { btn: 'tabSeguridad', sec: 'secSeguridad' },
    { btn: 'tabPreferencias', sec: 'secPreferencias' }
  ];

  tabs.forEach(item => {
    const cardEl = document.getElementById(item.btn);
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        tabs.forEach(t => {
          document.getElementById(t.btn)?.classList.remove('active-tab');
          document.getElementById(t.sec)?.classList.add('d-none');
        });
        cardEl.classList.add('active-tab');
        document.getElementById(item.sec)?.classList.remove('d-none');
      });
    }
  });

  // 2. Cargar configuración inicial
  cargarConfiguracion();

  // 3. Listener del formulario de Empresa
  const formEmpresa = document.getElementById('formEmpresa');
  if (formEmpresa) {
    formEmpresa.addEventListener('submit', guardarConfiguracion);
  }
});

// Cargar datos existentes de la empresa
async function cargarConfiguracion() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/configuracion/empresa`);
    if (!res.ok) throw new Error('No se pudo obtener la configuración');
    const data = await res.json();

    if (data) {
      document.getElementById('cfgNombreComercial').value = data.nombre_comercial || '';
      document.getElementById('cfgRuc').value = data.ruc || '';
      document.getElementById('cfgDireccion').value = data.direccion || '';
      document.getElementById('cfgTelefono').value = data.telefono || '';
    }
  } catch (err) {
    console.warn('Backend endpoint no disponible, intentando desde localStorage:', err);
    const localData = JSON.parse(localStorage.getItem('config_empresa') || '{}');
    if (localData.nombre_comercial) {
      document.getElementById('cfgNombreComercial').value = localData.nombre_comercial || '';
      document.getElementById('cfgRuc').value = localData.ruc || '';
      document.getElementById('cfgDireccion').value = localData.direccion || '';
      document.getElementById('cfgTelefono').value = localData.telefono || '';
    }
  }
}

// Guardar datos de la empresa
async function guardarConfiguracion(e) {
  e.preventDefault();

  const payload = {
    nombre_comercial: document.getElementById('cfgNombreComercial').value.trim(),
    ruc: document.getElementById('cfgRuc').value.trim(),
    direccion: document.getElementById('cfgDireccion').value.trim(),
    telefono: document.getElementById('cfgTelefono').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/configuracion/empresa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Fallback a localStorage si la API no está expuesta en FastAPI aún
      localStorage.setItem('config_empresa', JSON.stringify(payload));
    }

    alert('¡Configuración guardada correctamente!');
  } catch (err) {
    // Si falla el fetch por red, asegura la persistencia en el navegador sin error de alerta brusco
    localStorage.setItem('config_empresa', JSON.stringify(payload));
    alert('¡Configuración guardada en almacenamiento local!');
  }
}