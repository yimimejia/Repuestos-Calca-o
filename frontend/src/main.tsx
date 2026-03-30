import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import { Layout, MenuItem } from './app/Layout';

const API = import.meta.env.VITE_API_BASE ?? '/api';
const WS_URL = import.meta.env.VITE_WS_URL ?? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

function moduloDesdeRuta(pathname: string) {
  if (pathname === '/admin/importar-sql-legado') return 'importador';
  return null;
}

function rutaDesdeModulo(modulo: string, rol: string) {
  if (rol === 'administrador' && modulo === 'importador') return '/admin/importar-sql-legado';
  return '/';
}

type Usuario = { id: string; username: string; nombre: string; rol: string; sucursal_id?: string | null };
type Cliente = any;
type Producto = any;
type Sucursal = any;
type Categoria = any;
type Suplidor = any;
type Vendedor = any;
type Toast = { id: number; tipo: 'ok' | 'error'; texto: string };

const menuPorRol: Record<string, MenuItem[]> = {
  vendedor: [
    { key: 'pos', label: 'POS Vendedor', icono: '🧾', acento: 'violeta' },
    { key: 'fidelidad', label: 'Fidelidad', icono: '⭐', acento: 'amarillo' },
  ],
  cajero: [
    { key: 'pos', label: 'POS / Caja', icono: '🧾', acento: 'violeta' },
    { key: 'caja', label: 'Facturas y Cobros', icono: '💳', acento: 'celeste' },
    { key: 'historial-ventas', label: 'Historial de Ventas', icono: '🗂️', acento: 'gris' },
    { key: 'fidelidad', label: 'Fidelidad', icono: '⭐', acento: 'amarillo' },
  ],
  al_por_mayor: [{ key: 'mayorista', label: 'Edición Mayorista', icono: '🏷️', acento: 'naranja' }],
  administrador: [
    { key: 'admin-dashboard', label: 'Dashboard', icono: '📈', acento: 'azul' },
    { key: 'pos', label: 'POS Vendedor', icono: '🧾', acento: 'violeta' },
    { key: 'caja', label: 'Caja / Cobros', icono: '💳', acento: 'celeste' },
    { key: 'historial-ventas', label: 'Historial de Ventas', icono: '🗂️', acento: 'gris' },
    { key: 'cxc', label: 'Cuentas por Cobrar', icono: '📒', acento: 'amarillo' },
    { key: 'fidelidad', label: 'Fidelidad', icono: '⭐', acento: 'amarillo' },
    { key: 'productos', label: 'Productos', icono: '🔩', acento: 'verde' },
    { key: 'clientes', label: 'Clientes', icono: '👥', acento: 'naranja' },
    { key: 'compras', label: 'Compras', icono: '🧮', acento: 'rojo' },
    { key: 'inventario', label: 'Inventario Sucursal', icono: '🏪', acento: 'violeta' },
    { key: 'maestros', label: 'Suc / Cat / Suplidor', icono: '🧱', acento: 'celeste' },
    { key: 'usuarios', label: 'Usuarios', icono: '🛡️', acento: 'morado' },
    { key: 'importador', label: 'Importar SQL', icono: '🧬', acento: 'gris' },
    { key: 'reportes', label: 'Reportes', icono: '📊', acento: 'azul' },
    { key: 'contabilidad', label: 'Contabilidad', icono: '🏦', acento: 'verde' },
  ],
};

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text() || 'Error de API');
  return res.json();
}

function Login({ onSuccess }: { onSuccess: (token: string, usuario: Usuario) => void }) {
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo iniciar sesión');
      onSuccess(data.token, data.usuario);
    } catch (err: any) { setError(err.message); }
  }
  return <div className="login-wrap"><form className="login-card" onSubmit={submit}><h1>Repuestos Calcaño</h1><label>Usuario</label><input value={username} onChange={(e) => setUsername(e.target.value)} /><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />{error && <div className="alert-error">{error}</div>}<button className="btn btn-primary">Iniciar sesión</button></form></div>;
}

function ReporteTabla({ filas }: { filas: any[] }) {
  if (!filas || filas.length === 0) return <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>Sin registros</p>;
  const cols = Object.keys(filas[0]);
  return (
    <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
      <table className="table-premium">
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c.replace(/_/g, ' ')}</th>)}</tr>
        </thead>
        <tbody>
          {filas.slice(0, 200).map((row, i) => (
            <tr key={i}>
              {cols.map((c) => <td key={c}>{row[c] !== null && row[c] !== undefined ? String(row[c]) : '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const REPORTE_LABELS: Record<string, string> = {
  'clientes': 'Clientes',
  'suplidores': 'Suplidores',
  'productos': 'Productos',
  'inventario-sucursal': 'Inventario Sucursal',
  'compras-por-suplidor': 'Compras por Suplidor',
  'compras-por-sucursal': 'Compras por Sucursal',
  'ventas-por-sucursal': 'Ventas por Sucursal',
  'cxc': 'Cuentas por Cobrar',
  'existencia-minima': 'Existencia Mínima',
  'base-606': 'Base 606',
};

const REPORTE_ICONS: Record<string, string> = {
  'clientes': '👥', 'suplidores': '🏭', 'productos': '🔩', 'inventario-sucursal': '🏪',
  'compras-por-suplidor': '🧮', 'compras-por-sucursal': '🧮', 'ventas-por-sucursal': '📈',
  'cxc': '📒', 'existencia-minima': '⚠️', 'base-606': '🗂️',
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('pos_token') ?? '');
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try { return JSON.parse(localStorage.getItem('pos_usuario') ?? 'null'); } catch { return null; }
  });
  const [modulo, setModulo] = useState(() => localStorage.getItem('pos_modulo') ?? 'pos');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [suplidores, setSuplidores] = useState<Suplidor[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [cxc, setCxc] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [reportes, setReportes] = useState<Record<string, any[]>>({});
  const [importJobs, setImportJobs] = useState<any[]>([]);
  const [importMeta, setImportMeta] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [jobSeleccionado, setJobSeleccionado] = useState('');
  const [sqlNombre, setSqlNombre] = useState('script.sql');
  const [sqlContenido, setSqlContenido] = useState('');
  const [sqlFile, setSqlFile] = useState<File | null>(null);
  const [subiendoSql, setSubiendoSql] = useState(false);
  const [uploadProgreso, setUploadProgreso] = useState(0);
  const [resultadoImport, setResultadoImport] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [cuadres, setCuadres] = useState<any[]>([]);
  const [ventasAll, setVentasAll] = useState<any[]>([]);
  const [historialVentas, setHistorialVentas] = useState<any[]>([]);
  const [adminResumen, setAdminResumen] = useState<any>({});
  const [tabContabilidad, setTabContabilidad] = useState<'cuadres'|'ventas'|'compras'>('cuadres');
  const [sucursalInvSeleccionada, setSucursalInvSeleccionada] = useState('');
  const [modalUsuario, setModalUsuario] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState<any>(null);
  const [reporteActivo, setReporteActivo] = useState('');
  const [clienteQuery, setClienteQuery] = useState('');
  const [productoInfoCard, setProductoInfoCard] = useState<any>(null);
  const [editandoProducto, setEditandoProducto] = useState<any>(null);
  const [modalProductoInv, setModalProductoInv] = useState(false);
  const [modalProductosPage, setModalProductosPage] = useState(false);
  const [quickAddCat, setQuickAddCat] = useState(false);
  const [quickAddSup, setQuickAddSup] = useState(false);
  const [nuevaCatInline, setNuevaCatInline] = useState({ codigo: '', nombre: '' });
  const [nuevoSupInline, setNuevoSupInline] = useState({ codigo: '', nombre_comercial: '', telefono: '' });
  const [imagenAddFile, setImagenAddFile] = useState<File | null>(null);
  const [imagenEditFile, setImagenEditFile] = useState<File | null>(null);
  const [imagenAddPreview, setImagenAddPreview] = useState('');
  const [imagenEditPreview, setImagenEditPreview] = useState('');

  const [modalCliente, setModalCliente] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<any>(null);
  const [posClienteNuevoModal, setPosClienteNuevoModal] = useState(false);
  const [posNuevoClienteNombre, setPosNuevoClienteNombre] = useState('');

  const [clienteId, setClienteId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [tipoVenta, setTipoVenta] = useState<'contado' | 'credito' | 'devolucion'>('contado');
  const [formaPago, setFormaPago] = useState('efectivo');
  const [buscarProducto, setBuscarProducto] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [clientesFidelidad, setClientesFidelidad] = useState<any[]>([]);
  const [modalFidelidad, setModalFidelidad] = useState(false);
  const [buscarClienteFidelidad, setBuscarClienteFidelidad] = useState('');
  const [clienteFidelidadSeleccionado, setClienteFidelidadSeleccionado] = useState<any>(null);
  const [creaClienteFidelidadNuevo, setCreaClienteFidelidadNuevo] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [ventaDevolucionBuscar, setVentaDevolucionBuscar] = useState('');
  const [ventaDevolucionSeleccionada, setVentaDevolucionSeleccionada] = useState<any>(null);
  const [itemsDevolucionSeleccionados, setItemsDevolucionSeleccionados] = useState<any[]>([]);
  const [ncCreada, setNcCreada] = useState<any>(null);
  const [notasCredito, setNotasCredito] = useState<any[]>([]);
  const [modalAplicarNC, setModalAplicarNC] = useState(false);
  const [codigoNC, setCodigoNC] = useState('');
  const [ncEncontrada, setNcEncontrada] = useState<any>(null);
  const [modalNcDiferencia, setModalNcDiferencia] = useState<any>(null);
  const [formaPagoComplementario, setFormaPagoComplementario] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cajaCobrarModal, setCajaCobrarModal] = useState<any>(null);
  const [cajaTipoPago, setCajaTipoPago] = useState('efectivo');
  const [cajaMontoRecibido, setCajaMontoRecibido] = useState('');

  const NUEVOCLUB_BLANK = { codigo: '', nombre: '', cedula_rnc: '', representante: '', direccion: '', correo: '', fecha_nacimiento: '', telefono_1: '', telefono_2: '', limite_credito: 0, limite_tiempo_dias: 30, tipo_cliente: '', estatus_credito: 'cerrado', porcentaje_descuento: 0, tipo_comprobante_fiscal: 'consumidor_final', en_programa_fidelidad: false };
  const [nuevoCliente, setNuevoCliente] = useState<any>(NUEVOCLUB_BLANK);
  const [nuevoProducto, setNuevoProducto] = useState<any>({ codigo: '', tipo: '', nombre: '', descripcion: '', marca: '', medida: '', costo: 0, lleva_itbis: true, margen: 0, precio: 0, itbis_porcentaje: 18, existencia_minima: 0, cantidad_a_ordenar: 0, ubicacion: '', categoria: '', codigo_barras: '', cuenta_contable: '', referencia: '', uso_notas: '', suplidor_principal_id: '', imagen_url: '' });
  const [nuevaCompra, setNuevaCompra] = useState<any>({ suplidor_id: '', sucursal_id: '', numero_factura: '', numero_ncf: '', fecha_factura: '', fecha_vencimiento: '', condicion_compra: 'contado', estado_pago: 'pendiente', observaciones: '', items: [] as any[] });
  const [itemCompra, setItemCompra] = useState<any>({ producto_id: '', cantidad: 1, costo_unitario: 0, itbis_tasa: 0.18, descuento_monto: 0 });
  const [modalCompra, setModalCompra] = useState(false);
  const [editandoSuplidor, setEditandoSuplidor] = useState<any>(null);
  const [cxcCobroModal, setCxcCobroModal] = useState<any>(null);
  const [cxcCobroMonto, setCxcCobroMonto] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState<any>({ username: '', nombre_completo: '', password: '1234', rol: 'vendedor', sucursal_id: '' });
  const [nuevoSuplidor, setNuevoSuplidor] = useState<any>({ codigo: '', nombre_comercial: '', razon_social: '', rnc_cedula: '', telefono: '', correo: '', direccion: '', contacto: '', observaciones: '' });
  const [nuevaCategoria, setNuevaCategoria] = useState<any>({ codigo: '', nombre: '', descripcion: '' });
  const [nuevaSucursal, setNuevaSucursal] = useState<any>({ codigo: '', nombre: '', direccion: '', telefono: '' });

  const toast = (tipo: 'ok' | 'error', texto: string) => { const id = Date.now(); setToasts((t) => [...t, { id, tipo, texto }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000); };

  async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function autoCodigoCliente(existentes: any[]): string {
    const nums = existentes
      .map((c) => { const m = String(c.codigo || '').match(/^CLI-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter((n) => n > 0);
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `CLI-${String(max + 1).padStart(4, '0')}`;
  }

  async function cargarTodo() {
    if (!token || !usuario) return;
    const [cs, ps, sucs, cats, sups, vnds, invCon] = await Promise.all([
      api<any[]>('/clientes', token).catch(() => []),
      api<any[]>('/productos', token).catch(() => []),
      api<any[]>('/maestros/sucursales', token).catch(() => []),
      api<any[]>('/maestros/categorias', token).catch(() => []),
      api<any[]>('/maestros/suplidores', token).catch(() => []),
      api<any[]>('/usuarios/vendedores', token).catch(() => []),
      api<any[]>('/maestros/inventario/consolidado', token).catch(() => []),
    ]);
    setClientes(cs); setProductos(ps); setSucursales(sucs); setCategorias(cats); setSuplidores(sups); setVendedores(vnds); setInventario(invCon);
    if (!sucursalId && sucs[0]) setSucursalId(sucs[0].id);
    const [pen, cx, kp, historial, adminRes, cf, ncs] = await Promise.all([
      api<any[]>('/ventas/pendientes', token).catch(() => []),
      api<any[]>('/cxc/pendientes', token).catch(() => []),
      api<any>('/dashboard/kpis', token).catch(() => ({})),
      api<any[]>('/ventas/historial', token).catch(() => []),
      api<any>('/dashboard/admin-resumen', token).catch(() => ({})),
      api<any[]>('/clientes/fidelidad/lista', token).catch(() => []),
      api<any[]>('/notas-credito', token).catch(() => []),
    ]);
    setPendientes(pen); setCxc(cx); setKpis(kp); setHistorialVentas(historial); setAdminResumen(adminRes); setClientesFidelidad(cf); setNotasCredito(ncs);
    if (usuario.rol === 'administrador') {
      const [cm, us, rs, ij, im, cua, va] = await Promise.all([api<any[]>('/compras', token).catch(() => []), api<any[]>('/usuarios', token).catch(() => []), api<any[]>('/usuarios/roles', token).catch(() => []), api<any[]>('/importador/jobs', token).catch(() => []), api<any>('/importador/meta', token).catch(() => null), api<any[]>('/cuadres', token).catch(() => []), api<any[]>('/ventas', token).catch(() => [])]);
      setCompras(cm); setUsuarios(us); setRoles(rs); setImportJobs(ij); setImportMeta(im); setCuadres(cua); setVentasAll(va);
      const keys = ['clientes', 'suplidores', 'productos', 'inventario-sucursal', 'compras-por-suplidor', 'compras-por-sucursal', 'ventas-por-sucursal', 'cxc', 'existencia-minima', 'base-606'];
      const out: Record<string, any[]> = {};
      await Promise.all(keys.map(async (k) => { out[k] = await api<any[]>(`/reportes/${k}`, token).catch(() => []); }));
      setReportes(out);
    }
  }

  useEffect(() => { cargarTodo().catch((e) => toast('error', e.message)); }, [token, usuario?.rol]);
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(WS_URL);
    ws.onmessage = () => { cargarTodo(); };
    return () => ws.close();
  }, [token]);

  useEffect(() => {
    if (buscarClienteFidelidad.length > 2 && !clienteFidelidadSeleccionado && !creaClienteFidelidadNuevo && modalFidelidad) {
      setCreaClienteFidelidadNuevo(true);
      setClienteFidelidadSeleccionado({
        codigo: autoCodigoCliente(clientes),
        nombre: buscarClienteFidelidad,
        cedula_rnc: '',
        representante: '',
        direccion: '',
        correo: '',
        fecha_nacimiento: '',
        telefono_1: '',
        telefono_2: '',
        limite_credito: 0,
        limite_tiempo_dias: 30,
        tipo_cliente: '',
        estatus_credito: 'cerrado',
        porcentaje_descuento: 0,
        tipo_comprobante_fiscal: 'consumidor_final',
        en_programa_fidelidad: true
      });
    }
  }, [buscarClienteFidelidad, clienteFidelidadSeleccionado, creaClienteFidelidadNuevo, modalFidelidad, clientes]);

  useEffect(() => {
    if (tipoVenta === 'devolucion' && !modalDevolucion) {
      setModalDevolucion(true);
    }
  }, [tipoVenta, modalDevolucion]);

  useEffect(() => {
    if (!token || modulo !== 'reportes') return;
    const t = setInterval(() => { cargarTodo(); }, 15000);
    return () => clearInterval(t);
  }, [token, modulo]);

  useEffect(() => {
    const onPop = () => {
      if (!usuario) return;
      const mod = moduloDesdeRuta(window.location.pathname);
      if (mod && usuario.rol === 'administrador') setModulo(mod);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [usuario]);

  const productosFiltrados = useMemo(() => {
    const q = buscarProducto.toLowerCase().trim();
    if (!q) return productos;
    return productos.filter((p) => `${p.codigo} ${p.nombre} ${p.descripcion ?? ''} ${p.codigo_barras ?? ''}`.toLowerCase().includes(q));
  }, [buscarProducto, productos]);

  const clientesFiltradosPOS = useMemo(() => {
    const q = clienteQuery.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter((c) =>
      c.nombre?.toLowerCase().includes(q) ||
      c.telefono_1?.toLowerCase().includes(q) ||
      c.telefono_2?.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q)
    );
  }, [clienteQuery, clientes]);

  const clienteSel = clientes.find((c) => c.id === clienteId);
  const subtotal = carrito.reduce((a, i) => a + Number(i.cantidad) * Number(i.precio_unitario), 0);
  const itbisTotal = carrito.reduce((a, i) => a + (Number(i.cantidad) * Number(i.precio_unitario) - Number(i.descuento_monto ?? 0)) * Number(i.itbis_tasa ?? 0), 0);
  const descuentoItems = carrito.reduce((a, i) => a + Number(i.descuento_monto ?? 0), 0);
  const descuentoGlobalMonto = descuentoGlobal > 0 ? (subtotal + itbisTotal - descuentoItems) * (descuentoGlobal / 100) : 0;
  const descuentoTotal = descuentoItems + descuentoGlobalMonto;
  const total = subtotal + itbisTotal - descuentoTotal;

  function aplicarDescuentoGlobal(pct: number) {
    setDescuentoGlobal((prev) => prev === pct ? 0 : pct);
  }

  function agregarProducto(p: any) {
    setProductoInfoCard(p);
    setCarrito((prev) => {
      const x = prev.find((i) => i.producto_id === p.id);
      if (x) return prev.map((i) => i.producto_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto_id: p.id, codigo_producto: p.codigo, descripcion: p.nombre, medida: p.medida, cantidad: 1, precio_unitario: Number(p.precio), itbis_tasa: Number(p.itbis_tasa ?? 0), descuento_monto: 0, imagen_url: p.imagen_url }];
    });
  }

  async function crearCliente() {
    const codigo = nuevoCliente.codigo || autoCodigoCliente(clientes);
    await api('/clientes', token, { method: 'POST', body: JSON.stringify({ ...nuevoCliente, codigo, estatus_credito: nuevoCliente.estatus_credito || 'cerrado' }) });
    toast('ok', 'Cliente creado');
    setNuevoCliente(NUEVOCLUB_BLANK);
    setModalCliente(false);
    await cargarTodo();
  }

  async function crearClienteRapido(nombre: string, telefono: string) {
    const codigo = autoCodigoCliente(clientes);
    const res = await api<any>('/clientes', token, { method: 'POST', body: JSON.stringify({ codigo, nombre, telefono_1: telefono, estatus_credito: 'cerrado', tipo_comprobante_fiscal: 'consumidor_final', limite_credito: 0 }) });
    toast('ok', `Cliente "${nombre}" registrado (${codigo})`);
    await cargarTodo();
    return res;
  }

  async function editarCliente() {
    if (!editandoCliente) return;
    await api(`/clientes/${editandoCliente.id}`, token, { method: 'PUT', body: JSON.stringify(editandoCliente) });
    toast('ok', 'Cliente actualizado');
    setEditandoCliente(null);
    await cargarTodo();
  }

  async function toggleCreditoCliente(c: any) {
    const nuevo = c.estatus_credito === 'abierto' ? 'cerrado' : 'abierto';
    await api(`/clientes/${c.id}`, token, { method: 'PUT', body: JSON.stringify({ ...c, estatus_credito: nuevo }) });
    toast('ok', `Crédito ${nuevo} para ${c.nombre}`);
    await cargarTodo();
  }

  async function crearProducto() {
    let imgUrl = '';
    if (imagenAddFile) { imgUrl = await subirImagenProducto(imagenAddFile); setImagenAddFile(null); setImagenAddPreview(''); }
    await api('/productos', token, { method: 'POST', body: JSON.stringify({ ...nuevoProducto, imagen_url: imgUrl, itbis_tasa: Number(nuevoProducto.itbis_porcentaje || 0) / 100 }) });
    toast('ok', 'Producto creado');
    await cargarTodo();
  }

  async function crearCompra() { await api('/compras', token, { method: 'POST', body: JSON.stringify(nuevaCompra) }); toast('ok', 'Compra registrada'); setNuevaCompra({ suplidor_id: '', sucursal_id: sucursalId, numero_factura: '', numero_ncf: '', fecha_factura: '', fecha_vencimiento: '', condicion_compra: 'contado', estado_pago: 'pendiente', observaciones: '', items: [] }); await cargarTodo(); }
  async function crearUsuario() { await api('/usuarios', token, { method: 'POST', body: JSON.stringify(nuevoUsuario) }); toast('ok', 'Usuario creado'); await cargarTodo(); }
  async function actualizarUsuario() {
    if (!editandoUsuario) return;
    await api(`/usuarios/${editandoUsuario.id}`, token, { method: 'PUT', body: JSON.stringify(editandoUsuario) });
    toast('ok', 'Usuario actualizado');
    setEditandoUsuario(null);
    await cargarTodo();
  }
  async function crearSucursal() { await api('/maestros/sucursales', token, { method: 'POST', body: JSON.stringify(nuevaSucursal) }); toast('ok', 'Sucursal creada'); await cargarTodo(); }
  async function crearCategoria() { await api('/maestros/categorias', token, { method: 'POST', body: JSON.stringify(nuevaCategoria) }); toast('ok', 'Categoría creada'); await cargarTodo(); }
  async function crearSuplidor() { await api('/maestros/suplidores', token, { method: 'POST', body: JSON.stringify(nuevoSuplidor) }); toast('ok', 'Suplidor creado'); await cargarTodo(); }
  async function editarSuplidor() {
    if (!editandoSuplidor) return;
    await api(`/maestros/suplidores/${editandoSuplidor.id}`, token, { method: 'PUT', body: JSON.stringify(editandoSuplidor) });
    toast('ok', 'Suplidor actualizado');
    setEditandoSuplidor(null);
    await cargarTodo();
  }
  async function eliminarSuplidor(id: string) {
    if (!confirm('¿Inactivar este suplidor?')) return;
    await api(`/maestros/suplidores/${id}`, token, { method: 'DELETE' });
    toast('ok', 'Suplidor eliminado');
    await cargarTodo();
  }

  async function crearCategoriaInline() {
    if (!nuevaCatInline.nombre) return;
    const r: any = await api('/maestros/categorias', token, { method: 'POST', body: JSON.stringify({ ...nuevaCatInline, estado: 'activa' }) });
    toast('ok', 'Categoría creada');
    setNuevaCatInline({ codigo: '', nombre: '' });
    setQuickAddCat(false);
    await cargarTodo();
    return r?.id;
  }

  async function crearSuplidorInline() {
    if (!nuevoSupInline.nombre_comercial) return;
    const r: any = await api('/maestros/suplidores', token, { method: 'POST', body: JSON.stringify({ ...nuevoSupInline, estado: 'activo' }) });
    toast('ok', 'Suplidor creado');
    setNuevoSupInline({ codigo: '', nombre_comercial: '', telefono: '' });
    setQuickAddSup(false);
    await cargarTodo();
    return r?.id;
  }

  async function subirImagenProducto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('imagen', file);
    const res = await fetch(`${API}/uploads/producto-imagen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Error al subir imagen');
    const data = await res.json();
    return data.url as string;
  }

  async function editarProductoGuardar() {
    if (!editandoProducto) return;
    let imgUrl = editandoProducto.imagen_url ?? '';
    if (imagenEditFile) {
      imgUrl = await subirImagenProducto(imagenEditFile);
      setImagenEditFile(null);
      setImagenEditPreview('');
    }
    await api(`/productos/${editandoProducto.id}`, token, { method: 'PUT', body: JSON.stringify({ ...editandoProducto, imagen_url: imgUrl, itbis_tasa: Number(editandoProducto.itbis_porcentaje || 0) / 100 }) });
    toast('ok', 'Producto actualizado');
    setEditandoProducto(null);
    await cargarTodo();
  }

  async function eliminarProducto(id: string) {
    if (!confirm('¿Desea inactivar este producto?')) return;
    await api(`/productos/${id}`, token, { method: 'DELETE' });
    toast('ok', 'Producto inactivado');
    await cargarTodo();
  }

  async function subirPorChunksYAnalizar(file: File) {
    const chunkSize = 5 * 1024 * 1024;
    const maxReintentos = 3;
    setSubiendoSql(true);
    setUploadProgreso(0);
    try {
      const init = await api<any>('/importador/upload/init', token, { method: 'POST', body: JSON.stringify({ nombre_archivo: file.name, size_bytes: file.size }) });
      const uploadId = init.upload_id as string;
      const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        const buf = await chunk.arrayBuffer();
        const bin = new Uint8Array(buf);
        let raw = '';
        for (let j = 0; j < bin.length; j++) raw += String.fromCharCode(bin[j]);
        const chunkBase64 = btoa(raw);
        let ultimoError: any = null;
        for (let intento = 0; intento < maxReintentos; intento++) {
          try {
            await api(`/importador/upload/${uploadId}/chunk`, token, { method: 'POST', body: JSON.stringify({ chunk_base64: chunkBase64, final: i === totalChunks - 1 }) });
            ultimoError = null;
            break;
          } catch (err: any) {
            ultimoError = err;
            await new Promise((r) => setTimeout(r, 250 * (intento + 1)));
          }
        }
        if (ultimoError) throw ultimoError;
        setUploadProgreso(Math.round(((i + 1) / totalChunks) * 100));
      }
      return api<any>(`/importador/upload/${uploadId}/analizar`, token, { method: 'POST' });
    } finally {
      setSubiendoSql(false);
    }
  }

  async function analizarSqlLegado() {
    let r: any;
    if (sqlFile) {
      r = await subirPorChunksYAnalizar(sqlFile);
    } else {
      r = await api<any>('/importador/analizar', token, { method: 'POST', body: JSON.stringify({ nombre_archivo: sqlNombre, contenido_sql: sqlContenido }) });
    }
    toast('ok', 'SQL legado analizado');
    setJobSeleccionado(r.job_id);
    await cargarTodo();
    await verPreviewJob(r.job_id);
  }

  async function verPreviewJob(jobId: string) {
    const p = await api<any>(`/importador/jobs/${jobId}/preview`, token);
    setImportPreview(p);
  }

  async function ejecutarImport(jobId: string, dryRun: boolean, modulos = ['all']) {
    const r = await api<any>(`/importador/jobs/${jobId}/importar`, token, { method: 'POST', body: JSON.stringify({ dry_run: dryRun, modulos, estrategia_relaciones: 'placeholder' }) });
    setResultadoImport(r);
    toast('ok', dryRun ? 'Dry run completado' : 'Importación completada');
    await cargarTodo();
    await verPreviewJob(jobId);
  }

  async function confirmarJob(jobId: string) {
    await api(`/importador/jobs/${jobId}/confirmar`, token, { method: 'POST' });
    toast('ok', 'Importación confirmada');
    await cargarTodo();
  }

  async function deshacerJob(jobId: string) {
    await api(`/importador/jobs/${jobId}/undo`, token, { method: 'POST' });
    toast('ok', 'Última importación deshecha');
    await cargarTodo();
    await verPreviewJob(jobId);
  }

  async function descargarLog(jobId: string) {
    const res = await fetch(`${API}/importador/jobs/${jobId}/logs`, { headers: { Authorization: `Bearer ${token}` } });
    const txt = await res.text();
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `import-log-${jobId}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function imprimirNC(nc: any) {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    const fecha = new Date(nc.fecha_creacion).toLocaleDateString('es-DO');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Nota de Crédito ${nc.numero}</title>
    <style>body{font-family:monospace;font-size:13px;margin:20px;}h2{text-align:center;}table{width:100%;border-collapse:collapse;}td{padding:4px;}hr{border:1px dashed #000;}.right{text-align:right;}.center{text-align:center;}.big{font-size:18px;font-weight:bold;}</style>
    </head><body>
    <h2>REPUESTOS CALCAÑO</h2>
    <div class="center"><span class="big">NOTA DE CRÉDITO</span></div>
    <hr/>
    <div><strong>No:</strong> ${nc.numero}</div>
    <div><strong>Cliente:</strong> ${nc.cliente_nombre || ''}</div>
    <div><strong>Fecha:</strong> ${fecha}</div>
    <div><strong>Estado:</strong> ${nc.estado?.toUpperCase()}</div>
    <hr/>
    <table>
      <tr><td>Monto original:</td><td class="right">RD$ ${Number(nc.monto_original).toFixed(2)}</td></tr>
      <tr><td><strong>Saldo disponible:</strong></td><td class="right"><strong>RD$ ${Number(nc.monto_restante).toFixed(2)}</strong></td></tr>
    </table>
    <hr/>
    <div class="center">Este documento es válido como crédito en compras futuras.<br/>Presente el código: <strong>${nc.numero}</strong></div>
    </body></html>`);
    win.document.close();
    win.print();
  }

  async function enviarVenta() {
    if (!clienteId || !sucursalId || !vendedorId) return toast('error', 'Cliente, sucursal y vendedor son obligatorios');
    if (formaPago === 'nota_credito' && !ncEncontrada) {
      toast('error', 'Selecciona una Nota de Crédito válida');
      setModalAplicarNC(true);
      return;
    }
    const carritoFinal = carrito.map((i) => {
      const descItem = Number(i.descuento_monto ?? 0);
      const base = Number(i.cantidad) * Number(i.precio_unitario);
      const descGlob = descuentoGlobal > 0 ? base * (descuentoGlobal / 100) : 0;
      return { ...i, descuento_monto: descItem + descGlob };
    });
    const payload = { cliente_id: clienteId, sucursal_id: sucursalId, vendedor_id: vendedorId, tipo_venta: tipoVenta, forma_pago: formaPago, items: carritoFinal, tipo_comprobante: clienteSel?.tipo_comprobante_fiscal, nota_credito_codigo: ncEncontrada?.numero };
    const v = await api<any>('/ventas', token, { method: 'POST', body: JSON.stringify(payload) });
    if (tipoVenta === 'contado') await api(`/ventas/${v.id}/enviar-cajero`, token, { method: 'POST' });

    if (formaPago === 'nota_credito' && ncEncontrada) {
      const totalFinal = carritoFinal.reduce((a: number, i: any) => {
        const base = Number(i.cantidad) * Number(i.precio_unitario);
        const desc = Number(i.descuento_monto ?? 0);
        return a + base + (base - desc) * Number(i.itbis_tasa ?? 0.18) - desc;
      }, 0);
      const resultado = await api<any>('/notas-credito/aplicar', token, {
        method: 'POST',
        body: JSON.stringify({ codigo_nc: ncEncontrada.numero, total_compra: totalFinal, cliente_id: clienteId }),
      }).catch(() => null);
      if (resultado) {
        if (resultado.resultado === 'insuficiente') {
          setModalNcDiferencia({ diferencia: resultado.diferencia_pagar, monto_nc: resultado.monto_aplicado, venta_id: v.id });
        } else if (resultado.nueva_nc) {
          toast('ok', `✅ Venta registrada. Nueva NC emitida: ${resultado.nueva_nc.numero} con saldo RD$ ${Number(resultado.saldo_restante).toFixed(2)}`);
          setTimeout(() => imprimirNC(resultado.nueva_nc), 500);
        } else {
          toast('ok', '✅ Nota de Crédito utilizada completamente');
        }
        setNcEncontrada(null);
        await cargarTodo();
      }
    } else {
      toast('ok', tipoVenta === 'contado' ? 'Venta enviada a caja' : 'Venta a crédito registrada');
    }
    setCarrito([]); setDescuentoGlobal(0); setClienteId(''); setClienteQuery(''); setFormaPago('efectivo'); await cargarTodo();
  }

  async function tomarVentaCaja(id: string) {
    await api(`/ventas/${id}/tomar-en-caja`, token, { method: 'POST' });
    toast('ok', 'Venta tomada en caja');
    await cargarTodo();
  }

  function cobrarVentaCaja(v: any) {
    setCajaCobrarModal(v);
    setCajaTipoPago('efectivo');
    setCajaMontoRecibido('');
  }

  async function cobrarCuentaCxC(cuenta: any) {
    const totalPendiente = Number(cuenta.balance_pendiente ?? 0);
    if (totalPendiente <= 0) return;
    setCxcCobroModal(cuenta);
    setCxcCobroMonto(totalPendiente.toFixed(2));
  }

  async function confirmarCobroCxC() {
    const cuenta = cxcCobroModal;
    if (!cuenta) return;
    const totalPendiente = Number(cuenta.balance_pendiente ?? 0);
    const total = Number(cxcCobroMonto);
    if (!Number.isFinite(total) || total <= 0 || total - totalPendiente > 0.0001) return toast('error', 'Monto inválido');
    await api(`/cxc/${cuenta.id}/cobrar`, token, {
      method: 'POST',
      body: JSON.stringify({
        tipo_pago: 'efectivo',
        monto_efectivo: total,
        monto_tarjeta: 0,
        monto_transferencia: 0,
        monto_recibido: total,
      }),
    });
    toast('ok', total < totalPendiente ? `Abono aplicado a ${cuenta.numero_interno}` : `Cobro aplicado a ${cuenta.numero_interno}`);
    setCxcCobroModal(null);
    setCxcCobroMonto('');
    await cargarTodo();
  }

  function exportarReportePdf() {
    if (!reporteActivo || !reportes[reporteActivo]) return;
    const titulo = REPORTE_LABELS[reporteActivo] ?? reporteActivo;
    const rows = reportes[reporteActivo];
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${titulo}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#0f172a} h1{margin:0 0 6px} p{color:#475569}
      table{width:100%;border-collapse:collapse;margin-top:14px} th,td{border:1px solid #cbd5e1;padding:8px;font-size:12px;text-align:left}
      th{background:#e2e8f0} tr:nth-child(even){background:#f8fafc}
    </style></head><body>`);
    w.document.write(`<h1>${titulo}</h1><p>Generado: ${new Date().toLocaleString()}</p>`);
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]);
      w.document.write('<table><thead><tr>' + cols.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>');
      rows.forEach((r: any) => w!.document.write('<tr>' + cols.map((c) => `<td>${r[c] ?? ''}</td>`).join('') + '</tr>'));
      w.document.write('</tbody></table>');
    }
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
  }

  function cerrarSesion() {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_usuario');
    localStorage.removeItem('pos_modulo');
    setToken('');
    setUsuario(null);
    setModulo('pos');
  }

  if (!usuario) return <Login onSuccess={(t, u) => {
    setToken(t);
    setUsuario(u);
    localStorage.setItem('pos_token', t);
    localStorage.setItem('pos_usuario', JSON.stringify(u));
    const modRuta = moduloDesdeRuta(window.location.pathname);
    const modInicial = u.rol === 'administrador' ? (modRuta ?? 'admin-dashboard') : 'pos';
    setModulo(modInicial);
    localStorage.setItem('pos_modulo', modInicial);
    setVendedorId(u.id);
    if (u.sucursal_id) setSucursalId(u.sucursal_id);
  }} />;

  function cambiarModuloConRuta(key: string) {
    setModulo(key);
    localStorage.setItem('pos_modulo', key);
    const ruta = rutaDesdeModulo(key, usuario.rol);
    window.history.pushState({}, '', ruta);
  }

  const menu = menuPorRol[usuario.rol] ?? [];
  const kpiCards = [{ titulo: 'Pendientes', valor: String(kpis.ventas_pendientes ?? 0), subtitulo: 'Ventas en cola', tono: 'azul' as const }, { titulo: 'Caja esperada', valor: `RD$ ${Number(kpis.caja_esperada ?? 0).toFixed(2)}`, subtitulo: 'Efectivo proyectado', tono: 'verde' as const }, { titulo: 'Crédito', valor: `RD$ ${Number(kpis.ventas_credito ?? 0).toFixed(2)}`, subtitulo: 'Ventas crédito', tono: 'rojo' as const }, { titulo: 'Cobros', valor: `${Number(kpis.cobros_cantidad ?? 0)}`, subtitulo: `RD$ ${Number(kpis.cobros_total ?? 0).toFixed(2)}`, tono: 'gris' as const }, { titulo: 'Beneficio', valor: `RD$ ${Number(kpis.beneficio_neto ?? 0).toFixed(2)}`, subtitulo: 'Ganancia neta', tono: 'azul' as const }];

  const imgSrc = (url: string) => url ? (url.startsWith('http') ? url : url) : '';

  const formProductoFields = (data: any, onChange: (k: string, v: any) => void) => (
    <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      <div><label>Código *</label><input placeholder="Ej: P-001" value={data.codigo || ''} onChange={(e) => onChange('codigo', e.target.value)} /></div>
      <div><label>Descripción / Nombre *</label><input placeholder="Nombre del producto" value={data.nombre || ''} onChange={(e) => onChange('nombre', e.target.value)} /></div>
      <div><label>Tipo</label><input placeholder="Repuesto, accesorio, líquido..." value={data.tipo || ''} onChange={(e) => onChange('tipo', e.target.value)} /></div>
      <div><label>Marca</label><input placeholder="Ej: NGK, Bosch, ACDelco" value={data.marca || ''} onChange={(e) => onChange('marca', e.target.value)} /></div>
      <div><label>Medida / Unidad</label><input placeholder="UND, KG, M, L..." value={data.medida || ''} onChange={(e) => onChange('medida', e.target.value)} /></div>
      <div><label>Ubicación en almacén</label><input placeholder="Ej: Estante A-3, Pasillo 2" value={data.ubicacion || ''} onChange={(e) => onChange('ubicacion', e.target.value)} /></div>
      <div><label>Costo de compra (RD$)</label><input type="number" placeholder="0.00" value={data.costo || 0} onChange={(e) => onChange('costo', Number(e.target.value))} /></div>
      <div><label>Precio de venta (RD$) *</label><input type="number" placeholder="0.00" value={data.precio || 0} onChange={(e) => onChange('precio', Number(e.target.value))} /></div>
      <div><label>% ITBIS (0 si exento)</label><input type="number" placeholder="18" value={data.itbis_porcentaje ?? 18} onChange={(e) => onChange('itbis_porcentaje', Number(e.target.value))} /></div>
      <div><label>Código de barras</label><input placeholder="Ej: 7896543210123" value={data.codigo_barras || ''} onChange={(e) => onChange('codigo_barras', e.target.value)} /></div>
      <div><label>Existencia mínima</label><input type="number" placeholder="Cantidad mínima para alerta" value={data.existencia_minima || 0} onChange={(e) => onChange('existencia_minima', Number(e.target.value))} /></div>
      <div><label>Referencia / Número OEM</label><input placeholder="Ej: REF-12345" value={data.referencia || ''} onChange={(e) => onChange('referencia', e.target.value)} /></div>
      <div>
        <div className="field-with-add">
          <label>Categoría</label>
          <button className="btn-inline-add" onClick={() => setQuickAddCat(!quickAddCat)} title="Agregar categoría">+ Nueva</button>
        </div>
        <select value={data.categoria || ''} onChange={(e) => onChange('categoria', e.target.value)}>
          <option value="">Sin categoría</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        {quickAddCat && (
          <div className="quick-add-inline">
            <input placeholder="Código (ej: MOT)" value={nuevaCatInline.codigo} onChange={(e) => setNuevaCatInline((s) => ({ ...s, codigo: e.target.value }))} />
            <input placeholder="Nombre de categoría *" value={nuevaCatInline.nombre} onChange={(e) => setNuevaCatInline((s) => ({ ...s, nombre: e.target.value }))} />
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => crearCategoriaInline().catch((e) => toast('error', e.message))}>Crear</button>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => setQuickAddCat(false)}>✕</button>
          </div>
        )}
      </div>
      <div>
        <div className="field-with-add">
          <label>Suplidor principal</label>
          <button className="btn-inline-add" onClick={() => setQuickAddSup(!quickAddSup)} title="Agregar suplidor">+ Nuevo</button>
        </div>
        <select value={data.suplidor_principal_id || ''} onChange={(e) => onChange('suplidor_principal_id', e.target.value)}>
          <option value="">Sin suplidor</option>
          {suplidores.map((s) => <option key={s.id} value={s.id}>{s.nombre_comercial}</option>)}
        </select>
        {quickAddSup && (
          <div className="quick-add-inline">
            <input placeholder="Código (ej: SUP-006)" value={nuevoSupInline.codigo} onChange={(e) => setNuevoSupInline((s) => ({ ...s, codigo: e.target.value }))} />
            <input placeholder="Nombre comercial *" value={nuevoSupInline.nombre_comercial} onChange={(e) => setNuevoSupInline((s) => ({ ...s, nombre_comercial: e.target.value }))} />
            <input placeholder="Teléfono" value={nuevoSupInline.telefono} onChange={(e) => setNuevoSupInline((s) => ({ ...s, telefono: e.target.value }))} />
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => crearSuplidorInline().catch((e) => toast('error', e.message))}>Crear</button>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => setQuickAddSup(false)}>✕</button>
          </div>
        )}
      </div>
      <div><label>Uso / Notas</label><input placeholder="Notas adicionales del producto" value={data.uso_notas || ''} onChange={(e) => onChange('uso_notas', e.target.value)} /></div>
    </div>
  );

  return <>
    <Layout usuario={usuario} moduloActivo={modulo} onCambiarModulo={cambiarModuloConRuta} onCerrarSesion={cerrarSesion} menu={menu} tituloModulo={menu.find((m) => m.key === modulo)?.label ?? 'POS'} esDashboard={modulo === 'admin-dashboard'} kpis={modulo === 'admin-dashboard' && usuario.rol === 'administrador' ? kpiCards : []}>

      {modulo === 'pos' && <div className="panel-grid">
        <article className="panel-card span-8">
          <h3>Punto de venta</h3>
          <div className="pos-topbar">
            <div className="pos-field">
              <label>Tipo</label>
              <select value={tipoVenta} onChange={(e) => setTipoVenta(e.target.value as any)}>
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="devolucion">Devolución</option>
              </select>
            </div>
            <div className="pos-field">
              <label>Vendedor</label>
              <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre_completo}</option>)}
              </select>
            </div>
            <div className="pos-field pos-cliente" style={{ flex: 2 }}>
              <label>Cliente — buscar por nombre o teléfono</label>
              <div style={{ position: 'relative', display: 'flex', gap: 6 }}>
                <input
                  list="clientes-options"
                  placeholder="Ej: Juan Pérez o 809-555-..."
                  value={clienteQuery}
                  style={{ flex: 1 }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClienteQuery(val);
                    const match = clientes.find((c) =>
                      `${c.codigo} - ${c.nombre}` === val ||
                      c.nombre?.toLowerCase() === val.toLowerCase() ||
                      c.telefono_1 === val
                    );
                    setClienteId(match?.id ?? '');
                  }}
                />
                <datalist id="clientes-options">
                  {clientesFiltradosPOS.slice(0, 40).map((c) => (
                    <option key={c.id} value={`${c.codigo} - ${c.nombre}`}>{c.telefono_1 ? `Tel: ${c.telefono_1}` : ''}</option>
                  ))}
                </datalist>
                <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => { setPosClienteNuevoModal(true); setPosNuevoClienteNombre(''); }}>+ Nuevo</button>
                {usuario.puede_agregar_fidelidad ? (
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12, whiteSpace: 'nowrap', color: 'var(--amarillo-600, #b45309)', borderColor: 'var(--amarillo-600, #b45309)' }} onClick={() => { setNuevoCliente({ ...NUEVOCLUB_BLANK, codigo: autoCodigoCliente(clientes), en_programa_fidelidad: true }); setModalCliente(true); cambiarModuloConRuta('clientes'); }}>⭐ Fidelidad</button>
                ) : null}
              </div>
            </div>
            <div className="pos-field">
              <label>Forma de pago</label>
              <select value={formaPago} onChange={(e) => {
                const v = e.target.value;
                setFormaPago(v);
                if (v === 'nota_credito') {
                  setCodigoNC('');
                  setNcEncontrada(null);
                  setModalAplicarNC(true);
                }
              }}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mixto">Mixto</option>
                <option value="nota_credito">📄 Nota de Crédito</option>
              </select>
            </div>
          </div>

          {clienteSel && (
            <div className="cliente-info-bar">
              <strong>{clienteSel.nombre}</strong>
              <span>Cédula/RNC: {clienteSel.cedula_rnc || '-'}</span>
              <span>Tel: {clienteSel.telefono_1 || '-'}</span>
              <span style={{ color: clienteSel.estatus_credito === 'abierto' ? 'var(--success)' : 'var(--muted)' }}>
                Crédito: {clienteSel.estatus_credito === 'abierto' ? '✓ Abierto' : '✗ Cerrado'} / RD$ {Number(clienteSel.limite_credito || 0).toFixed(2)}
              </span>
              {clienteSel.en_programa_fidelidad ? (
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700, border: '1px solid #fde68a' }}>
                  ⭐ Miembro Fidelidad — {(clientesFidelidad.find((f: any) => f.id === clienteSel.id)?.puntos_disponibles ?? 0).toLocaleString()} pts disponibles
                </span>
              ) : null}
            </div>
          )}

          <input className="pos-buscar" placeholder="🔍 Buscar producto por código, nombre o código de barras..." value={buscarProducto} onChange={(e) => setBuscarProducto(e.target.value)} />

          {productoInfoCard && (
            <div className="producto-info-card">
              <button className="btn-close-info" onClick={() => setProductoInfoCard(null)}>✕</button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {productoInfoCard.imagen_url
                  ? <img src={imgSrc(productoInfoCard.imagen_url)} alt={productoInfoCard.nombre} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e0e0e0' }} />
                  : <div style={{ width: 64, height: 64, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#999', textAlign: 'center' }}>Sin imagen</div>}
                <div>
                  <strong>{productoInfoCard.nombre}</strong>
                  <div className="producto-info-detalles" style={{ marginTop: 4 }}>
                    <span>📍 Ubicación: <strong>{productoInfoCard.ubicacion || 'Sin ubicación'}</strong></span>
                    <span>📦 Existencia: <strong>{Number(productoInfoCard.existencia || 0).toFixed(2)}</strong></span>
                    <span>💰 Precio: <strong>RD$ {Number(productoInfoCard.precio).toFixed(2)}</strong></span>
                    <span>📐 Medida: <strong>{productoInfoCard.medida || 'UND'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="product-grid">
            {productosFiltrados.slice(0, 18).map((p) => (
              <button key={p.id} className="product-pill" onClick={() => agregarProducto(p)}>
                {p.imagen_url
                  ? <img src={imgSrc(p.imagen_url)} alt={p.nombre} style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} />
                  : <div style={{ width: '100%', height: 56, background: '#f0f0f0', borderRadius: 6, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#999' }}>Sin imagen</div>}
                <strong style={{ fontSize: 11 }}>{p.codigo}</strong>
                <span style={{ fontSize: 12, lineHeight: 1.2 }}>{p.nombre}</span>
                <small>Stock: {Number(p.existencia || 0).toFixed(0)} · RD$ {Number(p.precio).toFixed(2)}</small>
              </button>
            ))}
          </div>

        </article>

        <article className="panel-card span-4">
          <h3>🛒 Resumen de compra</h3>
          
          {carrito.length > 0 && (
            <div style={{ marginBottom: 14, borderBottom: '1px solid #edf0f6', paddingBottom: 12 }}>
              <div style={{ overflowY: 'auto', maxHeight: 160, marginBottom: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {carrito.map((i, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 4px', width: '32px' }}>
                          {i.imagen_url
                            ? <img src={imgSrc(i.imagen_url)} alt={i.descripcion} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 3 }} />
                            : <div style={{ width: 24, height: 24, background: '#f0f0f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#999' }}>S/I</div>}
                        </td>
                        <td style={{ padding: '6px 4px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>{i.descripcion}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', minWidth: '30px' }}>{i.cantidad}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', minWidth: '50px', fontWeight: 700 }}>RD$ {(Number(i.cantidad) * Number(i.precio_unitario) * (1 + Number(i.itbis_tasa))).toFixed(2)}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', minWidth: '24px' }}><button className="btn btn-ghost" style={{ padding: '2px 4px', fontSize: 10 }} onClick={() => setCarrito((c) => c.filter((_, j) => j !== idx))}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usuario.rol === 'al_por_mayor' && (
                <div style={{ fontSize: 11, color: 'var(--muted)', padding: '6px 0', borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6 }}>
                  📝 Al por mayor: puedes editar precios y descuentos haciendo clic en la tabla superior
                </div>
              )}
            </div>
          )}
          
          {carrito.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--muted)', fontSize: 13 }}>
              El carrito está vacío — selecciona productos arriba
            </div>
          )}
          <div className="money-line"><span>Subtotal</span><strong>RD$ {subtotal.toFixed(2)}</strong></div>
          <div className="money-line"><span>ITBIS</span><strong>RD$ {itbisTotal.toFixed(2)}</strong></div>
          <div className="money-line"><span>Descuento</span><strong style={{ color: descuentoTotal > 0 ? 'var(--success)' : undefined }}>- RD$ {descuentoTotal.toFixed(2)}</strong></div>
          <div className="money-line total"><span>Total</span><strong>RD$ {total.toFixed(2)}</strong></div>
          {formaPago === 'nota_credito' && ncEncontrada && (() => {
            const montoNC = Math.min(Number(ncEncontrada.monto_restante), total);
            const pendiente = Math.max(0, total - montoNC);
            return (
              <>
                <div className="money-line" style={{ borderTop: '1px dashed #86efac', paddingTop: 6, marginTop: 2 }}>
                  <span style={{ color: '#15803d' }}>📄 NC {ncEncontrada.numero}</span>
                  <strong style={{ color: '#15803d' }}>- RD$ {montoNC.toFixed(2)}</strong>
                </div>
                <div className="money-line" style={{ fontWeight: 700 }}>
                  <span>{pendiente > 0 ? 'Pendiente a pagar' : '✅ Cubierto por NC'}</span>
                  <strong style={{ color: pendiente > 0 ? '#dc2626' : '#15803d', fontSize: 16 }}>
                    RD$ {pendiente.toFixed(2)}
                  </strong>
                </div>
              </>
            );
          })()}
          <div className="money-line"><span>Balance pendiente</span><strong>RD$ {tipoVenta === 'credito' ? total.toFixed(2) : '0.00'}</strong></div>
          <div className="money-line"><span>Estado</span><strong>{tipoVenta === 'credito' ? 'Crédito' : 'Contado'}</strong></div>

          {(formaPago === 'efectivo' || formaPago === 'mixto') && tipoVenta === 'contado' && (() => {
            const totalCobrar = formaPago === 'nota_credito' && ncEncontrada
              ? Math.max(0, total - Math.min(Number(ncEncontrada.monto_restante), total))
              : total;
            const recibNum = parseFloat(montoRecibido) || 0;
            const vuelto = recibNum > 0 ? Math.max(0, recibNum - totalCobrar) : 0;
            return (
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 10, marginTop: 6 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--muted)' }}>
                  💵 Monto recibido en efectivo:
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder={`Mín. ${totalCobrar.toFixed(2)}`}
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  style={{ width: '100%', fontSize: 16, fontWeight: 700, textAlign: 'right', padding: '6px 8px' }}
                />
                {vuelto > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '6px 12px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>💵 Vuelto:</span>
                    <strong style={{ color: '#15803d', fontSize: 18 }}>RD$ {vuelto.toFixed(2)}</strong>
                  </div>
                )}
                {recibNum > 0 && recibNum < totalCobrar && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', marginTop: 6, color: '#dc2626', fontSize: 12 }}>
                    ⚠️ Monto insuficiente — faltan RD$ {(totalCobrar - recibNum).toFixed(2)}
                  </div>
                )}
              </div>
            );
          })()}

          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <small style={{ color: 'var(--muted)' }}>Descuento rápido:</small>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button className={`btn ${descuentoGlobal === 5 ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => aplicarDescuentoGlobal(5)}>5%</button>
              <button className={`btn ${descuentoGlobal === 8 ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => aplicarDescuentoGlobal(8)}>8%</button>
              {descuentoGlobal > 0 && <button className="btn btn-ghost" style={{ flex: 1, color: 'var(--rojo-600)' }} onClick={() => setDescuentoGlobal(0)}>Quitar</button>}
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={() => enviarVenta().catch((e) => toast('error', e.message))}>
            {usuario.rol === 'vendedor' ? '📤 Enviar a Caja' : '✅ Registrar Venta'}
          </button>
          {carrito.length > 0 && (
            <button className="btn btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => { setCarrito([]); setProductoInfoCard(null); setDescuentoGlobal(0); }}>
              🗑 Vaciar carrito
            </button>
          )}
        </article>
      </div>}

      {posClienteNuevoModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setPosClienteNuevoModal(false); }}>
          <div className="modal-card" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Registrar nuevo cliente</h3>
              <button className="btn btn-ghost" onClick={() => setPosClienteNuevoModal(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>El cliente se registrará con crédito cerrado. El administrador puede habilitarlo desde el menú Clientes.</p>
            <div className="quick-form" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <label>Teléfono *</label>
                <input placeholder="Ej: 809-555-0001" value={clienteQuery} onChange={(e) => setClienteQuery(e.target.value)} />
              </div>
              <div>
                <label>Nombre completo *</label>
                <input placeholder="Ej: Juan Pérez" value={posNuevoClienteNombre} onChange={(e) => setPosNuevoClienteNombre(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={async () => {
              if (!posNuevoClienteNombre.trim() || !clienteQuery.trim()) { toast('error', 'Nombre y teléfono son obligatorios'); return; }
              const c = await crearClienteRapido(posNuevoClienteNombre.trim(), clienteQuery.trim()).catch((e) => { toast('error', e.message); return null; });
              if (c) {
                await cargarTodo();
                setClienteId(c.id ?? '');
                setPosClienteNuevoModal(false);
              }
            }}>Registrar y seleccionar</button>
          </div>
        </div>
      )}

      {modalFidelidad && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalFidelidad(false); }}>
          <div className="modal-card modal-card-wide">
            <div className="modal-header">
              <h3>⭐ Programa de Fidelidad — Registrar / Actualizar Cliente</h3>
              <button className="btn btn-ghost" onClick={() => setModalFidelidad(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
              Busca el cliente por nombre, código o teléfono. Si ya está registrado, sus datos se autocompletarán para que puedas actualizarlos. Si no existe, se creará nuevo.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Buscar cliente</label>
              <input
                list="fid-clientes-options"
                placeholder="Nombre, código o teléfono..."
                value={buscarClienteFidelidad}
                style={{ width: '100%' }}
                onChange={(e) => {
                  const val = e.target.value;
                  setBuscarClienteFidelidad(val);
                  const match = clientes.find((c: any) =>
                    `${c.codigo} - ${c.nombre}` === val ||
                    c.nombre?.toLowerCase() === val.toLowerCase() ||
                    c.telefono_1 === val
                  );
                  if (match) setClienteFidelidadSeleccionado({ ...match, en_programa_fidelidad: true });
                  else setClienteFidelidadSeleccionado(null);
                }}
              />
              <datalist id="fid-clientes-options">
                {clientes.slice(0, 80).map((c: any) => (
                  <option key={c.id} value={`${c.codigo} - ${c.nombre}`}>{c.telefono_1 || ''}</option>
                ))}
              </datalist>
            </div>
            {clienteFidelidadSeleccionado && (
              <div>
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                  <strong>⭐ Cliente encontrado — completa o actualiza los datos para inscribirlo:</strong>
                </div>
                <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div><label>Código</label><input value={clienteFidelidadSeleccionado.codigo || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
                  <div><label>Nombre completo *</label><input value={clienteFidelidadSeleccionado.nombre || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
                  <div><label>Cédula / RNC</label><input value={clienteFidelidadSeleccionado.cedula_rnc || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, cedula_rnc: e.target.value }))} /></div>
                  <div><label>Teléfono principal</label><input value={clienteFidelidadSeleccionado.telefono_1 || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, telefono_1: e.target.value }))} /></div>
                  <div><label>Teléfono secundario</label><input value={clienteFidelidadSeleccionado.telefono_2 || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, telefono_2: e.target.value }))} /></div>
                  <div><label>Correo electrónico</label><input value={clienteFidelidadSeleccionado.correo || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, correo: e.target.value }))} /></div>
                  <div><label>Dirección</label><input value={clienteFidelidadSeleccionado.direccion || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
                  <div><label>Fecha de nacimiento</label><input type="date" value={clienteFidelidadSeleccionado.fecha_nacimiento || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, fecha_nacimiento: e.target.value }))} /></div>
                  <div><label>Tipo de cliente</label><input placeholder="Ej: Taller, Persona, Comerciante" value={clienteFidelidadSeleccionado.tipo_cliente || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, tipo_cliente: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a', marginTop: 12 }}>
                  <input type="checkbox" id="fid-modal-check" checked={true} readOnly style={{ width: 18, height: 18, accentColor: '#d97706' }} />
                  <label htmlFor="fid-modal-check" style={{ fontWeight: 600, color: '#92400e', margin: 0 }}>⭐ Este cliente quedará inscrito en el programa de Fidelidad</label>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={async () => {
                    try {
                      await api(`/clientes/${clienteFidelidadSeleccionado.id}`, token, { method: 'PUT', body: JSON.stringify({ ...clienteFidelidadSeleccionado, en_programa_fidelidad: true }) });
                      await cargarTodo();
                      toast('ok', `✅ ${clienteFidelidadSeleccionado.nombre} inscrito en Fidelidad`);
                      setModalFidelidad(false);
                    } catch (e: any) { toast('error', e.message); }
                  }}>⭐ Guardar e inscribir en Fidelidad</button>
                  <button className="btn btn-ghost" onClick={() => setModalFidelidad(false)}>Cancelar</button>
                </div>
              </div>
            )}
            {!clienteFidelidadSeleccionado && buscarClienteFidelidad.length > 2 && !creaClienteFidelidadNuevo && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>✨ Cliente no encontrado — creando formulario nuevo...</p>
              </div>
            )}
            
            {creaClienteFidelidadNuevo && clienteFidelidadSeleccionado && (
              <div>
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                  <strong>✨ Nuevo cliente — completa los datos y guarda:</strong>
                </div>
                <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div><label>Código (auto-generado)</label><input readOnly value={clienteFidelidadSeleccionado.codigo || ''} style={{ background: '#f5f5f5', cursor: 'not-allowed' }} /></div>
                  <div><label>Nombre completo *</label><input value={clienteFidelidadSeleccionado.nombre || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
                  <div><label>Cédula / RNC</label><input value={clienteFidelidadSeleccionado.cedula_rnc || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, cedula_rnc: e.target.value }))} /></div>
                  <div><label>Teléfono principal</label><input value={clienteFidelidadSeleccionado.telefono_1 || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, telefono_1: e.target.value }))} /></div>
                  <div><label>Teléfono secundario</label><input value={clienteFidelidadSeleccionado.telefono_2 || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, telefono_2: e.target.value }))} /></div>
                  <div><label>Correo electrónico</label><input value={clienteFidelidadSeleccionado.correo || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, correo: e.target.value }))} /></div>
                  <div><label>Representante / Contacto</label><input value={clienteFidelidadSeleccionado.representante || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, representante: e.target.value }))} /></div>
                  <div><label>Dirección</label><input value={clienteFidelidadSeleccionado.direccion || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
                  <div><label>Fecha de nacimiento</label><input type="date" value={clienteFidelidadSeleccionado.fecha_nacimiento || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, fecha_nacimiento: e.target.value }))} /></div>
                  <div><label>Tipo de cliente</label><input placeholder="Ej: Taller, Persona, Comerciante" value={clienteFidelidadSeleccionado.tipo_cliente || ''} onChange={(e) => setClienteFidelidadSeleccionado((s: any) => ({ ...s, tipo_cliente: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a', marginTop: 12 }}>
                  <input type="checkbox" id="fid-nuevo-check" checked={true} readOnly style={{ width: 18, height: 18, accentColor: '#d97706' }} />
                  <label htmlFor="fid-nuevo-check" style={{ fontWeight: 600, color: '#92400e', margin: 0 }}>⭐ Se registrará en Fidelidad automáticamente</label>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={async () => {
                    try {
                      if (!clienteFidelidadSeleccionado.nombre?.trim()) {
                        toast('error', 'El nombre es obligatorio');
                        return;
                      }
                      await api('/clientes', token, { method: 'POST', body: JSON.stringify({ ...clienteFidelidadSeleccionado, codigo: clienteFidelidadSeleccionado.codigo || autoCodigoCliente(clientes), estatus_credito: 'cerrado', en_programa_fidelidad: true, tipo_comprobante_fiscal: 'consumidor_final' }) });
                      await cargarTodo();
                      toast('ok', `✅ ${clienteFidelidadSeleccionado.nombre} creado e inscrito en Fidelidad`);
                      setModalFidelidad(false);
                      setCreaClienteFidelidadNuevo(false);
                    } catch (e: any) { toast('error', e.message); }
                  }}>✅ Crear y registrar en Fidelidad</button>
                  <button className="btn btn-ghost" onClick={() => { setCreaClienteFidelidadNuevo(false); setClienteFidelidadSeleccionado(null); }}>← Volver</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {modalDevolucion && !ncCreada && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setModalDevolucion(false); setTipoVenta('contado'); } }}>
          <div className="modal-card modal-card-wide">
            <div className="modal-header">
              <h3>📄 Devolución — Nota de Crédito</h3>
              <button className="btn btn-ghost" onClick={() => { setModalDevolucion(false); setTipoVenta('contado'); }}>✕</button>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
              ℹ️ La devolución <strong>devuelve el producto al inventario</strong> y emite una <strong>Nota de Crédito</strong> a favor del cliente. No se devuelve dinero en efectivo.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Buscar venta original (número o cliente)</label>
              <input
                placeholder="Ej: V-1774..., nombre del cliente..."
                value={ventaDevolucionBuscar}
                style={{ width: '100%' }}
                onChange={async (e) => {
                  const val = e.target.value;
                  setVentaDevolucionBuscar(val);
                  if (val.trim().length > 1) {
                    const ventas = historialVentas.filter((v: any) =>
                      String(v.numero_interno).toLowerCase().includes(val.toLowerCase()) ||
                      (v.cliente_nombre && v.cliente_nombre.toLowerCase().includes(val.toLowerCase()))
                    );
                    if (ventas.length > 0) {
                      const venta = ventas[0];
                      setVentaDevolucionSeleccionada(venta);
                      const resDetalle = await api<any>(`/ventas/${venta.id}`, token).catch(() => ({ detalle: [] }));
                      setItemsDevolucionSeleccionados((resDetalle?.detalle || []).map((d: any) => ({ ...d, cantidad_devolver: 0 })));
                    } else {
                      setVentaDevolucionSeleccionada(null);
                      setItemsDevolucionSeleccionados([]);
                    }
                  }
                }}
              />
            </div>

            {ventaDevolucionSeleccionada && (
              <div>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>
                    📋 {ventaDevolucionSeleccionada.numero_interno} — <strong>{ventaDevolucionSeleccionada.cliente_nombre || 'S/Cliente'}</strong>
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total original: RD$ {Number(ventaDevolucionSeleccionada.total).toFixed(2)}</span>
                </div>

                <table className="table-premium" style={{ marginBottom: 12 }}>
                  <thead>
                    <tr><th>Código</th><th>Producto</th><th>Cant. facturada</th><th>Precio</th><th>Cant. a devolver</th></tr>
                  </thead>
                  <tbody>
                    {itemsDevolucionSeleccionados.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td><strong>{item.codigo_producto}</strong></td>
                        <td>{item.descripcion}</td>
                        <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                        <td>RD$ {Number(item.precio_unitario).toFixed(2)}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={item.cantidad}
                            value={item.cantidad_devolver || 0}
                            onChange={(e) => {
                              const newItems = [...itemsDevolucionSeleccionados];
                              newItems[idx].cantidad_devolver = Math.min(Number(e.target.value), item.cantidad);
                              setItemsDevolucionSeleccionados(newItems);
                            }}
                            style={{ width: 70, padding: '4px 6px', textAlign: 'center' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(() => {
                  const montoNC = itemsDevolucionSeleccionados.filter((i: any) => i.cantidad_devolver > 0).reduce((acc: number, i: any) => {
                    const base = Number(i.cantidad_devolver) * Number(i.precio_unitario);
                    return acc + base + base * Number(i.itbis_tasa ?? 0.18);
                  }, 0);
                  return montoNC > 0 ? (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                      💳 <strong>Nota de Crédito a emitir: RD$ {montoNC.toFixed(2)}</strong>
                    </div>
                  ) : null;
                })()}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={async () => {
                    const itemsConDevolucion = itemsDevolucionSeleccionados.filter((i: any) => i.cantidad_devolver > 0);
                    if (itemsConDevolucion.length === 0) {
                      toast('error', 'Ingresa al menos 1 unidad para devolver');
                      return;
                    }
                    try {
                      const payload = {
                        venta_id: ventaDevolucionSeleccionada.id,
                        items_devolucion: itemsConDevolucion.map((i: any) => ({
                          producto_id: i.producto_id,
                          codigo_producto: i.codigo_producto,
                          descripcion: i.descripcion,
                          cantidad: i.cantidad_devolver,
                          precio_unitario: i.precio_unitario,
                          itbis_tasa: i.itbis_tasa ?? 0.18,
                        })),
                      };
                      const nc = await api<any>('/notas-credito/generar', token, { method: 'POST', body: JSON.stringify(payload) });
                      const ncConNombre = { ...nc, cliente_nombre: ventaDevolucionSeleccionada.cliente_nombre };
                      setNcCreada(ncConNombre);
                      await cargarTodo();
                    } catch (e: any) {
                      toast('error', e.message);
                    }
                  }}>📄 Generar Nota de Crédito</button>
                  <button className="btn btn-ghost" onClick={() => { setVentaDevolucionSeleccionada(null); setItemsDevolucionSeleccionados([]); setVentaDevolucionBuscar(''); }}>Limpiar</button>
                </div>
              </div>
            )}

            {!ventaDevolucionSeleccionada && ventaDevolucionBuscar.length > 1 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>
                No se encontró ninguna venta. Verifica el número o nombre del cliente.
              </div>
            )}
          </div>
        </div>
      )}

      {ncCreada && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3 style={{ color: '#059669', marginBottom: 4 }}>Devolución registrada</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: 13 }}>Los productos han vuelto al inventario y se ha emitido la siguiente Nota de Crédito:</p>
            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 12, padding: '16px 24px', marginBottom: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', letterSpacing: 2 }}>{ncCreada.numero}</div>
              <div style={{ fontSize: 14, color: '#166534', marginTop: 4 }}>Cliente: <strong>{ncCreada.cliente_nombre}</strong></div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d', marginTop: 8 }}>RD$ {Number(ncCreada.monto_original).toFixed(2)}</div>
              <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>Válida para futuras compras</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => imprimirNC(ncCreada)}>🖨️ Imprimir NC</button>
              <button className="btn btn-ghost" onClick={() => {
                setNcCreada(null);
                setModalDevolucion(false);
                setTipoVenta('contado');
                setVentaDevolucionBuscar('');
                setVentaDevolucionSeleccionada(null);
                setItemsDevolucionSeleccionados([]);
              }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalAplicarNC && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setModalAplicarNC(false); if (formaPago === 'nota_credito') setFormaPago('efectivo'); } }}>
          <div className="modal-card" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>📄 Pagar con Nota de Crédito</h3>
              <button className="btn btn-ghost" onClick={() => { setModalAplicarNC(false); if (formaPago === 'nota_credito' && !ncEncontrada) setFormaPago('efectivo'); }}>✕</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>Ingresa el código de la Nota de Crédito del cliente.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Código de Nota de Crédito</label>
              <input
                placeholder="Ej: NC-0001"
                value={codigoNC}
                style={{ width: '100%', textTransform: 'uppercase', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}
                onChange={async (e) => {
                  const v = e.target.value.toUpperCase();
                  setCodigoNC(v);
                  setNcEncontrada(null);
                  if (v.length >= 4) {
                    const nc = await api<any>(`/notas-credito/codigo/${v}`, token).catch(() => null);
                    if (nc && nc.estado === 'activo') {
                      setNcEncontrada(nc);
                    }
                  }
                }}
              />
            </div>
            {ncEncontrada && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: '#15803d', fontSize: 15 }}>✅ {ncEncontrada.numero} — Válida</div>
                <div style={{ fontSize: 13, color: '#166534' }}>Cliente: {ncEncontrada.cliente_nombre}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginTop: 4 }}>Saldo disponible: RD$ {Number(ncEncontrada.monto_restante).toFixed(2)}</div>
              </div>
            )}
            {codigoNC.length >= 4 && !ncEncontrada && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>
                ✗ Nota de Crédito no encontrada o ya utilizada
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: 13 }}>Notas de Crédito activas de clientes:</label>
              <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                {notasCredito.filter((nc: any) => nc.estado === 'activo').slice(0, 20).map((nc: any) => (
                  <div key={nc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: ncEncontrada?.id === nc.id ? '#f0fdf4' : 'white' }}
                    onClick={() => { setCodigoNC(nc.numero); setNcEncontrada(nc); }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{nc.numero}</strong>
                      <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 8 }}>{nc.cliente_nombre}</span>
                    </div>
                    <strong style={{ color: '#15803d', fontSize: 13 }}>RD$ {Number(nc.monto_restante).toFixed(2)}</strong>
                  </div>
                ))}
                {notasCredito.filter((nc: any) => nc.estado === 'activo').length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No hay notas de crédito activas</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" disabled={!ncEncontrada} onClick={() => {
                if (!ncEncontrada) { toast('error', 'Selecciona una NC válida'); return; }
                if (clienteId && ncEncontrada.cliente_id !== clienteId) {
                  toast('error', 'Esta NC pertenece a otro cliente');
                  return;
                }
                setModalAplicarNC(false);
                toast('ok', `NC ${ncEncontrada.numero} seleccionada — RD$ ${Number(ncEncontrada.monto_restante).toFixed(2)} disponibles`);
              }}>✓ Usar esta NC</button>
              <button className="btn btn-ghost" onClick={() => { setModalAplicarNC(false); setNcEncontrada(null); setFormaPago('efectivo'); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {cajaCobrarModal && (() => {
        const ventaTotal = Number(cajaCobrarModal.total ?? 0);
        const recibNum = parseFloat(cajaMontoRecibido) || 0;
        const vueltoCaja = cajaTipoPago === 'efectivo' ? Math.max(0, recibNum - ventaTotal) : 0;
        return (
          <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setCajaCobrarModal(null); }}>
            <div className="modal-card" style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h3>💳 Cobrar venta {cajaCobrarModal.numero_interno}</h3>
                <button className="btn btn-ghost" onClick={() => setCajaCobrarModal(null)}>✕</button>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 13 }}>Cliente: <strong>{cajaCobrarModal.cliente_nombre || 'S/Cliente'}</strong></div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af', marginTop: 4 }}>Total: RD$ {ventaTotal.toFixed(2)}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Forma de pago:</label>
                <select value={cajaTipoPago} onChange={(e) => { setCajaTipoPago(e.target.value); setCajaMontoRecibido(''); }} style={{ width: '100%' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
              {(cajaTipoPago === 'efectivo' || cajaTipoPago === 'mixto') && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>💵 Monto recibido en efectivo:</label>
                  <input
                    type="number"
                    min={0}
                    step="50"
                    placeholder={`Mín. ${ventaTotal.toFixed(2)}`}
                    value={cajaMontoRecibido}
                    onChange={(e) => setCajaMontoRecibido(e.target.value)}
                    autoFocus
                    style={{ width: '100%', fontSize: 22, fontWeight: 800, textAlign: 'right', padding: '8px 10px' }}
                  />
                  {vueltoCaja > 0 && (
                    <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 8, padding: '10px 16px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>💵 Vuelto:</span>
                      <strong style={{ color: '#15803d', fontSize: 24 }}>RD$ {vueltoCaja.toFixed(2)}</strong>
                    </div>
                  )}
                  {recibNum > 0 && recibNum < ventaTotal && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', marginTop: 6, color: '#dc2626', fontSize: 12 }}>
                      ⚠️ Monto insuficiente — faltan RD$ {(ventaTotal - recibNum).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => {
                  if ((cajaTipoPago === 'efectivo' || cajaTipoPago === 'mixto') && recibNum < ventaTotal) {
                    toast('error', `Monto recibido insuficiente. Faltan RD$ ${(ventaTotal - recibNum).toFixed(2)}`);
                    return;
                  }
                  try {
                    await api(`/ventas/${cajaCobrarModal.id}/cobrar`, token, {
                      method: 'POST',
                      body: JSON.stringify({
                        tipo_pago: cajaTipoPago,
                        monto_efectivo: cajaTipoPago === 'efectivo' || cajaTipoPago === 'mixto' ? ventaTotal : 0,
                        monto_tarjeta: cajaTipoPago === 'tarjeta' ? ventaTotal : 0,
                        monto_transferencia: cajaTipoPago === 'transferencia' ? ventaTotal : 0,
                        monto_recibido: cajaTipoPago === 'efectivo' || cajaTipoPago === 'mixto' ? recibNum : 0,
                      }),
                    });
                    if (vueltoCaja > 0) toast('ok', `✅ Cobrada — Vuelto: RD$ ${vueltoCaja.toFixed(2)}`);
                    else toast('ok', `✅ Venta ${cajaCobrarModal.numero_interno} cobrada`);
                    setCajaCobrarModal(null);
                    await cargarTodo();
                  } catch (e: any) {
                    toast('error', e.message);
                  }
                }}>✅ Confirmar cobro</button>
                <button className="btn btn-ghost" onClick={() => setCajaCobrarModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {modalNcDiferencia && (() => {
        const difVal = Number(modalNcDiferencia.diferencia);
        const ncVal = Number(modalNcDiferencia.monto_nc);
        const recibidoNum = parseFloat((modalNcDiferencia as any)._recibido || String(difVal)) || difVal;
        const vueltoNc = formaPagoComplementario === 'efectivo' ? Math.max(0, recibidoNum - difVal) : 0;
        return (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <h3>⚠️ Saldo insuficiente en NC — Cobro complementario</h3>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                <div>📄 NC cubrió: <strong>RD$ {ncVal.toFixed(2)}</strong></div>
                <div style={{ marginTop: 4 }}>💳 Pendiente a cobrar: <strong style={{ color: '#dc2626', fontSize: 15 }}>RD$ {difVal.toFixed(2)}</strong></div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Cobrar diferencia con:</label>
                <select value={formaPagoComplementario} onChange={(e) => setFormaPagoComplementario(e.target.value)} style={{ width: '100%' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              {formaPagoComplementario === 'efectivo' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Monto recibido en efectivo:</label>
                  <input
                    type="number"
                    min={difVal}
                    step="50"
                    value={(modalNcDiferencia as any)._recibido ?? difVal.toFixed(2)}
                    onChange={(e) => setModalNcDiferencia({ ...modalNcDiferencia, _recibido: e.target.value })}
                    style={{ width: '100%', fontSize: 18, fontWeight: 700, textAlign: 'right' }}
                  />
                  {vueltoNc > 0 && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '8px 12px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>💵 Vuelto:</span>
                      <strong style={{ color: '#15803d', fontSize: 18 }}>RD$ {vueltoNc.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={async () => {
                  const recib = parseFloat((modalNcDiferencia as any)._recibido || String(difVal)) || difVal;
                  if (formaPagoComplementario === 'efectivo' && recib < difVal) {
                    toast('error', `Monto recibido (${recib.toFixed(2)}) es menor que la diferencia (${difVal.toFixed(2)})`);
                    return;
                  }
                  try {
                    await api(`/ventas/${modalNcDiferencia.venta_id}/cobrar`, token, {
                      method: 'POST',
                      body: JSON.stringify({
                        tipo_pago: formaPagoComplementario,
                        monto_nota_credito: ncVal,
                        monto_efectivo: formaPagoComplementario === 'efectivo' ? difVal : 0,
                        monto_tarjeta: formaPagoComplementario === 'tarjeta' ? difVal : 0,
                        monto_transferencia: formaPagoComplementario === 'transferencia' ? difVal : 0,
                        monto_recibido: formaPagoComplementario === 'efectivo' ? recib : 0,
                      }),
                    });
                    if (vueltoNc > 0) toast('ok', `✅ Cobro registrado — Vuelto: RD$ ${vueltoNc.toFixed(2)}`);
                    else toast('ok', '✅ Pago complementario registrado');
                    setModalNcDiferencia(null);
                    await cargarTodo();
                  } catch (e: any) {
                    toast('error', e.message);
                  }
                }}>✅ Confirmar cobro</button>
                <button className="btn btn-ghost" onClick={() => setModalNcDiferencia(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {(modulo === 'caja' || modulo === 'mayorista') && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Bandeja caja y cobros</h3>
            <span className="chip chip-warning">{pendientes.length} pendientes</span>
          </div>
          <table className="table-premium">
            <thead><tr><th>Turno</th><th>Cliente</th><th>Total</th><th>Sucursal</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {pendientes.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>No hay ventas pendientes en caja</td></tr> : pendientes.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.numero_interno}</strong></td>
                  <td>{p.cliente_nombre}</td>
                  <td>RD$ {Number(p.total).toFixed(2)}</td>
                  <td>{p.sucursal_nombre || p.sucursal_id || '-'}</td>
                  <td>{p.estado}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {p.estado === 'enviada_a_caja' && <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => tomarVentaCaja(p.id).catch((e) => toast('error', e.message))}>Tomar</button>}
                    {p.estado === 'en_caja' && <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => cobrarVentaCaja(p)}>Cobrar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {modulo === 'cxc' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Cuentas por Cobrar — Facturas a Crédito</h3>
            <span className="chip chip-warning">{cxc.filter((x) => Number(x.balance_pendiente) > 0).length} pendientes</span>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Todas las facturas emitidas a crédito con su balance actual</p>
          <table className="table-premium">
            <thead>
              <tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Vence</th><th>Días restantes</th><th>Monto original</th><th>Balance pendiente</th><th>Estado</th><th>Cobro</th></tr>
            </thead>
            <tbody>
              {cxc.length === 0 ? (
                <tr><td colSpan={9} className="empty" style={{ textAlign: 'center', padding: 24 }}>No hay facturas a crédito registradas</td></tr>
              ) : cxc.map((x) => (
                <tr key={x.id}>
                  <td><strong>{x.numero_interno}</strong></td>
                  <td>{x.cliente_nombre || '-'}</td>
                  <td>{x.fecha_creacion ? String(x.fecha_creacion).substring(0, 10) : '-'}</td>
                  <td>{x.fecha_vencimiento_calculada ? String(x.fecha_vencimiento_calculada).substring(0, 10) : '-'}</td>
                  <td style={{ fontWeight: 700, color: Number(x.dias_restantes ?? 0) < 0 ? 'var(--rojo-600)' : 'var(--success)' }}>{Number(x.dias_restantes ?? 0)}</td>
                  <td>RD$ {Number(x.monto_original).toFixed(2)}</td>
                  <td style={{ color: Number(x.balance_pendiente) > 0 ? 'var(--rojo-600)' : 'var(--success)', fontWeight: 700 }}>
                    RD$ {Number(x.balance_pendiente).toFixed(2)}
                  </td>
                  <td>
                    <span className={`chip ${Number(x.balance_pendiente) > 0 ? 'chip-warning' : 'chip-lan'}`}>
                      {Number(x.balance_pendiente) > 0 ? 'Pendiente' : 'Saldado'}
                    </span>
                  </td>
                  <td>{Number(x.balance_pendiente) > 0 && <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => cobrarCuentaCxC(x).catch((e) => toast('error', e.message))}>Cobrar / Abonar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {cxcCobroModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setCxcCobroModal(null); }}>
          <div className="modal-card" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Cobrar / Abonar</h3>
              <button className="btn btn-ghost" onClick={() => setCxcCobroModal(null)}>✕</button>
            </div>
            <p style={{ marginTop: 0, color: 'var(--muted)' }}>
              Factura: <strong>{cxcCobroModal.numero_interno}</strong><br />
              Cliente: <strong>{cxcCobroModal.cliente_nombre}</strong><br />
              Balance pendiente: <strong>RD$ {Number(cxcCobroModal.balance_pendiente ?? 0).toFixed(2)}</strong>
            </p>
            <label>Monto a cobrar/abonar</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={cxcCobroMonto}
              onChange={(e) => setCxcCobroMonto(e.target.value)}
              placeholder="0.00"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary" onClick={() => confirmarCobroCxC().catch((e) => toast('error', e.message))}>Confirmar</button>
              <button className="btn btn-ghost" onClick={() => setCxcCobroModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modulo === 'fidelidad' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>⭐ Programa de Fidelidad</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip chip-soft">{clientesFidelidad.length} miembros</span>
              <button className="btn btn-primary" onClick={() => { setBuscarClienteFidelidad(''); setClienteFidelidadSeleccionado(null); setModalFidelidad(true); }}>⭐ Inscribir Cliente</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 12, padding: '14px 18px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>MIEMBROS ACTIVOS</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>{clientesFidelidad.length}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, padding: '14px 18px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 4 }}>TOTAL PUNTOS ACTIVOS</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{clientesFidelidad.reduce((s: number, c: any) => s + Number(c.puntos_disponibles || 0), 0).toLocaleString()}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: 12, padding: '14px 18px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>TOTAL GASTADO (MIEMBROS)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1d4ed8' }}>RD$ {clientesFidelidad.reduce((s: number, c: any) => s + Number(c.total_gastado || 0), 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {clientesFidelidad.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No hay clientes en el programa de Fidelidad</p>
              <p style={{ fontSize: 13 }}>Inscribe clientes desde el botón de arriba o marcando la casilla de Fidelidad al crear/editar un cliente en el módulo Clientes.</p>
            </div>
          ) : (
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Compras</th>
                  <th>Total Gastado</th>
                  <th style={{ color: '#d97706' }}>⭐ Puntos Acumulados</th>
                  <th style={{ color: '#16a34a' }}>Pts Disponibles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFidelidad.map((c: any) => (
                  <tr key={c.id}>
                    <td><strong>{c.codigo}</strong></td>
                    <td>{c.nombre}</td>
                    <td>{c.telefono_1 || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{Number(c.total_compras || 0)}</td>
                    <td>RD$ {Number(c.total_gastado || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>{Number(c.puntos_acumulados || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#16a34a', fontSize: 15 }}>{Number(c.puntos_disponibles || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={async () => {
                          const fullCliente = clientes.find((cl: any) => cl.id === c.id);
                          if (fullCliente) { setEditandoCliente({ ...fullCliente }); cambiarModuloConRuta('clientes'); }
                        }}>✏ Editar</button>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px', color: '#d97706' }} onClick={async () => {
                          const movs = await api<any>(`/clientes/fidelidad/${c.id}/movimientos`, token).catch(() => null);
                          if (movs) {
                            const info = movs.movimientos.slice(0, 5).map((m: any) => `${m.fecha.substring(0,10)} | ${m.tipo === 'acumulacion' ? '+' : '-'}${m.puntos} pts — ${m.descripcion}`).join('\n');
                            toast('ok', `⭐ ${c.nombre}: ${Number(c.puntos_disponibles || 0)} pts disponibles${info ? '\n\n' + info : ''}`);
                          }
                        }}>⭐ Ver Pts</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      )}

      {modulo === 'clientes' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Clientes</h3>
            <button className="btn btn-primary" onClick={() => { setNuevoCliente({ ...NUEVOCLUB_BLANK, codigo: autoCodigoCliente(clientes) }); setModalCliente(true); }}>+ Nuevo Cliente</button>
          </div>
          <table className="table-premium">
            <thead>
              <tr><th>Código</th><th>Nombre</th><th>Cédula/RNC</th><th>Teléfono</th><th>Correo</th><th>Crédito</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {clientes.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Sin clientes registrados</td></tr>
                : clientes.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.codigo || '—'}</strong></td>
                    <td>{c.nombre}</td>
                    <td>{c.cedula_rnc || '—'}</td>
                    <td>{c.telefono_1 || '—'}</td>
                    <td>{c.correo || '—'}</td>
                    <td>
                      <span className={`chip ${c.estatus_credito === 'abierto' ? 'chip-lan' : 'chip-warning'}`}>
                        {c.estatus_credito === 'abierto' ? '✓ Abierto' : '✗ Cerrado'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => setEditandoCliente({ ...c })}>✏ Editar</button>
                        {usuario.rol === 'administrador' && (
                          <button className={`btn ${c.estatus_credito === 'abierto' ? 'btn-ghost' : 'btn-primary'}`} style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => toggleCreditoCliente(c).catch((e) => toast('error', e.message))}>
                            {c.estatus_credito === 'abierto' ? 'Cerrar crédito' : 'Abrir crédito'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {modalCliente && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalCliente(false); }}>
              <div className="modal-card modal-card-wide">
                <div className="modal-header">
                  <h3>Nuevo Cliente</h3>
                  <button className="btn btn-ghost" onClick={() => setModalCliente(false)}>✕ Cerrar</button>
                </div>
                <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div><label>Código (auto-generado)</label><input placeholder={autoCodigoCliente(clientes)} value={nuevoCliente.codigo} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
                  <div><label>Nombre completo *</label><input placeholder="Ej: Juan Pérez / Taller Los Hermanos" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
                  <div><label>Cédula / RNC</label><input placeholder="Ej: 001-1234567-8" value={nuevoCliente.cedula_rnc} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, cedula_rnc: e.target.value }))} /></div>
                  <div><label>Teléfono principal</label><input placeholder="Ej: 809-555-0001" value={nuevoCliente.telefono_1} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, telefono_1: e.target.value }))} /></div>
                  <div><label>Teléfono secundario</label><input placeholder="Ej: 849-555-0002" value={nuevoCliente.telefono_2} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, telefono_2: e.target.value }))} /></div>
                  <div><label>Correo electrónico</label><input placeholder="cliente@correo.com" value={nuevoCliente.correo} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, correo: e.target.value }))} /></div>
                  <div><label>Representante / Contacto</label><input placeholder="Persona de contacto" value={nuevoCliente.representante} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, representante: e.target.value }))} /></div>
                  <div><label>Dirección</label><input placeholder="Calle, ciudad, sector..." value={nuevoCliente.direccion} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
                  <div><label>Fecha de nacimiento</label><input type="date" value={nuevoCliente.fecha_nacimiento} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, fecha_nacimiento: e.target.value }))} /></div>
                  <div><label>Tipo de cliente</label><input placeholder="Ej: Taller, Comerciante, Persona" value={nuevoCliente.tipo_cliente} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, tipo_cliente: e.target.value }))} /></div>
                  <div><label>% Descuento habitual</label><input type="number" placeholder="0" value={nuevoCliente.porcentaje_descuento} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, porcentaje_descuento: Number(e.target.value) }))} /></div>
                  <div><label>Tipo comprobante fiscal</label>
                    <select value={nuevoCliente.tipo_comprobante_fiscal} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, tipo_comprobante_fiscal: e.target.value }))}>
                      <option value="consumidor_final">Consumidor final</option>
                      <option value="credito_fiscal">Crédito fiscal</option>
                      <option value="regimen_especial">Régimen especial</option>
                      <option value="empresa_gubernamental">Empresa gubernamental</option>
                    </select>
                  </div>
                  <div><label>Estado de crédito</label>
                    <select value={nuevoCliente.estatus_credito} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, estatus_credito: e.target.value }))}>
                      <option value="cerrado">Crédito cerrado (solo contado)</option>
                      <option value="abierto">Crédito abierto</option>
                    </select>
                  </div>
                  <div><label>Límite de crédito (RD$)</label><input type="number" placeholder="Solo si crédito abierto" value={nuevoCliente.limite_credito} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, limite_credito: Number(e.target.value) }))} /></div>
                  <div><label>Días máx. de crédito</label><input type="number" placeholder="Ej: 30, 60, 90" value={nuevoCliente.limite_tiempo_dias} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, limite_tiempo_dias: Number(e.target.value) }))} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: '1/-1', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a' }}>
                    <input type="checkbox" id="fid-nuevo" checked={!!nuevoCliente.en_programa_fidelidad} onChange={(e) => setNuevoCliente((s: any) => ({ ...s, en_programa_fidelidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }} />
                    <label htmlFor="fid-nuevo" style={{ cursor: 'pointer', fontWeight: 600, color: '#92400e', margin: 0 }}>⭐ Inscribir en programa de Fidelidad — cada peso gastado acumula 1 punto</label>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => crearCliente().catch((e) => toast('error', e.message))}>✅ Guardar Cliente</button>
              </div>
            </div>
          )}

          {editandoCliente && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditandoCliente(null); }}>
              <div className="modal-card modal-card-wide">
                <div className="modal-header">
                  <h3>Editar Cliente — {editandoCliente.codigo}</h3>
                  <button className="btn btn-ghost" onClick={() => setEditandoCliente(null)}>✕ Cerrar</button>
                </div>
                <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div><label>Código</label><input value={editandoCliente.codigo || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
                  <div><label>Nombre completo *</label><input value={editandoCliente.nombre || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
                  <div><label>Cédula / RNC</label><input value={editandoCliente.cedula_rnc || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, cedula_rnc: e.target.value }))} /></div>
                  <div><label>Teléfono principal</label><input value={editandoCliente.telefono_1 || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, telefono_1: e.target.value }))} /></div>
                  <div><label>Teléfono secundario</label><input value={editandoCliente.telefono_2 || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, telefono_2: e.target.value }))} /></div>
                  <div><label>Correo electrónico</label><input value={editandoCliente.correo || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, correo: e.target.value }))} /></div>
                  <div><label>Representante</label><input value={editandoCliente.representante || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, representante: e.target.value }))} /></div>
                  <div><label>Dirección</label><input value={editandoCliente.direccion || ''} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
                  <div><label>% Descuento</label><input type="number" value={editandoCliente.porcentaje_descuento || 0} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, porcentaje_descuento: Number(e.target.value) }))} /></div>
                  <div><label>Estado de crédito</label>
                    <select value={editandoCliente.estatus_credito || 'cerrado'} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, estatus_credito: e.target.value }))}>
                      <option value="cerrado">Crédito cerrado</option>
                      <option value="abierto">Crédito abierto</option>
                    </select>
                  </div>
                  <div><label>Límite de crédito (RD$)</label><input type="number" value={editandoCliente.limite_credito || 0} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, limite_credito: Number(e.target.value) }))} /></div>
                  <div><label>Días máx. de crédito</label><input type="number" value={editandoCliente.limite_tiempo_dias || 0} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, limite_tiempo_dias: Number(e.target.value) }))} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a', marginTop: 12 }}>
                  <input type="checkbox" id="fid-edit" checked={!!editandoCliente.en_programa_fidelidad} onChange={(e) => setEditandoCliente((s: any) => ({ ...s, en_programa_fidelidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }} />
                  <label htmlFor="fid-edit" style={{ cursor: 'pointer', fontWeight: 600, color: '#92400e', margin: 0 }}>⭐ Miembro del programa de Fidelidad — cada peso gastado acumula 1 punto</label>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={() => editarCliente().catch((e) => toast('error', e.message))}>✅ Guardar cambios</button>
                  <button className="btn btn-ghost" onClick={() => setEditandoCliente(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </article>
      )}

      {modulo === 'productos' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Productos</h3>
            <button className="btn btn-primary" onClick={() => { setNuevoProducto({ codigo: '', tipo: '', nombre: '', descripcion: '', marca: '', medida: '', costo: 0, lleva_itbis: true, margen: 0, precio: 0, itbis_porcentaje: 18, existencia_minima: 0, cantidad_a_ordenar: 0, ubicacion: '', categoria: '', codigo_barras: '', cuenta_contable: '', referencia: '', uso_notas: '', suplidor_principal_id: '', imagen_url: '' }); setImagenAddFile(null); setImagenAddPreview(''); setModalProductosPage(true); setQuickAddCat(false); setQuickAddSup(false); }}>+ Agregar Producto</button>
          </div>
          <table className="table-premium">
            <thead><tr><th></th><th>Código</th><th>Descripción</th><th>Categoría</th><th>Marca</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>
              {productos.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Sin productos registrados</td></tr>
                : productos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 44 }}>
                      {p.imagen_url
                        ? <img src={imgSrc(p.imagen_url)} alt={p.nombre} className="prod-img-thumb" />
                        : <div className="prod-img-placeholder">🔩</div>}
                    </td>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria_nombre || '—'}</td>
                    <td>{p.marca || '—'}</td>
                    <td>RD$ {Number(p.precio).toFixed(2)}</td>
                    <td>{Number(p.existencia || 0).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => { setEditandoProducto({ ...p, itbis_porcentaje: Number(p.itbis_tasa ?? 0) * 100 }); setImagenEditPreview(''); setImagenEditFile(null); setQuickAddCat(false); setQuickAddSup(false); }}>✏ Editar</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => eliminarProducto(p.id).catch((e) => toast('error', e.message))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {modalProductosPage && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setModalProductosPage(false); setQuickAddCat(false); setQuickAddSup(false); } }}>
              <div className="modal-card modal-card-wide">
                <div className="modal-header">
                  <h3>Agregar Producto</h3>
                  <button className="btn btn-ghost" onClick={() => { setModalProductosPage(false); setQuickAddCat(false); setQuickAddSup(false); }}>✕ Cerrar</button>
                </div>
                {formProductoFields(nuevoProducto, (k, v) => setNuevoProducto((s: any) => ({ ...s, [k]: v })))}
                <div className="imagen-upload-area">
                  <label>Imagen del producto</label>
                  <div className="imagen-upload-row">
                    {imagenAddPreview
                      ? <div className="imagen-preview-wrap"><img src={imagenAddPreview} alt="Preview" className="imagen-preview" /><button className="btn-remove-img" onClick={() => { setImagenAddFile(null); setImagenAddPreview(''); }}>✕ Quitar</button></div>
                      : <div className="imagen-drop-zone"><span>📷 Sin imagen seleccionada</span></div>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} id="prod-add-img" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagenAddFile(f); setImagenAddPreview(URL.createObjectURL(f)); } }} />
                    <label htmlFor="prod-add-img" className="btn btn-ghost" style={{ cursor: 'pointer', alignSelf: 'center' }}>{imagenAddPreview ? '🔄 Cambiar' : '📂 Seleccionar'}</label>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => crearProducto().then(() => { setModalProductosPage(false); setQuickAddCat(false); setQuickAddSup(false); }).catch((e) => toast('error', e.message))}>✅ Guardar Producto</button>
              </div>
            </div>
          )}

          {editandoProducto && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditandoProducto(null); }}>
              <div className="modal-card modal-card-wide">
                <div className="modal-header">
                  <h3>Editar Producto — {editandoProducto.codigo}</h3>
                  <button className="btn btn-ghost" onClick={() => setEditandoProducto(null)}>✕ Cerrar</button>
                </div>
                {formProductoFields(editandoProducto, (k, v) => setEditandoProducto((s: any) => ({ ...s, [k]: v })))}
                <div className="imagen-upload-area">
                  <label>Imagen del producto</label>
                  <div className="imagen-upload-row">
                    {(imagenEditPreview || editandoProducto.imagen_url)
                      ? <div className="imagen-preview-wrap"><img src={imagenEditPreview || imgSrc(editandoProducto.imagen_url)} alt="Preview" className="imagen-preview" /><button className="btn-remove-img" onClick={() => { setImagenEditFile(null); setImagenEditPreview(''); setEditandoProducto((s: any) => ({ ...s, imagen_url: '' })); }}>✕ Quitar</button></div>
                      : <div className="imagen-drop-zone"><span>📷 Sin imagen</span></div>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} id="prod-edit-img" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagenEditFile(f); setImagenEditPreview(URL.createObjectURL(f)); } }} />
                    <label htmlFor="prod-edit-img" className="btn btn-ghost" style={{ cursor: 'pointer', alignSelf: 'center' }}>{(imagenEditPreview || editandoProducto.imagen_url) ? '🔄 Cambiar' : '📂 Seleccionar'}</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={() => editarProductoGuardar().catch((e) => toast('error', e.message))}>✅ Guardar cambios</button>
                  <button className="btn btn-ghost" onClick={() => { setEditandoProducto(null); setImagenEditFile(null); setImagenEditPreview(''); setQuickAddCat(false); setQuickAddSup(false); }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </article>
      )}

      {modulo === 'compras' && <article className="panel-card">
        <div className="panel-head">
          <h3>Compras</h3>
          <button className="btn btn-primary" onClick={() => setModalCompra(true)}>+ Registrar compra</button>
        </div>
        <h4>Historial compras</h4>
        <table className="table-premium"><thead><tr><th>Código</th><th>Suplidor</th><th>Sucursal</th><th>Factura</th><th>NCF</th><th>Total</th><th>Estado</th></tr></thead><tbody>{compras.map((c) => <tr key={c.id}><td>{c.codigo_compra}</td><td>{c.suplidor_nombre}</td><td>{c.sucursal_nombre}</td><td>{c.numero_factura}</td><td>{c.numero_ncf}</td><td>{Number(c.total).toFixed(2)}</td><td>{c.estado}</td></tr>)}</tbody></table>
      </article>}

      {modalCompra && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalCompra(false); }}>
          <div className="modal-card modal-card-wide">
            <div className="modal-header">
              <h3>Registrar compra</h3>
              <button className="btn btn-ghost" onClick={() => setModalCompra(false)}>✕ Cerrar</button>
            </div>
            <div className="quick-form" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              <select value={nuevaCompra.suplidor_id} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, suplidor_id: e.target.value }))}><option value="">Suplidor</option>{suplidores.map((s) => <option key={s.id} value={s.id}>{s.nombre_comercial}</option>)}</select>
              <select value={nuevaCompra.sucursal_id} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, sucursal_id: e.target.value }))}><option value="">Sucursal destino</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
              <input placeholder="Factura suplidor" value={nuevaCompra.numero_factura} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, numero_factura: e.target.value }))} />
              <input placeholder="NCF suplidor" value={nuevaCompra.numero_ncf} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, numero_ncf: e.target.value }))} />
              <input type="date" value={nuevaCompra.fecha_factura} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, fecha_factura: e.target.value }))} />
              <input type="date" value={nuevaCompra.fecha_vencimiento} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, fecha_vencimiento: e.target.value }))} />
              <select value={nuevaCompra.condicion_compra} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, condicion_compra: e.target.value }))}><option value="contado">Contado</option><option value="credito">Crédito</option></select>
              <input placeholder="Observaciones" value={nuevaCompra.observaciones} onChange={(e) => setNuevaCompra((s: any) => ({ ...s, observaciones: e.target.value }))} />
            </div>
            <div className="quick-form" style={{ gridTemplateColumns: '2fr repeat(4,1fr) auto' }}>
              <select value={itemCompra.producto_id} onChange={(e) => setItemCompra((s: any) => ({ ...s, producto_id: e.target.value }))}><option value="">Producto</option>{productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}</select>
              <input type="number" value={itemCompra.cantidad} onChange={(e) => setItemCompra((s: any) => ({ ...s, cantidad: Number(e.target.value) }))} />
              <input type="number" value={itemCompra.costo_unitario} onChange={(e) => setItemCompra((s: any) => ({ ...s, costo_unitario: Number(e.target.value) }))} />
              <input type="number" value={itemCompra.itbis_tasa} onChange={(e) => setItemCompra((s: any) => ({ ...s, itbis_tasa: Number(e.target.value) }))} />
              <input type="number" value={itemCompra.descuento_monto} onChange={(e) => setItemCompra((s: any) => ({ ...s, descuento_monto: Number(e.target.value) }))} />
              <button className="btn btn-ghost" onClick={() => { const p = productos.find((x) => x.id === itemCompra.producto_id); if (!p) return; setNuevaCompra((s: any) => ({ ...s, items: [...s.items, { ...itemCompra, descripcion: p.nombre }] })); }}>Agregar item</button>
            </div>
            <table className="table-premium"><thead><tr><th>Producto</th><th>Cant</th><th>Costo</th><th>ITBIS</th><th>Descuento</th><th></th></tr></thead><tbody>{nuevaCompra.items.map((i: any, idx: number) => <tr key={idx}><td>{i.descripcion}</td><td>{i.cantidad}</td><td>{i.costo_unitario}</td><td>{i.itbis_tasa}</td><td>{i.descuento_monto}</td><td><button className="btn btn-ghost" onClick={() => setNuevaCompra((s: any) => ({ ...s, items: s.items.filter((_: any, n: number) => n !== idx) }))}>Quitar</button></td></tr>)}</tbody></table>
            <button className="btn btn-primary" onClick={() => crearCompra().then(() => setModalCompra(false)).catch((e) => toast('error', e.message))}>Registrar compra</button>
          </div>
        </div>
      )}

      {modulo === 'inventario' && (
        !sucursalInvSeleccionada ? (
          <article className="panel-card">
            <h3>Inventario por Sucursal</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Selecciona una sucursal para ver su inventario de productos</p>
            <div className="sucursal-grid">
              {sucursales.map((s) => (
                <button key={s.id} className="sucursal-tile" onClick={() => setSucursalInvSeleccionada(s.id)}>
                  <span className="sucursal-icon">🏪</span>
                  <strong>{s.nombre}</strong>
                  <small>{s.codigo}</small>
                </button>
              ))}
            </div>
          </article>
        ) : (
          <article className="panel-card">
            <div className="panel-head">
              <h3>Inventario — {sucursales.find((s) => s.id === sucursalInvSeleccionada)?.nombre}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => { setNuevoProducto({ codigo: '', tipo: '', nombre: '', descripcion: '', marca: '', medida: '', costo: 0, lleva_itbis: true, margen: 0, precio: 0, itbis_porcentaje: 18, existencia_minima: 0, cantidad_a_ordenar: 0, ubicacion: '', categoria: '', codigo_barras: '', cuenta_contable: '', referencia: '', uso_notas: '', suplidor_principal_id: '', imagen_url: '' }); setImagenAddFile(null); setImagenAddPreview(''); setModalProductoInv(true); setQuickAddCat(false); setQuickAddSup(false); }}>+ Agregar Producto</button>
                <button className="btn btn-ghost" onClick={() => setSucursalInvSeleccionada('')}>← Volver</button>
              </div>
            </div>
            <table className="table-premium">
              <thead><tr><th></th><th>Código</th><th>Descripción</th><th>Marca</th><th>Medida</th><th>Ubicación</th><th>Precio</th><th>Existencia</th><th>Acciones</th></tr></thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 44 }}>
                      {p.imagen_url
                        ? <img src={imgSrc(p.imagen_url)} alt={p.nombre} className="prod-img-thumb" />
                        : <div className="prod-img-placeholder">🔩</div>}
                    </td>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.marca || '-'}</td>
                    <td>{p.medida || '-'}</td>
                    <td>{p.ubicacion || '-'}</td>
                    <td>RD$ {Number(p.precio).toFixed(2)}</td>
                    <td>{Number(p.existencia || 0).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => { setEditandoProducto({ ...p, itbis_porcentaje: Number(p.itbis_tasa ?? 0) * 100 }); setImagenEditPreview(''); setImagenEditFile(null); setQuickAddCat(false); setQuickAddSup(false); }}>✏ Editar</button>
                        <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => eliminarProducto(p.id).catch((e) => toast('error', e.message))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {modalProductoInv && (
              <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setModalProductoInv(false); setQuickAddCat(false); setQuickAddSup(false); } }}>
                <div className="modal-card modal-card-wide">
                  <div className="modal-header">
                    <h3>Agregar Producto al Inventario</h3>
                    <button className="btn btn-ghost" onClick={() => { setModalProductoInv(false); setQuickAddCat(false); setQuickAddSup(false); }}>✕ Cerrar</button>
                  </div>
                  {formProductoFields(nuevoProducto, (k, v) => setNuevoProducto((s: any) => ({ ...s, [k]: v })))}
                  <div className="imagen-upload-area">
                    <label>Imagen del producto</label>
                    <div className="imagen-upload-row">
                      {imagenAddPreview
                        ? <div className="imagen-preview-wrap"><img src={imagenAddPreview} alt="Preview" className="imagen-preview" /><button className="btn-remove-img" onClick={() => { setImagenAddFile(null); setImagenAddPreview(''); }}>✕ Quitar</button></div>
                        : <div className="imagen-drop-zone"><span>📷 Haz clic para seleccionar imagen</span></div>}
                      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} id="add-imagen-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagenAddFile(f); setImagenAddPreview(URL.createObjectURL(f)); } }} />
                      <label htmlFor="add-imagen-input" className="btn btn-ghost" style={{ cursor: 'pointer', alignSelf: 'center' }}>{imagenAddPreview ? '🔄 Cambiar' : '📂 Seleccionar'}</label>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => crearProducto().then(() => { setModalProductoInv(false); setQuickAddCat(false); setQuickAddSup(false); }).catch((e) => toast('error', e.message))}>✅ Guardar Producto</button>
                </div>
              </div>
            )}

            {editandoProducto && (
              <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditandoProducto(null); }}>
                <div className="modal-card modal-card-wide">
                  <div className="modal-header">
                    <h3>Editar Producto — {editandoProducto.codigo}</h3>
                    <button className="btn btn-ghost" onClick={() => setEditandoProducto(null)}>✕ Cerrar</button>
                  </div>
                  {formProductoFields(editandoProducto, (k, v) => setEditandoProducto((s: any) => ({ ...s, [k]: v })))}
                  <div className="imagen-upload-area">
                    <label>Imagen del producto</label>
                    <div className="imagen-upload-row">
                      {(imagenEditPreview || editandoProducto.imagen_url)
                        ? <div className="imagen-preview-wrap"><img src={imagenEditPreview || imgSrc(editandoProducto.imagen_url)} alt="Preview" className="imagen-preview" /><button className="btn-remove-img" onClick={() => { setImagenEditFile(null); setImagenEditPreview(''); setEditandoProducto((s: any) => ({ ...s, imagen_url: '' })); }}>✕ Quitar</button></div>
                        : <div className="imagen-drop-zone"><span>📷 Sin imagen</span></div>}
                      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} id="edit-imagen-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagenEditFile(f); setImagenEditPreview(URL.createObjectURL(f)); } }} />
                      <label htmlFor="edit-imagen-input" className="btn btn-ghost" style={{ cursor: 'pointer', alignSelf: 'center' }}>{(imagenEditPreview || editandoProducto.imagen_url) ? '🔄 Cambiar' : '📂 Seleccionar'}</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={() => editarProductoGuardar().catch((e) => toast('error', e.message))}>✅ Guardar cambios</button>
                    <button className="btn btn-ghost" onClick={() => { setEditandoProducto(null); setImagenEditFile(null); setImagenEditPreview(''); setQuickAddCat(false); setQuickAddSup(false); }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </article>
        )
      )}

      {modulo === 'maestros' && (
        <div className="maestros-grid">
          <article className="panel-card">
            <div className="panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>🏪</span>
                <div><h3 style={{ margin: 0 }}>Sucursales</h3><p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{sucursales.length} registradas</p></div>
              </div>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setNuevaSucursal({ codigo: '', nombre: '', direccion: '', telefono: '' })}>+ Nueva</button>
            </div>
            <div className="maestro-form">
              <div><label>Código</label><input placeholder="Ej: SUC-01" value={nuevaSucursal.codigo} onChange={(e) => setNuevaSucursal((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
              <div><label>Nombre *</label><input placeholder="Nombre de la sucursal" value={nuevaSucursal.nombre} onChange={(e) => setNuevaSucursal((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
              <div><label>Dirección</label><input placeholder="Dirección física" value={nuevaSucursal.direccion} onChange={(e) => setNuevaSucursal((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
              <div><label>Teléfono</label><input placeholder="809-000-0000" value={nuevaSucursal.telefono} onChange={(e) => setNuevaSucursal((s: any) => ({ ...s, telefono: e.target.value }))} /></div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => crearSucursal().catch((e) => toast('error', e.message))}>Guardar</button>
            </div>
            <div className="maestro-list">
              {sucursales.length === 0 && <p className="empty">Sin sucursales registradas</p>}
              {sucursales.map((s) => (
                <div key={s.id} className="maestro-item">
                  <div className="maestro-item-icon">🏪</div>
                  <div className="maestro-item-info">
                    <strong>{s.nombre}</strong>
                    <span>{s.codigo}{s.direccion ? ` · ${s.direccion}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div className="panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>🏷️</span>
                <div><h3 style={{ margin: 0 }}>Categorías</h3><p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{categorias.length} registradas</p></div>
              </div>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setNuevaCategoria({ codigo: '', nombre: '', descripcion: '' })}>+ Nueva</button>
            </div>
            <div className="maestro-form">
              <div><label>Código</label><input placeholder="Ej: CAT-01" value={nuevaCategoria.codigo} onChange={(e) => setNuevaCategoria((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
              <div><label>Nombre *</label><input placeholder="Nombre de la categoría" value={nuevaCategoria.nombre} onChange={(e) => setNuevaCategoria((s: any) => ({ ...s, nombre: e.target.value }))} /></div>
              <div style={{ gridColumn: 'span 2' }}><label>Descripción</label><input placeholder="Descripción opcional" value={nuevaCategoria.descripcion} onChange={(e) => setNuevaCategoria((s: any) => ({ ...s, descripcion: e.target.value }))} /></div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => crearCategoria().catch((e) => toast('error', e.message))}>Guardar</button>
            </div>
            <div className="maestro-list">
              {categorias.length === 0 && <p className="empty">Sin categorías registradas</p>}
              {categorias.map((c) => (
                <div key={c.id} className="maestro-item">
                  <div className="maestro-item-icon">🏷️</div>
                  <div className="maestro-item-info">
                    <strong>{c.nombre}</strong>
                    <span>{c.codigo || 'Sin código'}{c.descripcion ? ` · ${c.descripcion}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div className="panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>🏭</span>
                <div><h3 style={{ margin: 0 }}>Suplidores</h3><p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{suplidores.length} registrados</p></div>
              </div>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setNuevoSuplidor({ codigo: '', nombre_comercial: '', razon_social: '', rnc_cedula: '', telefono: '', correo: '', direccion: '', contacto: '', observaciones: '' })}>+ Nuevo</button>
            </div>
            <div className="maestro-form">
              <div><label>Código</label><input placeholder="Ej: SUP-001" value={nuevoSuplidor.codigo} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, codigo: e.target.value }))} /></div>
              <div><label>Nombre comercial *</label><input placeholder="Nombre del suplidor" value={nuevoSuplidor.nombre_comercial} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, nombre_comercial: e.target.value }))} /></div>
              <div><label>RNC / Cédula</label><input placeholder="000-0000000-0" value={nuevoSuplidor.rnc_cedula} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, rnc_cedula: e.target.value }))} /></div>
              <div><label>Teléfono</label><input placeholder="809-000-0000" value={nuevoSuplidor.telefono} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, telefono: e.target.value }))} /></div>
              <div><label>Correo electrónico</label><input placeholder="contacto@empresa.com" value={nuevoSuplidor.correo} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, correo: e.target.value }))} /></div>
              <div><label>Persona de contacto</label><input placeholder="Nombre del representante" value={nuevoSuplidor.contacto} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, contacto: e.target.value }))} /></div>
              <div style={{ gridColumn: 'span 2' }}><label>Dirección</label><input placeholder="Dirección física del suplidor" value={nuevoSuplidor.direccion} onChange={(e) => setNuevoSuplidor((s: any) => ({ ...s, direccion: e.target.value }))} /></div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => crearSuplidor().catch((e) => toast('error', e.message))}>Guardar</button>
            </div>
            <div className="maestro-list">
              {suplidores.length === 0 && <p className="empty">Sin suplidores registrados</p>}
              {suplidores.map((s) => (
                <div key={s.id} className="maestro-item">
                  <div className="maestro-item-icon">🏭</div>
                  <div className="maestro-item-info">
                    <strong>{s.nombre_comercial}</strong>
                    <span>{s.codigo ? `${s.codigo} · ` : ''}{s.telefono || ''}{s.correo ? ` · ${s.correo}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditandoSuplidor({ ...s })}>Editar</button>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--rojo-600)' }} onClick={() => eliminarSuplidor(s.id).catch((e) => toast('error', e.message))}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {editandoSuplidor && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditandoSuplidor(null); }}>
          <div className="modal-card modal-card-wide">
            <div className="modal-header">
              <h3>Editar Suplidor — {editandoSuplidor.codigo || editandoSuplidor.id}</h3>
              <button className="btn btn-ghost" onClick={() => setEditandoSuplidor(null)}>✕ Cerrar</button>
            </div>
            <div className="quick-form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div><label>Código</label><input value={editandoSuplidor.codigo || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, codigo: e.target.value }))} /></div>
              <div><label>Nombre comercial *</label><input value={editandoSuplidor.nombre_comercial || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, nombre_comercial: e.target.value }))} /></div>
              <div><label>RNC / Cédula</label><input value={editandoSuplidor.rnc_cedula || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, rnc_cedula: e.target.value }))} /></div>
              <div><label>Teléfono</label><input value={editandoSuplidor.telefono || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, telefono: e.target.value }))} /></div>
              <div><label>Correo</label><input value={editandoSuplidor.correo || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, correo: e.target.value }))} /></div>
              <div><label>Contacto</label><input value={editandoSuplidor.contacto || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, contacto: e.target.value }))} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label>Dirección</label><input value={editandoSuplidor.direccion || ''} onChange={(e) => setEditandoSuplidor((x: any) => ({ ...x, direccion: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => editarSuplidor().catch((e) => toast('error', e.message))}>Guardar cambios</button>
              <button className="btn btn-ghost" onClick={() => setEditandoSuplidor(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modulo === 'usuarios' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Empleados del Sistema</h3>
            <button className="btn btn-primary" onClick={() => setModalUsuario(true)}>+ Registro de Usuario</button>
          </div>
          <table className="table-premium">
            <thead><tr><th>Usuario</th><th>Nombre completo</th><th>Rol</th><th>Sucursal</th><th>Acciones</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.nombre_completo}</td>
                  <td><span className="chip chip-user">{u.rol}</span></td>
                  <td>{u.sucursales || '-'}</td>
                  <td><button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => setEditandoUsuario({ ...u, password: '' })}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalUsuario && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalUsuario(false); }}>
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Registro de Usuario</h3>
                  <button className="btn btn-ghost" onClick={() => setModalUsuario(false)}>✕ Cerrar</button>
                </div>
                <div className="quick-form" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                  <div>
                    <label>Nombre de usuario (login)</label>
                    <input placeholder="Ej: juan.perez — sin espacios ni tildes" value={nuevoUsuario.username} onChange={(e) => setNuevoUsuario((s: any) => ({ ...s, username: e.target.value }))} />
                  </div>
                  <div>
                    <label>Nombre completo del empleado</label>
                    <input placeholder="Ej: Juan Pérez García" value={nuevoUsuario.nombre_completo} onChange={(e) => setNuevoUsuario((s: any) => ({ ...s, nombre_completo: e.target.value }))} />
                  </div>
                  <div>
                    <label>Contraseña inicial</label>
                    <input type="password" placeholder="Mínimo 4 caracteres" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario((s: any) => ({ ...s, password: e.target.value }))} />
                  </div>
                  <div>
                    <label>Rol / Permiso en el sistema</label>
                    <select value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario((s: any) => ({ ...s, rol: e.target.value }))}>
                      {roles.map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
                    </select>
                    <small style={{ color: 'var(--muted)', fontSize: 11 }}>vendedor: solo POS · cajero: POS + cobros · administrador: acceso total</small>
                  </div>
                  <div>
                    <label>Sucursal asignada</label>
                    <select value={nuevoUsuario.sucursal_id} onChange={(e) => setNuevoUsuario((s: any) => ({ ...s, sucursal_id: e.target.value }))}>
                      <option value="">Sin sucursal fija</option>
                      {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => crearUsuario().then(() => setModalUsuario(false)).catch((e) => toast('error', e.message))}>Crear Usuario</button>
                  </div>
                </div>
                <hr style={{ margin: '16px 0', borderColor: '#edf0f6' }} />
                <h4 style={{ margin: '0 0 10px', color: 'var(--azul-800)' }}>Empleados registrados</h4>
                <table className="table-premium">
                  <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Sucursal</th></tr></thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.nombre_completo}</td>
                        <td><span className="chip chip-user">{u.rol}</span></td>
                        <td>{u.sucursales || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </article>
      )}

      {editandoUsuario && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditandoUsuario(null); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Editar usuario</h3>
              <button className="btn btn-ghost" onClick={() => setEditandoUsuario(null)}>✕ Cerrar</button>
            </div>
            <div className="quick-form" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <div>
                <label>Usuario (login)</label>
                <input value={editandoUsuario.username || ''} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, username: e.target.value }))} />
              </div>
              <div>
                <label>Nombre completo</label>
                <input value={editandoUsuario.nombre_completo || ''} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, nombre_completo: e.target.value }))} />
              </div>
              <div>
                <label>Nueva contraseña (opcional)</label>
                <input type="password" value={editandoUsuario.password || ''} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, password: e.target.value }))} placeholder="Dejar vacío para mantener" />
              </div>
              <div>
                <label>Rol</label>
                <select value={editandoUsuario.rol || 'vendedor'} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, rol: e.target.value }))}>
                  {roles.map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <label>Sucursal</label>
                <select value={editandoUsuario.sucursal_id || ''} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, sucursal_id: e.target.value }))}>
                  <option value="">Sin sucursal fija</option>
                  {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label>Estado</label>
                <select value={editandoUsuario.estado || 'activo'} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, estado: e.target.value }))}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a', marginTop: 12 }}>
              <input type="checkbox" id="puede-fidelidad" checked={!!editandoUsuario.puede_agregar_fidelidad} onChange={(e) => setEditandoUsuario((s: any) => ({ ...s, puede_agregar_fidelidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }} />
              <label htmlFor="puede-fidelidad" style={{ cursor: 'pointer', fontWeight: 600, color: '#92400e', margin: 0 }}>⭐ Puede agregar clientes al programa de Fidelidad desde el POS</label>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => actualizarUsuario().catch((e) => toast('error', e.message))}>Guardar cambios</button>
              <button className="btn btn-ghost" onClick={() => setEditandoUsuario(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modulo === 'importador' && <article className="panel-card"><h3>Importar base SQL legada</h3>
        <p>Sube un archivo .sql y migra los datos al sistema de forma segura</p>
        <p>Ruta: <strong>/admin/importar-sql-legado</strong></p>
        <p>Motor actual: <strong>{importMeta?.motor_actual || 'sqlite'}</strong>. El importador parsea SQL Server legacy sin ejecutar DDL peligroso.</p>
        <div className="quick-form" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          <input value={sqlNombre} onChange={(e) => setSqlNombre(e.target.value)} placeholder="Nombre archivo" />
          <input type="file" accept=".sql,text/plain" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setSqlNombre(f.name);
            setSqlFile(f);
            if (f.size <= 8 * 1024 * 1024) {
              setSqlContenido(await f.text());
            } else {
              setSqlContenido('');
            }
          }} />
          <button className="btn btn-primary" disabled={subiendoSql || (!sqlFile && !sqlContenido.trim())} onClick={() => analizarSqlLegado().catch((e) => toast('error', e.message))}>{subiendoSql ? `Subiendo ${uploadProgreso}%` : 'Analizar SQL'}</button>
        </div>
        {sqlFile && <p style={{ marginTop: 8 }}>Archivo seleccionado: <strong>{sqlFile.name}</strong> · {(sqlFile.size / (1024 * 1024)).toFixed(2)} MB {sqlFile.size > 8 * 1024 * 1024 ? '(modo chunked)' : '(modo directo)'}</p>}
        {subiendoSql && <progress max={100} value={uploadProgreso} style={{ width: '100%' }} />}

        <div className="quick-form" style={{ gridTemplateColumns: '1fr auto auto auto auto auto auto auto auto' }}>
          <select value={jobSeleccionado} onChange={(e) => setJobSeleccionado(e.target.value)}>
            <option value="">Seleccionar job</option>
            {importJobs.map((j) => <option key={j.id} value={j.id}>{j.nombre_archivo} · {j.estado}</option>)}
          </select>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => verPreviewJob(jobSeleccionado).catch((e) => toast('error', e.message))}>Vista previa</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, true, ['all']).catch((e) => toast('error', e.message))}>Dry run</button>
          <button className="btn btn-primary" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['all']).catch((e) => toast('error', e.message))}>Importar todo</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['clientes']).catch((e) => toast('error', e.message))}>Clientes</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['suplidores']).catch((e) => toast('error', e.message))}>Suplidores</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['productos']).catch((e) => toast('error', e.message))}>Productos</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['compras']).catch((e) => toast('error', e.message))}>Compras</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => ejecutarImport(jobSeleccionado, false, ['ventas']).catch((e) => toast('error', e.message))}>Ventas</button>
        </div>

        <div className="quick-form" style={{ gridTemplateColumns: 'auto auto auto' }}>
          <button className="btn btn-success" disabled={!jobSeleccionado} onClick={() => confirmarJob(jobSeleccionado).catch((e) => toast('error', e.message))}>Confirmar importación</button>
          <button className="btn btn-danger" disabled={!jobSeleccionado} onClick={() => deshacerJob(jobSeleccionado).catch((e) => toast('error', e.message))}>Deshacer última importación</button>
          <button className="btn btn-ghost" disabled={!jobSeleccionado} onClick={() => descargarLog(jobSeleccionado).catch((e) => toast('error', e.message))}>Descargar log</button>
        </div>

        {importPreview && <>
          <h4>Resumen análisis</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{importPreview.job?.resumen_json}</pre>
          <h4>Tablas detectadas</h4>
          <table className="table-premium"><thead><tr><th>Tabla</th><th>Destino</th><th>Filas</th></tr></thead><tbody>{importPreview.tablas?.map((t: any, i: number) => <tr key={i}><td>{t.tabla_legacy}</td><td>{t.tabla_destino || 'pendiente'}</td><td>{t.cantidad}</td></tr>)}</tbody></table>
          <h4>Duplicados potenciales</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(importPreview.duplicados_potenciales || [], null, 2)}</pre>
        </>}

        {resultadoImport && <>
          <h4>Resultado importación</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(resultadoImport, null, 2)}</pre>
        </>}
      </article>}

      {modulo === 'reportes' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Centro de Reportes</h3>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Reportes operativos del sistema</p>
          </div>
          <div className="reporte-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            {Object.entries(reportes).map(([k, rows]) => (
              <button key={k} className={`reporte-btn ${reporteActivo === k ? 'activo' : ''}`} onClick={() => setReporteActivo(reporteActivo === k ? '' : k)}>
                <span className="reporte-icon">{REPORTE_ICONS[k] ?? '📊'}</span>
                <strong>{REPORTE_LABELS[k] ?? k.replace(/-/g, ' ')}</strong>
                <span className="reporte-count">{(rows as any[]).length} registros</span>
              </button>
            ))}
          </div>
          {reporteActivo && reportes[reporteActivo] && (
            <div className="reporte-data">
              <div className="panel-head" style={{ marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>{REPORTE_LABELS[reporteActivo] ?? reporteActivo.replace(/-/g, ' ')} — {reportes[reporteActivo].length} registros</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => cargarTodo().catch((e) => toast('error', e.message))}>🔄 Actualizar</button>
                  <button className="btn btn-primary" onClick={exportarReportePdf}>📄 Exportar PDF</button>
                  <button className="btn btn-ghost" onClick={() => setReporteActivo('')}>✕ Cerrar</button>
                </div>
              </div>
              <ReporteTabla filas={reportes[reporteActivo] as any[]} />
            </div>
          )}
        </article>
      )}

      {modulo === 'contabilidad' && (
        <div>
          <div className="contab-kpi-row">
            <div className="contab-kpi azul"><span>💰 Total ventas</span><strong>RD$ {ventasAll.reduce((a, v) => a + Number(v.total ?? 0), 0).toFixed(2)}</strong></div>
            <div className="contab-kpi verde"><span>✅ Ventas contado</span><strong>RD$ {ventasAll.filter((v) => v.tipo_venta === 'contado').reduce((a, v) => a + Number(v.total ?? 0), 0).toFixed(2)}</strong></div>
            <div className="contab-kpi naranja"><span>📒 Ventas crédito</span><strong>RD$ {ventasAll.filter((v) => v.tipo_venta === 'credito').reduce((a, v) => a + Number(v.total ?? 0), 0).toFixed(2)}</strong></div>
            <div className="contab-kpi rojo"><span>🧮 Total compras</span><strong>RD$ {compras.reduce((a, c) => a + Number(c.total ?? 0), 0).toFixed(2)}</strong></div>
            <div className="contab-kpi morado"><span>📦 Registros ventas</span><strong>{ventasAll.length}</strong></div>
            <div className="contab-kpi gris"><span>💹 Beneficio</span><strong>RD$ {ventasAll.reduce((a, v) => a + Number(v.beneficio ?? 0), 0).toFixed(2)}</strong></div>
          </div>

          <div className="contab-tabs">
            {(['cuadres', 'ventas', 'compras'] as const).map((t) => (
              <button key={t} className={`contab-tab ${tabContabilidad === t ? 'activo' : ''}`} onClick={() => setTabContabilidad(t)}>
                {t === 'cuadres' ? '⚖️ Cuadres de Caja' : t === 'ventas' ? '🧾 Ingresos / Ventas' : '🧮 Egresos / Compras'}
                <span className="contab-tab-count">{t === 'cuadres' ? cuadres.length : t === 'ventas' ? ventasAll.length : compras.length}</span>
              </button>
            ))}
          </div>

          <article className="panel-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {tabContabilidad === 'cuadres' && (
              <>
                <div className="panel-head" style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: 0 }}>Cuadres de caja — Historial</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="chip chip-warning">{cuadres.filter((c) => Math.abs(Number(c.diferencia ?? 0)) > 0).length} inconsistentes</span>
                    <span className="chip chip-lan">{cuadres.filter((c) => Math.abs(Number(c.diferencia ?? 0)) === 0).length} normales</span>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead><tr><th>Número</th><th>Cajero</th><th>Sucursal</th><th>Contado</th><th>Esperado</th><th>Diferencia</th><th>Estado</th><th>Fecha</th></tr></thead>
                    <tbody>
                      {cuadres.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No hay cuadres registrados aún</td></tr>
                      : cuadres.map((c) => {
                        const dif = Number(c.diferencia ?? 0);
                        const inconsistente = Math.abs(dif) > 0;
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.numero_cuadre || c.id?.substring(0, 8)}</strong></td>
                            <td>{c.cajero_nombre || '-'}</td>
                            <td>{c.sucursal_nombre || '-'}</td>
                            <td>RD$ {Number(c.total_contado ?? 0).toFixed(2)}</td>
                            <td>RD$ {Number(c.total_esperado ?? 0).toFixed(2)}</td>
                            <td style={{ color: inconsistente ? 'var(--rojo-600)' : 'var(--success)', fontWeight: 700 }}>{dif >= 0 ? '+' : ''}{dif.toFixed(2)}</td>
                            <td><span className={`chip ${inconsistente ? 'chip-warning' : 'chip-lan'}`}>{inconsistente ? '⚠ Inconsistente' : '✓ Normal'}</span></td>
                            <td>{c.fecha_cierre ? String(c.fecha_cierre).substring(0, 10) : c.fecha_creacion ? String(c.fecha_creacion).substring(0, 10) : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tabContabilidad === 'ventas' && (
              <>
                <div className="panel-head" style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: 0 }}>Ingresos — Todas las ventas</h4>
                  <span className="chip chip-lan">{ventasAll.length} registros</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Tipo</th><th>Forma pago</th><th>Subtotal</th><th>ITBIS</th><th>Descuento</th><th>Total</th><th>Beneficio</th><th>Estado</th></tr></thead>
                    <tbody>
                      {ventasAll.length === 0 ? <tr><td colSpan={12} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No hay ventas registradas</td></tr>
                      : ventasAll.map((v) => (
                        <tr key={v.id}>
                          <td><strong>{v.numero_interno || v.id?.substring(0, 8)}</strong></td>
                          <td>{v.fecha_creacion ? String(v.fecha_creacion).substring(0, 10) : '-'}</td>
                          <td>{v.cliente_nombre || '-'}</td>
                          <td>{v.vendedor_nombre || '-'}</td>
                          <td><span className={`chip ${v.tipo_venta === 'credito' ? 'chip-warning' : 'chip-lan'}`}>{v.tipo_venta}</span></td>
                          <td>{v.forma_pago || '-'}</td>
                          <td>RD$ {Number(v.subtotal ?? 0).toFixed(2)}</td>
                          <td>RD$ {Number(v.itbis_total ?? 0).toFixed(2)}</td>
                          <td style={{ color: Number(v.descuento_total) > 0 ? 'var(--success)' : undefined }}>- RD$ {Number(v.descuento_total ?? 0).toFixed(2)}</td>
                          <td><strong>RD$ {Number(v.total ?? 0).toFixed(2)}</strong></td>
                          <td style={{ color: Number(v.beneficio ?? 0) < 0 ? 'var(--rojo-600)' : 'var(--success)', fontWeight: 700 }}>RD$ {Number(v.beneficio ?? 0).toFixed(2)}</td>
                          <td><span className={`chip ${v.estado === 'anulada' ? 'chip-sync' : v.estado === 'cobrada' ? 'chip-lan' : 'chip-soft'}`}>{v.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tabContabilidad === 'compras' && (
              <>
                <div className="panel-head" style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: 0 }}>Egresos — Todas las compras</h4>
                  <span className="chip chip-warning">{compras.length} registros</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead><tr><th>Factura</th><th>Fecha</th><th>Suplidor</th><th>Sucursal</th><th>Condición</th><th>Estado pago</th><th>Subtotal</th><th>ITBIS</th><th>Total</th></tr></thead>
                    <tbody>
                      {compras.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No hay compras registradas</td></tr>
                      : compras.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.numero_factura || c.id?.substring(0, 8)}</strong></td>
                          <td>{c.fecha_factura ? String(c.fecha_factura).substring(0, 10) : '-'}</td>
                          <td>{c.suplidor_nombre || '-'}</td>
                          <td>{c.sucursal_nombre || '-'}</td>
                          <td>{c.condicion_compra || '-'}</td>
                          <td><span className={`chip ${c.estado_pago === 'pagado' ? 'chip-lan' : 'chip-warning'}`}>{c.estado_pago}</span></td>
                          <td>RD$ {Number(c.subtotal ?? 0).toFixed(2)}</td>
                          <td>RD$ {Number(c.itbis_total ?? 0).toFixed(2)}</td>
                          <td><strong>RD$ {Number(c.total ?? 0).toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </article>
        </div>
      )}

      {modulo === 'admin-dashboard' && (
        <div className="panel-grid">
          <article className="panel-card span-8">
            <h3>Resumen del día</h3>
            <div className="stats-grid">
              <div className="stat-box"><span>Ventas pendientes</span><strong>{kpis.ventas_pendientes ?? 0}</strong></div>
              <div className="stat-box"><span>Caja esperada</span><strong>RD$ {Number(kpis.caja_esperada ?? 0).toFixed(2)}</strong></div>
              <div className="stat-box"><span>Ventas a crédito</span><strong>RD$ {Number(kpis.ventas_credito ?? 0).toFixed(2)}</strong></div>
              <div className="stat-box"><span>Cobros del día</span><strong>RD$ {Number(kpis.cobros_total ?? 0).toFixed(2)}</strong></div>
              <div className="stat-box"><span>Beneficio del día</span><strong>RD$ {Number(adminResumen.beneficio_dia ?? 0).toFixed(2)}</strong></div>
              <div className="stat-box"><span>Ventas cobradas hoy</span><strong>{Number(adminResumen.cobradas_dia?.cantidad ?? 0)}</strong></div>
            </div>
            <h4 style={{ marginTop: 16 }}>Productos en bajo stock</h4>
            <table className="table-premium">
              <thead><tr><th>Código</th><th>Producto</th><th>Existencia</th><th>Categoría</th></tr></thead>
              <tbody>
                {(adminResumen.productos_bajo_stock ?? []).length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>Sin alertas de bajo stock</td></tr>
                  : (adminResumen.productos_bajo_stock ?? []).map((p: any) => (
                    <tr key={p.codigo}>
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td style={{ color: 'var(--rojo-600)', fontWeight: 700 }}>{Number(p.existencia ?? 0).toFixed(2)}</td>
                      <td>{p.categoria || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </article>
          <article className="panel-card span-4">
            <h3>Accesos rápidos</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => cambiarModuloConRuta('pos')}>🧾 Ir al POS</button>
              <button className="btn btn-ghost" onClick={() => cambiarModuloConRuta('cxc')}>📒 Cuentas por cobrar</button>
              <button className="btn btn-ghost" onClick={() => cambiarModuloConRuta('contabilidad')}>🏦 Ver cuadres</button>
              <button className="btn btn-ghost" onClick={() => cambiarModuloConRuta('historial-ventas')}>🗂️ Historial de ventas</button>
              <button className="btn btn-ghost" onClick={() => cambiarModuloConRuta('importador')}>🧬 Importar SQL</button>
            </div>
          </article>
        </div>
      )}

      {modulo === 'historial-ventas' && (
        <article className="panel-card">
          <div className="panel-head">
            <h3>Historial de Ventas</h3>
            <span className="chip chip-lan">{historialVentas.length} registros</span>
          </div>
          <table className="table-premium">
            <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Tipo</th><th>Total</th><th>Beneficio</th><th>Estado</th></tr></thead>
            <tbody>
              {historialVentas.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>No hay ventas registradas</td></tr> : historialVentas.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.numero_interno || v.id?.substring(0, 8)}</strong></td>
                  <td>{v.fecha_creacion ? String(v.fecha_creacion).substring(0, 10) : '-'}</td>
                  <td>{v.cliente_nombre || '-'}</td>
                  <td>{v.vendedor_nombre || '-'}</td>
                  <td>{v.tipo_venta}</td>
                  <td>RD$ {Number(v.total ?? 0).toFixed(2)}</td>
                  <td style={{ color: Number(v.beneficio ?? 0) < 0 ? 'var(--rojo-600)' : 'var(--success)', fontWeight: 700 }}>RD$ {Number(v.beneficio ?? 0).toFixed(2)}</td>
                  <td>{v.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </Layout>
    <div className="toast-stack">{toasts.map((t) => <div key={t.id} className={`toast ${t.tipo}`}>{t.texto}</div>)}</div>
  </>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
