'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { productPhases } from '../../_data/demo';
import styles from '../platform.module.css';

type AnswerConfig = { options?: string[]; min?: string; max?: string; decimals?: boolean; placeholder?: string; maxLength?: string };
type EditableQuestion = [code: string, text: string, type: string, required: boolean, config?: AnswerConfig];
type EditablePhase = { code: string; name: string; order: number; questions: EditableQuestion[] };
type EditorState = { phaseCode: string; questionIndex: number | null; code: string; text: string; type: string; required: boolean; config: AnswerConfig };

const initialPhases: EditablePhase[] = productPhases.map((item) => ({
  code: item.code,
  name: item.name,
  order: item.order,
  questions: item.questions.map(([code, text, type, required]) => [code, text, type, required, undefined]),
}));

const responseTypes = ['Caixa de seleção', 'Número', 'Texto curto'];

function defaultConfig(type: string): AnswerConfig {
  if (type === 'Caixa de seleção') return { options: ['Concluído', 'Em andamento', 'Não realizado'] };
  if (type === 'Texto curto') return { maxLength: '100' };
  return {};
}

export function ProductBuilder() {
  const [phases, setPhases] = useState<EditablePhase[]>(initialPhases);
  const [selected, setSelected] = useState('F01');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const loadedFromStorage = useRef(false);
  const phase = phases.find((item) => item.code === selected) ?? phases[0];

  useEffect(() => {
    const saved = window.localStorage.getItem('gdtech.productPhases');
    const timer = window.setTimeout(() => {
      if (saved) {
        try { setPhases(JSON.parse(saved) as EditablePhase[]); } catch { /* mantém os dados de demonstração */ }
      }
      loadedFromStorage.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loadedFromStorage.current) window.localStorage.setItem('gdtech.productPhases', JSON.stringify(phases));
  }, [phases]);

  function openNewQuestion() {
    setEditor({ phaseCode: phase.code, questionIndex: null, code: `${phase.code}-${String(phase.questions.length + 1).padStart(2, '0')}`, text: '', type: 'Caixa de seleção', required: true, config: defaultConfig('Caixa de seleção') });
  }

  function openEditQuestion(index: number) {
    const [code, text, type, required, config] = phase.questions[index];
    setEditor({ phaseCode: phase.code, questionIndex: index, code, text, type: responseTypes.includes(type) ? type : 'Caixa de seleção', required, config: config ?? defaultConfig(type) });
  }

  function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || !editor.text.trim()) return;
    setPhases((current) => current.map((item) => {
      if (item.code !== editor.phaseCode) return item;
      const question: EditableQuestion = [editor.code, editor.text.trim(), editor.type, editor.required, editor.config];
      const questions = [...item.questions];
      if (editor.questionIndex === null) questions.push(question);
      else questions[editor.questionIndex] = question;
      return { ...item, questions };
    }));
    setEditor(null);
  }

  return (
    <section className={styles.builder}>
      <aside className={styles.phaseList}>
        <div className={styles.builderHeader}><span>ESTRUTURA DO PRODUTO</span><strong>Fases</strong></div>
        {phases.map((item) => (
          <button key={item.code} type="button" data-active={item.code === phase.code} onClick={() => setSelected(item.code)}>
            <small>{item.code}</small><span>{item.name}</span><b>{item.questions.length}</b>
          </button>
        ))}
        <button type="button" className={styles.addPhase}>+ Adicionar fase</button>
      </aside>

      <article className={styles.questionPanel}>
        <div className={styles.panelHeading}>
          <div><span>FASE {phase.order}</span><h2>{phase.name}</h2><p>{phase.questions.length} perguntas nesta fase</p></div>
          <button className={styles.button} type="button" onClick={openNewQuestion}>+ Nova pergunta</button>
        </div>
        <div className={styles.questionList}>
          {phase.questions.map(([code, question, type, required], index) => (
            <div className={styles.questionItem} key={code}>
              <span className={styles.order}>{index + 1}</span>
              <div><small>{code} · {type}</small><strong>{question}</strong></div>
              {required ? <span className={styles.required}>Obrigatória</span> : <span className={styles.optional}>Opcional</span>}
              <button type="button" aria-label={`Editar ${code}`} onClick={() => openEditQuestion(index)}>•••</button>
            </div>
          ))}
        </div>
      </article>

      {editor ? (
        <div className={styles.editorBackdrop} role="presentation">
          <form className={styles.questionEditor} role="dialog" aria-modal="true" aria-labelledby="question-editor-title" onSubmit={saveQuestion}>
            <div className={styles.editorHeader}><div><span>{editor.questionIndex === null ? 'NOVA PERGUNTA' : 'EDITAR PERGUNTA'}</span><h2 id="question-editor-title">Configurar pergunta</h2></div><button type="button" className={styles.editorClose} aria-label="Fechar" onClick={() => setEditor(null)}>×</button></div>
            <div className={styles.editorBody}>
              <label className={styles.editorField}>Pergunta<textarea value={editor.text} onChange={(event) => setEditor({ ...editor, text: event.target.value })} rows={4} placeholder="Digite a pergunta que será respondida pela empresa" autoFocus required /></label>
              <div className={styles.editorGrid}>
                <label className={styles.editorField}>Tipo de resposta<select value={editor.type} onChange={(event) => setEditor({ ...editor, type: event.target.value, config: defaultConfig(event.target.value) })}>{responseTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><small>Define o formato que a empresa verá ao responder.</small></label>
                <label className={styles.editorField}>Código interno<input value={editor.code} onChange={(event) => setEditor({ ...editor, code: event.target.value })} disabled={editor.questionIndex !== null} /></label>
              </div>
              <AnswerConfiguration editor={editor} onChange={setEditor} />
              <label className={styles.requiredToggle}><input type="checkbox" checked={editor.required} onChange={(event) => setEditor({ ...editor, required: event.target.checked })} /><span><strong>Obrigatória</strong><small>A implementação não avança enquanto esta pergunta estiver pendente.</small></span></label>
            </div>
            <div className={styles.editorActions}><button type="button" className={styles.editorCancel} onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className={styles.button}>Salvar pergunta</button></div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function AnswerConfiguration({ editor, onChange }: { editor: EditorState; onChange: (next: EditorState) => void }) {
  if (editor.type === 'Caixa de seleção') {
    return <div className={styles.answerConfig}><strong>Opções de resposta</strong><div className={styles.answerPreview}><span>Concluído</span><span>Em andamento</span><span>Não realizado</span></div><small>A empresa escolherá uma situação para esta pergunta.</small></div>;
  }
  if (editor.type === 'Número') {
    return <div className={styles.answerConfig}><strong>Formato do número</strong><div className={styles.editorGrid}><label className={styles.editorField}>Mínimo<input type="number" value={editor.config.min ?? ''} onChange={(event) => onChange({ ...editor, config: { ...editor.config, min: event.target.value } })} placeholder="Sem mínimo" /></label><label className={styles.editorField}>Máximo<input type="number" value={editor.config.max ?? ''} onChange={(event) => onChange({ ...editor, config: { ...editor.config, max: event.target.value } })} placeholder="Sem máximo" /></label></div><label className={styles.inlineCheck}><input type="checkbox" checked={editor.config.decimals ?? false} onChange={(event) => onChange({ ...editor, config: { ...editor.config, decimals: event.target.checked } })} /><span>Aceitar casas decimais</span></label></div>;
  }
  if (editor.type === 'Texto curto') {
    return <div className={styles.answerConfig}><strong>Texto curto</strong><div className={styles.editorGrid}><label className={styles.editorField}>Texto de ajuda<input value={editor.config.placeholder ?? ''} onChange={(event) => onChange({ ...editor, config: { ...editor.config, placeholder: event.target.value } })} placeholder="Ex.: Informe o nome da unidade" /></label><label className={styles.editorField}>Limite de caracteres<input type="number" min="1" max="100" value="100" readOnly /></label></div><small>O texto será limitado a 100 caracteres.</small></div>;
  }
  if (editor.type === 'Data') {
    return <div className={styles.answerConfig}><strong>Formato da data</strong><small>A empresa responderá usando um seletor de data.</small></div>;
  }
  return <div className={styles.answerConfig}><strong>Resposta numérica</strong><small>A empresa informará um número para esta pergunta.</small></div>;
}
