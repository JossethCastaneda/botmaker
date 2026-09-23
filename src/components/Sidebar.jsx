import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight, Home, X, Trash2, ShieldAlert } from 'lucide-react';
import { CATEGORIES } from '../data/actions';
import CategoryIcon from './CategoryIcon';

const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Sidebar({ ops, route, open, onNavigate, onClose, isMobile }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(() => new Set(route.cat ? [route.cat] : []));

  const groups = useMemo(() => {
    const q = normalize(search.trim());
    return CATEGORIES.map((cat) => ({
      cat,
      ops: ops.filter((o) => o.cat === cat.id && (!q || normalize(`${o.name} ${o.desc} ${cat.name}`).includes(q))),
    })).filter((g) => g.ops.length > 0);
  }, [ops, search]);

  const searching = search.trim().length > 0;
  const activeCat = route.op?.cat || route.cat;

  // Al entrar a otra categoría, se abre sola en el menú.
  const [prevActive, setPrevActive] = useState(activeCat);
  if (activeCat !== prevActive) {
    setPrevActive(activeCat);
    if (activeCat) setExpanded((prev) => new Set(prev).add(activeCat));
  }

  const toggle = (id) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`} inert={!open} aria-label="Menú de acciones">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="brand">Panel Botmaker</span>
          {isMobile && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar menú"><X size={20} /></button>
          )}
        </div>
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            className="input"
            placeholder="¿Qué quieres hacer? Ej.: descargar"
            aria-label="Buscar acciones"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <nav className="sidebar-content">
        <button type="button" className={`nav-home ${route.name === 'home' ? 'active' : ''}`} onClick={() => onNavigate('#/')}>
          <Home size={18} aria-hidden="true" /> Inicio
        </button>

        {groups.length === 0 && <p className="sidebar-empty">No encontramos acciones con “{search}”. Prueba con otra palabra.</p>}

        {groups.map(({ cat, ops: catOps }) => {
          const isOpen = searching || expanded.has(cat.id);
          const listId = `cat-list-${cat.id}`;
          return (
            <div key={cat.id} className={`nav-group ${cat.advanced ? 'advanced' : ''} ${activeCat === cat.id ? 'current' : ''}`}>
              <button type="button" className="nav-group-title" aria-expanded={isOpen} aria-controls={listId} onClick={() => toggle(cat.id)}>
                <CategoryIcon name={cat.icon} size={18} />
                <span>{cat.name}</span>
                <span className="nav-count">{catOps.length}</span>
                {isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
              </button>
              {isOpen && (
                <ul id={listId} className="nav-list">
                  {cat.advanced && <li className="nav-warning">Solo si soporte técnico te lo pide.</li>}
                  {catOps.map((o) => {
                    const active = route.op?.key === o.key;
                    return (
                      <li key={o.key}>
                        <button
                          type="button"
                          className={`nav-item ${active ? 'active' : ''} ${o.danger ? 'danger' : ''}`}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => onNavigate(`#/accion/${encodeURIComponent(o.key)}`)}
                          title={o.desc}
                        >
                          {o.danger === 'critical' && <ShieldAlert size={14} aria-label="Acción delicada" />}
                          {o.danger === 'delete' && <Trash2 size={14} aria-label="Borra información" />}
                          <span>{o.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
