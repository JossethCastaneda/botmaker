import { useId, useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, ExternalLink, LogOut, AlertTriangle } from 'lucide-react';
import { Collapsible } from './ui';

export const TOKEN_PAGE = 'https://go.botmaker.com/#/integrations/api';

// Formulario para pegar la clave de acceso, probarla y recordarla.
export default function ConnectionForm({ token, status, remember, onConnect, onDisconnect }) {
  const [draft, setDraft] = useState(token);
  const [visible, setVisible] = useState(false);
  const [rememberDraft, setRememberDraft] = useState(remember);
  const inputId = useId();

  const submit = (e) => {
    e.preventDefault();
    if (draft.trim()) onConnect(draft.trim(), rememberDraft);
  };

  return (
    <form className="connection-form" onSubmit={submit}>
      <Collapsible title="¿Dónde encuentro mi clave de acceso?" defaultOpen={!token}>
        <ol className="steps-list">
          <li>Entra a Botmaker con tu usuario de administrador.</li>
          <li>
            Abre la página de API:{' '}
            <a href={TOKEN_PAGE} target="_blank" rel="noreferrer">go.botmaker.com › Integraciones › API <ExternalLink size={13} aria-hidden="true" /></a>
          </li>
          <li>Copia el texto largo que aparece como <strong>access-token</strong>.</li>
          <li>Pégalo aquí abajo y presiona <strong>Conectar</strong>.</li>
        </ol>
        <p className="hint-box">¿No tienes acceso? Pídele la clave al administrador de tu cuenta de Botmaker. Trátala como una contraseña: no la compartas.</p>
      </Collapsible>

      <label htmlFor={inputId} className="field-label">Clave de acceso <span className="req">*</span></label>
      <div className="password-row">
        <input
          id={inputId}
          className="input"
          type={visible ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          placeholder="Pega aquí tu clave"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="icon-btn" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <label className="check-inline">
        <input type="checkbox" checked={rememberDraft} onChange={(e) => setRememberDraft(e.target.checked)} />
        Recordar mi clave en este equipo (no la marques en computadoras compartidas)
      </label>

      <div className="connection-actions">
        <button type="submit" className="btn btn-primary" disabled={!draft.trim() || status === 'checking'}>
          {status === 'checking' ? <><Loader2 size={16} className="spin" /> Comprobando…</> : 'Conectar'}
        </button>
        {token && (
          <button type="button" className="btn btn-secondary" onClick={() => { setDraft(''); onDisconnect(); }}>
            <LogOut size={16} /> Desconectar
          </button>
        )}
      </div>

      <StatusMessage status={status} />
    </form>
  );
}

export function StatusMessage({ status }) {
  if (status === 'ok') return <p className="status-msg ok" role="status"><CheckCircle2 size={18} /> Conectado. Ya puedes usar todas las acciones.</p>;
  if (status === 'limited') return <p className="status-msg warn" role="status"><AlertTriangle size={18} /> Conectado, pero tu clave tiene permisos limitados: algunas acciones podrían no funcionar.</p>;
  if (status === 'invalid') return <p className="status-msg error" role="alert"><XCircle size={18} /> La clave no es válida o expiró. Revisa que la copiaste completa.</p>;
  if (status === 'error') return <p className="status-msg error" role="alert"><XCircle size={18} /> No pudimos comprobar la clave: no hay conexión con Botmaker. Inténtalo de nuevo.</p>;
  return null;
}
