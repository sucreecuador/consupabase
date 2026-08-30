// Detecta automáticamente el origen (ej. https://consupabase-apiv2.onrender.com)
const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Alternar pestañas superiores
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

  // 2. Cargar datos existentes al abrir la página
  cargarConfiguracion();

  // 3. Escuchar el submit del formulario de Empresa
  const formEmpresa = document.getElementById('formEmpresa');
  if (formEmpresa) {
    formEmpresa.addEventListener('submit', guardarConfiguracion);
  }
});

// Cargar la configuración de la empresa
async function cargarConfiguracion() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/configuracion/empresa`);
    if (!response.ok) throw new Error('API no disponible');
    const data = await response.json();

    if (data) {
      document.getElementById('cfgNombreComercial').value = data.nombre_comercial || '';
      document.getElementById('cfgRuc').value = data.ruc || '';
      document.getElementById('cfgDireccion').value = data.direccion || '';
      document.getElementById('cfgTelefono').value = data.telefono || '';
    }
  } catch (err) {
    console.warn('Cargando datos desde almacenamiento local:', err);
    const localData = JSON.parse(localStorage.getItem('config_empresa') || '{}');
    if (localData.nombre_comercial) {
      document.getElementById('cfgNombreComercial').value = localData.nombre_comercial || '';
      document.getElementById('cfgRuc').value = localData.ruc || '';
      document.getElementById('cfgDireccion').value = localData.direccion || '';
      document.getElementById('cfgTelefono').value = localData.telefono || '';
    }
  }
}

// Guardar la configuración
async function guardarConfiguracion(e) {
  e.preventDefault();

  const payload = {
    nombre_comercial: document.getElementById('cfgNombreComercial').value.trim(),
    ruc: document.getElementById('cfgRuc').value.trim(),
    direccion: document.getElementById('cfgDireccion').value.trim(),
    telefono: document.getElementById('cfgTelefono').value.trim()
  };

  // Guardado preventivo inmediato en LocalStorage
  localStorage.setItem('config_empresa', JSON.stringify(payload));

  try {
    const response = await fetch(`${API_BASE_URL}/api/configuracion/empresa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('¡Configuración guardada exitosamente en el servidor!');
    } else {
      alert('¡Datos guardados localmente! (Pendiente sincronización con servidor)');
    }
  } catch (err) {
    // Captura el error de red sin interrumpir al usuario
    console.warn('Error enviando al backend:', err);
    alert('¡Configuración guardada en almacenamiento local!');
  }
}