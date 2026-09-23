import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Menu, KeyRound, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { CATEGORIES } from './data/actions';
import { buildOperations } from './lib/spec';
import { callApi, loadToken, saveToken } from './lib/api';
import { clearLookupCache } from './lib/lookups';
import Sidebar from './components/Sidebar';
import ActionView from './components/ActionView';
import ConnectionForm from './components/ConnectionForm';
import { Home, CategoryView } from './components/Home';
import './index.css';

const MOBILE_QUERY = '(max-width: 900px)';

function parseHash(hash, ops) {
  const [, kind, rest] = hash.replace(/^#/, '').split('/');
  if (kind === 'accion' && rest) {
    const op = ops.find((o) => o.key === decodeURIComponent(rest));
    if (op) return { name: 'action', op };
  }
  if (kind === 'cat' && rest) {
    const cat = CATEGORIES.find((c) => c.id === rest);
    if (cat) return { name: 'category', cat: cat.id };
  }
  return { name: 'home' };
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function App() {
  const [spec, setSpec] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [hash, setHash] = useState(window.location.hash);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [sidebarOpen, setSidebarOpen] = useState(!window.matchMedia(MOBILE_QUERY).matches);
  const [connOpen, setConnOpen] = useState(false);

  // Conexión
  const [token, setToken] = useState(loadToken);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState(token ? 'checking' : 'none');

  useEffect(() => {
    axios.get('/document.json')
      .then((res) => setSpec(res.data))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const testToken = useCallback(async (value) => {
    setStatus('checking');
    const res = await callApi({ path: '/channels', token: value });
    if (res.ok) setStatus('ok');
    else if (res.status === 401) setStatus('invalid');
    else if (res.status === 403) setStatus('limited');
    else if (res.status === 0 || res.status >= 500) setStatus('error');
    else setStatus('ok');
  }, []);

  // Comprueba la clave guardada al abrir la página.
  useEffect(() => {
    if (token) testToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = (value, rememberIt) => {
    clearLookupCache();
    setToken(value);
    setRemember(rememberIt);
    saveToken(value, rememberIt);
    testToken(value);
  };

  const disconnect = () => {
    clearLookupCache();
    setToken('');
    saveToken('', false);
    setStatus('none');
  };

  const ops = useMemo(() => (spec ? buildOperations(spec) : []), [spec]);
  const route = useMemo(() => parseHash(hash, ops), [hash, ops]);
  const connected = status === 'ok' || status === 'limited';

  const navigate = (to) => {
    window.location.hash = to;
    if (isMobile) setSidebarOpen(false);
    document.querySelector('.main-scroll')?.scrollTo({ top: 0 });
  };

  // Cierra el menú al pasar a pantalla de celular.
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (prevMobile !== isMobile) {
    setPrevMobile(isMobile);
    setSidebarOpen(!isMobile);
  }

  const connection = { token, status, remember, onConnect: (v, r) => { connect(v, r); }, onDisconnect: disconnect };

  if (loadError) {
    return (
      <div className="center-screen">
        <div className="card result-error">
          <XCircle size={32} aria-hidden="true" />
          <h1>No pudimos abrir el panel</h1>
          <p>Falta el archivo de configuración de Botmaker. Avisa a la persona que instaló el panel.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Volver a intentar</button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="center-screen" role="status">
        <Loader2 size={40} className="spin" aria-hidden="true" />
        <p>Cargando el panel…</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        ops={ops}
        route={{ ...route, op: route.op }}
        open={sidebarOpen}
        isMobile={isMobile}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />
      {isMobile && sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <div className="main-wrapper">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            <Menu size={22} />
            <span className="menu-label">Menú</span>
          </button>
          <button type="button" className={`conn-pill status-${status}`} onClick={() => setConnOpen(!connOpen)} aria-expanded={connOpen}>
            <StatusIcon status={status} />
            <span>{statusText(status)}</span>
          </button>
        </header>

        {connOpen && (
          <div className="conn-panel card" role="region" aria-label="Conexión con Botmaker">
            <h2><KeyRound size={18} aria-hidden="true" /> Conexión con Botmaker</h2>
            <ConnectionForm {...connection} onConnect={(v, r) => { connect(v, r); }} />
            <button type="button" className="link-btn" onClick={() => setConnOpen(false)}>Cerrar</button>
          </div>
        )}

        <main className="main-scroll">
          {route.name === 'action' && (
            <ActionView
              key={route.op.key}
              spec={spec}
              op={route.op}
              token={token}
              connected={connected}
              onOpenConnection={() => { setConnOpen(true); window.scrollTo({ top: 0 }); document.querySelector('.main-scroll')?.scrollTo({ top: 0 }); }}
              onNavigate={navigate}
            />
          )}
          {route.name === 'category' && (
            <CategoryView cat={CATEGORIES.find((c) => c.id === route.cat)} ops={ops} onNavigate={navigate} />
          )}
          {route.name === 'home' && (
            <Home ops={ops} connected={connected} connection={connection} onNavigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
}

function statusText(status) {
  return {
    none: 'Sin conectar',
    checking: 'Comprobando…',
    ok: 'Conectado',
    limited: 'Conectado (permisos limitados)',
    invalid: 'Clave no válida',
    error: 'Sin conexión',
  }[status];
}

function StatusIcon({ status }) {
  if (status === 'checking') return <Loader2 size={16} className="spin" aria-hidden="true" />;
  if (status === 'ok') return <CheckCircle2 size={16} aria-hidden="true" />;
  if (status === 'limited') return <AlertTriangle size={16} aria-hidden="true" />;
  if (status === 'none') return <KeyRound size={16} aria-hidden="true" />;
  return <XCircle size={16} aria-hidden="true" />;
}
