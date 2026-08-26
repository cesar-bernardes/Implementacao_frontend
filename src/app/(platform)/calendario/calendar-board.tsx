'use client';

import { FormEvent, useMemo, useState } from 'react';
import styles from '../platform.module.css';

type CalendarView = 'internal' | 'client';
type MeetingType = 'Kickoff' | 'Acompanhamento' | 'Treinamento' | 'Suporte' | 'Interna';
type CalendarEvent = {
  id: number;
  day: number;
  start: number;
  end: number;
  title: string;
  company: string;
  phase: string;
  type: MeetingType;
  owner: string;
};

const days = [
  { weekday: 'QUARTA', date: '26 AGO' },
  { weekday: 'QUINTA', date: '27 AGO' },
  { weekday: 'SEXTA', date: '28 AGO' },
  { weekday: 'SEGUNDA', date: '31 AGO' },
  { weekday: 'TERÇA', date: '01 SET' },
] as const;
const hours = Array.from({ length: 10 }, (_, index) => index + 8);
const initialEvents: CalendarEvent[] = [
  { id: 1, day: 0, start: 9, end: 10, title: 'Revisão da fase de check-in', company: 'Viação Horizonte', phase: 'F09', type: 'Acompanhamento', owner: 'Carlos Implementador' },
  { id: 2, day: 0, start: 14, end: 15, title: 'Dúvidas da operação', company: 'Logística Pantanal', phase: 'F03', type: 'Suporte', owner: 'Carlos Implementador' },
  { id: 3, day: 1, start: 8, end: 10, title: 'Kickoff presencial', company: 'Transporte Aurora', phase: 'F01', type: 'Kickoff', owner: 'Carlos Implementador' },
  { id: 4, day: 1, start: 15, end: 16, title: 'Alinhamento interno GD Tech', company: 'GD Tech', phase: 'Interno', type: 'Interna', owner: 'Ana Admin' },
  { id: 5, day: 2, start: 10, end: 11, title: 'Validação dos cadastros', company: 'Expresso Central', phase: 'F05', type: 'Acompanhamento', owner: 'Carlos Implementador' },
  { id: 6, day: 3, start: 13, end: 15, title: 'Treinamento de gestores', company: 'Viação Serra Azul', phase: 'F07', type: 'Treinamento', owner: 'Carlos Implementador' },
  { id: 7, day: 4, start: 9, end: 10, title: 'Acompanhamento semanal', company: 'Rodoviária União', phase: 'F04', type: 'Acompanhamento', owner: 'Carlos Implementador' },
];

export function CalendarBoard() {
  const [view, setView] = useState<CalendarView>('internal');
  const [events, setEvents] = useState(initialEvents);
  const [editorOpen, setEditorOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const companiesThisWeek = useMemo(() => new Set(events.filter((event) => event.company !== 'GD Tech').map((event) => event.company)).size, [events]);
  const occupiedHours = useMemo(() => events.reduce((total, event) => total + event.end - event.start, 0), [events]);

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const day = Number(form.get('day'));
    const start = Number(form.get('start'));
    const end = start + Number(form.get('duration'));
    const conflict = events.some((item) => item.day === day && start < item.end && end > item.start);
    if (conflict) {
      setFormError('Este horário já está ocupado. Escolha outro período.');
      return;
    }
    setEvents((current) => [...current, {
      id: Date.now(), day, start, end,
      title: String(form.get('title')),
      company: String(form.get('company')),
      phase: String(form.get('phase')),
      type: String(form.get('type')) as MeetingType,
      owner: 'Carlos Implementador',
    }]);
    setFormError('');
    setEditorOpen(false);
  }

  return (
    <>
      <div className={styles.heading}>
        <div><span>Agenda de implementações</span><h1>Calendário</h1></div>
        {view === 'internal' ? <button className={styles.button} type="button" onClick={() => setEditorOpen(true)}>+ Novo agendamento</button> : <span className={styles.clientPrivacyBadge}>Detalhes protegidos</span>}
      </div>

      <section className={styles.calendarToolbar}>
        <div className={styles.calendarViews} aria-label="Modo de visualização">
          <button type="button" aria-pressed={view === 'internal'} onClick={() => setView('internal')}>Visão GD Tech</button>
          <button type="button" aria-pressed={view === 'client'} onClick={() => setView('client')}>Como o cliente vê</button>
        </div>
        {view === 'internal' ? <div className={styles.googleSyncState}><i />Google Agenda preparado <b>Integração desativada</b></div> : <div className={styles.googleSyncState}><i />Disponibilidade no fuso <b>América/Cuiabá</b></div>}
      </section>

      <section className={styles.calendarStats}>
        <article><span>{view === 'internal' ? 'Reuniões na semana' : 'Agenda da semana'}</span><strong>{view === 'internal' ? events.length : 'Protegida'}</strong><small>{view === 'internal' ? `${companiesThisWeek} empresas diferentes` : 'Compromissos privados'}</small></article>
        <article><span>{view === 'internal' ? 'Horas ocupadas' : 'Horários disponíveis'}</span><strong>{view === 'internal' ? `${occupiedHours}h` : `${50 - occupiedHours}h`}</strong><small>{view === 'internal' ? 'de 50h disponíveis' : 'consulte os horários abaixo'}</small></article>
        <article><span>{view === 'internal' ? 'Próxima reunião' : 'Próximo horário livre'}</span><strong>{view === 'internal' ? '09:00' : '08:00'}</strong><small>{view === 'internal' ? 'Viação Horizonte · hoje' : 'quarta-feira · 26 ago'}</small></article>
        <article><span>Privacidade</span><strong>Protegida</strong><small>Clientes veem somente disponibilidade</small></article>
      </section>

      <div className={styles.calendarLayout}>
        <section className={styles.weekCalendar} aria-label="Agenda semanal">
          <header className={styles.weekHeader}><div>HORÁRIO</div>{days.map((day) => <div key={day.date}><span>{day.weekday}</span><strong>{day.date}</strong></div>)}</header>
          <div className={styles.weekBody}>
            {hours.map((hour) => <div className={styles.calendarHourRow} key={hour}>
              <time>{String(hour).padStart(2, '0')}:00</time>
              {days.map((day, dayIndex) => {
                const meeting = events.find((item) => item.day === dayIndex && item.start === hour);
                const covered = events.some((item) => item.day === dayIndex && item.start < hour && item.end > hour);
                if (covered) return <div className={styles.calendarCovered} key={day.date} />;
                return <div className={styles.calendarSlot} key={day.date} data-busy={Boolean(meeting)}>
                  {meeting ? (view === 'internal' ? <EventCard meeting={meeting} /> : <div className={styles.busyOnly}><strong>Indisponível</strong><span>Horário já reservado</span></div>) : <span className={styles.availableSlot}>Disponível</span>}
                </div>;
              })}
            </div>)}
          </div>
        </section>

        <aside className={styles.calendarAside}>
          <section><span className={styles.calendarAsideLabel}>PRIVACIDADE</span><h2>{view === 'internal' ? 'Visão completa da GD Tech' : 'Visualização segura do cliente'}</h2><p>{view === 'internal' ? 'Você vê a empresa, a fase, o assunto e o responsável por cada compromisso.' : 'Nenhum nome de empresa, assunto ou participante é exibido. O cliente vê apenas quando você está livre ou ocupado.'}</p></section>
          <section><span className={styles.calendarAsideLabel}>PRÓXIMOS COMPROMISSOS</span><ol className={styles.upcomingMeetings}>{events.slice(0, 4).map((meeting) => <li key={meeting.id}><time>{String(meeting.start).padStart(2, '0')}:00</time><div><strong>{view === 'internal' ? meeting.company : 'Horário indisponível'}</strong><small>{view === 'internal' ? `${meeting.phase} · ${meeting.type}` : 'Detalhes protegidos'}</small></div></li>)}</ol></section>
          <section className={styles.calendarRules}><span className={styles.calendarAsideLabel}>REGRAS DA AGENDA</span><p>Segunda a sexta · 08:00 às 18:00</p><p>Intervalo mínimo entre reuniões: 15 min</p><p>Fuso horário: América/Cuiabá</p></section>
        </aside>
      </div>

      {editorOpen ? <div className={styles.editorBackdrop} role="presentation"><form className={styles.calendarEditor} role="dialog" aria-modal="true" aria-labelledby="calendar-editor-title" onSubmit={saveEvent}>
        <div className={styles.editorHeader}><div><span>NOVO AGENDAMENTO</span><h2 id="calendar-editor-title">Organizar reunião</h2></div><button type="button" className={styles.editorClose} aria-label="Fechar" onClick={() => setEditorOpen(false)}>×</button></div>
        <div className={styles.editorBody}>
          <label className={styles.editorField}>Assunto<input required name="title" placeholder="Ex.: Revisão da fase de cadastro" autoFocus /></label>
          <div className={styles.editorGrid}><label className={styles.editorField}>Empresa<select required name="company" defaultValue=""><option value="" disabled>Selecione a empresa</option><option>Viação Horizonte</option><option>Logística Pantanal</option><option>Transporte Aurora</option><option>Expresso Central</option></select></label><label className={styles.editorField}>Fase<input required name="phase" placeholder="Ex.: F05" /></label></div>
          <div className={styles.editorGrid}><label className={styles.editorField}>Data<select name="day">{days.map((day, index) => <option value={index} key={day.date}>{day.weekday} · {day.date}</option>)}</select></label><label className={styles.editorField}>Horário<select name="start" defaultValue="8">{hours.map((hour) => <option value={hour} key={hour}>{String(hour).padStart(2, '0')}:00</option>)}</select></label></div>
          <div className={styles.editorGrid}><label className={styles.editorField}>Tipo<select name="type"><option>Kickoff</option><option>Acompanhamento</option><option>Treinamento</option><option>Suporte</option><option>Interna</option></select></label><label className={styles.editorField}>Duração<select name="duration"><option value="1">1 hora</option><option value="2">2 horas</option></select></label></div>
          <div className={styles.calendarPrivacyNote}><strong>Privacidade automática</strong><p>Outras empresas verão apenas que este horário está indisponível.</p></div>
          {formError ? <p className={styles.calendarError} role="alert">{formError}</p> : null}
        </div>
        <div className={styles.editorActions}><button type="button" className={styles.editorCancel} onClick={() => setEditorOpen(false)}>Cancelar</button><button type="submit" className={styles.button}>Agendar reunião</button></div>
      </form></div> : null}
    </>
  );
}

function EventCard({ meeting }: { meeting: CalendarEvent }) {
  return <article className={styles.calendarEvent} data-type={meeting.type}><span>{meeting.phase} · {meeting.type}</span><strong>{meeting.company}</strong><p>{meeting.title}</p><small>{String(meeting.start).padStart(2, '0')}:00–{String(meeting.end).padStart(2, '0')}:00</small></article>;
}
