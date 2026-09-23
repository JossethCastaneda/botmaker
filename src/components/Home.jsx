import { ArrowRight, Trash2, ShieldAlert, Wrench, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/actions';
import CategoryIcon from './CategoryIcon';
import ConnectionForm from './ConnectionForm';

// Acciones que más se usan, para tenerlas a un clic.
const FAVORITES = [
  'GET /sessions',
  'GET /chats',
  'POST /chats-actions/send-messages',
  'GET /whatsapp/templates',
  'GET /agents',
  'GET /billing/consumptions',
];

const go = (key) => `#/accion/${encodeURIComponent(key)}`;

export function Home({ ops, connected, connection, onNavigate }) {
  const favorites = FAVORITES.map((k) => ops.find((o) => o.key === k)).filter(Boolean);
  return (
    <div className="main-content">
      <header className="home-header">
        <h1>Hola 👋 ¿Qué quieres hacer hoy?</h1>
        <p>Elige una tarea. Te guiaremos paso a paso, sin necesidad de saber programación.</p>
      </header>

      {!connected && (
        <section className="card step onboarding">
          <h2><span className="step-num">1</span> Conecta tu cuenta de Botmaker</h2>
          <p className="step-hint">Solo tienes que hacerlo una vez. Después podrás usar todas las acciones.</p>
          <ConnectionForm {...connection} />
        </section>
      )}

      <section aria-labelledby="fav-title">
        <h2 id="fav-title" className="section-title"><Sparkles size={18} aria-hidden="true" /> Lo más usado</h2>
        <div className="quick-grid">
          {favorites.map((o) => (
            <button key={o.key} type="button" className="quick-card" onClick={() => onNavigate(go(o.key))}>
              <strong>{o.name}</strong>
              <span>{o.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="cat-title">
        <h2 id="cat-title" className="section-title">Todas las tareas</h2>
        <div className="category-grid">
          {CATEGORIES.map((c) => {
            const count = ops.filter((o) => o.cat === c.id).length;
            return (
              <button key={c.id} type="button" className={`category-card ${c.advanced ? 'advanced' : ''}`} onClick={() => onNavigate(`#/cat/${c.id}`)}>
                <span className="category-icon"><CategoryIcon name={c.icon} size={24} /></span>
                <strong>{c.name}</strong>
                <span>{c.desc}</span>
                <small>{count} acciones <ArrowRight size={14} aria-hidden="true" /></small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function CategoryView({ cat, ops, onNavigate }) {
  const list = ops.filter((o) => o.cat === cat.id);
  const reading = list.filter((o) => o.method === 'GET');
  const changing = list.filter((o) => o.method !== 'GET');
  const renderCard = (o) => (
    <button key={o.key} type="button" className={`action-card ${o.danger ? 'danger' : ''}`} onClick={() => onNavigate(go(o.key))}>
      <strong>
        {o.danger === 'critical' && <ShieldAlert size={16} aria-hidden="true" />}
        {o.danger === 'delete' && <Trash2 size={16} aria-hidden="true" />}
        {o.name}
      </strong>
      <span>{o.desc}</span>
    </button>
  );
  return (
    <div className="main-content">
      <nav className="breadcrumbs" aria-label="Ruta">
        <button type="button" className="link-btn" onClick={() => onNavigate('#/')}>Inicio</button>
      </nav>
      <header className="home-header">
        <h1><span className="category-icon"><CategoryIcon name={cat.icon} size={26} /></span> {cat.name}</h1>
        <p>{cat.desc}</p>
      </header>
      {cat.advanced && (
        <p className="warning-box"><Wrench size={18} aria-hidden="true" /> Estas acciones son técnicas. Úsalas solo si el equipo de soporte te lo pide.</p>
      )}
      {reading.length > 0 && (
        <section>
          <h2 className="section-title">Consultar</h2>
          <div className="quick-grid">{reading.map(renderCard)}</div>
        </section>
      )}
      {changing.length > 0 && (
        <section>
          <h2 className="section-title">Crear, cambiar o enviar</h2>
          <div className="quick-grid">{changing.map(renderCard)}</div>
        </section>
      )}
    </div>
  );
}
