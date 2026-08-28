'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { productPhases } from '../../_data/demo';
import styles from '../platform.module.css';
import controls from './product-builder-controls.module.css';

type AnswerConfig = { options?: string[]; min?: string; max?: string; decimals?: boolean; placeholder?: string; maxLength?: string; trainingUrl?: string };
type EditableQuestion = [code: string, text: string, type: string, required: boolean, config?: AnswerConfig];
type EditablePhase = { code: string; name: string; order: number; isBase: boolean; durationWeeks: number; meetingsPerWeek: number; questions: EditableQuestion[] };
type EditorState = { phaseCode: string; questionIndex: number | null; code: string; text: string; type: string; required: boolean; config: AnswerConfig };
type ApiQuestion = { code: string; text: string; type: string; required: boolean; config?: AnswerConfig };
type ApiPhase = Omit<EditablePhase, 'questions'> & { questions: ApiQuestion[] };
type ProductConfiguration = Array<{ name: string; templates: Array<{ versions: Array<{ id: string; definition: { phases?: ApiPhase[] } }> }> }>;

const initialPhases: EditablePhase[] = productPhases.map((item) => ({
  code: item.code, name: item.name, order: item.order, isBase: false, durationWeeks: 1, meetingsPerWeek: 1,
  questions: item.questions.map(([code, text, type, required]) => [code, text, type, required, undefined]),
}));
const responseTypes = ['Caixa de seleção', 'Número', 'Texto curto'];

function defaultConfig(type: string): AnswerConfig {
  if (type === 'Caixa de seleção') return { options: ['Concluído', 'Em andamento', 'Não realizado'] };
  if (type === 'Texto curto') return { maxLength: '100' };
  return {};
}

function normalizePhases(phases?: ApiPhase[]): EditablePhase[] {
  if (!phases?.length) return initialPhases;
  return phases.map((phase, index) => ({
    code: phase.code, name: phase.name, order: phase.order ?? index + 1, isBase: Boolean(phase.isBase),
    durationWeeks: Math.max(1, Number(phase.durationWeeks) || 1), meetingsPerWeek: Math.max(0, Number(phase.meetingsPerWeek) || 0),
    questions: phase.questions.map((question) => [question.code, question.text, question.type, question.required, question.config]),
  }));
}

export function ProductBuilder() {
  const [phases, setPhases] = useState<EditablePhase[]>(initialPhases);
  const [selected, setSelected] = useState('F01');
  const [versionId, setVersionId] = useState('');
  const [productName, setProductName] = useState('GD Frotas');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [renamingPhase, setRenamingPhase] = useState(false);
  const [phaseNameDraft, setPhaseNameDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const phase = phases.find((item) => item.code === selected) ?? phases[0];

  useEffect(() => {
    apiRequest<ProductConfiguration>('/products/configuration').then((products) => {
      const version = products[0]?.templates[0]?.versions[0];
      if (!version) throw new Error('Nenhuma versão publicada encontrada.');
      setProductName(products[0]?.name ?? 'GD Frotas');
      setVersionId(version.id);
      const loadedPhases = normalizePhases(version.definition.phases);
      setPhases(loadedPhases);
      setSelected(loadedPhases[0]?.code ?? '');
    }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o produto.'));
  }, []);

  function updatePhase(values: Partial<EditablePhase>) {
    setPhases((current) => current.map((item) => item.code === phase.code ? { ...item, ...values } : item));
  }

  function openRenamePhase() {
    setPhaseNameDraft(phase.name);
    setRenamingPhase(true);
  }

  async function savePhaseName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = phaseNameDraft.trim();
    if (!name) return;
    const previousPhases = phases;
    const nextPhases = phases.map((item) => item.code === phase.code ? { ...item, name } : item);
    setPhases(nextPhases);
    const saved = await persistProduct(nextPhases, 'Nome da fase atualizado. As implementações já foram sincronizadas.');
    if (saved) setRenamingPhase(false); else setPhases(previousPhases);
  }

  async function deletePhase() {
    if (phases.length === 1) {
      setMessage('O produto precisa manter pelo menos uma fase.');
      return;
    }
    if (!window.confirm(`Excluir a fase ${phase.code} · ${phase.name}? As perguntas dela também deixarão de aparecer nas implementações.`)) return;
    const previousPhases = phases;
    const phaseIndex = phases.findIndex((item) => item.code === phase.code);
    const nextPhases = phases.filter((item) => item.code !== phase.code).map((item, index) => ({ ...item, order: index + 1 }));
    const nextSelected = nextPhases[Math.min(Math.max(phaseIndex, 0), nextPhases.length - 1)]?.code ?? nextPhases[0]?.code ?? '';
    setPhases(nextPhases);
    setSelected(nextSelected);
    setRenamingPhase(false);
    const saved = await persistProduct(nextPhases, 'Fase excluída. A estrutura e as implementações já foram sincronizadas.');
    if (!saved) {
      setPhases(previousPhases);
      setSelected(phase.code);
    }
  }

  function openNewQuestion() {
    setEditor({ phaseCode: phase.code, questionIndex: null, code: `${phase.code}-${String(phase.questions.length + 1).padStart(2, '0')}`, text: '', type: 'Caixa de seleção', required: true, config: defaultConfig('Caixa de seleção') });
  }

  function openEditQuestion(index: number) {
    const [code, text, type, required, config] = phase.questions[index];
    setEditor({ phaseCode: phase.code, questionIndex: index, code, text, type: responseTypes.includes(type) ? type : 'Caixa de seleção', required, config: config ?? defaultConfig(type) });
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || !editor.text.trim()) return;
    const nextPhases = phases.map((item) => {
      if (item.code !== editor.phaseCode) return item;
      const question: EditableQuestion = [editor.code, editor.text.trim(), editor.type, editor.required, editor.config];
      const questions = [...item.questions];
      if (editor.questionIndex === null) questions.push(question); else questions[editor.questionIndex] = question;
      return { ...item, questions };
    });
    setPhases(nextPhases);
    const saved = await persistProduct(nextPhases, 'Pergunta e treinamento salvos. A implementação já foi atualizada.');
    if (saved) setEditor(null);
  }

  async function deleteQuestion(index: number) {
    const question = phase.questions[index];
    if (!question || !window.confirm(`Excluir a pergunta ${question[0]}? Ela também será removida das implementações após salvar.`)) return;
    const nextPhases = phases.map((item) => item.code === phase.code ? { ...item, questions: item.questions.filter((_, questionIndex) => questionIndex !== index) } : item);
    setPhases(nextPhases);
    await persistProduct(nextPhases, 'Pergunta excluída. As implementações já foram sincronizadas.');
  }

  async function persistProduct(nextPhases: EditablePhase[], successMessage: string) {
    if (!versionId) return false;
    setSaving(true); setMessage('');
    try {
      await apiRequest(`/products/template-versions/${versionId}/configuration`, {
        method: 'PATCH',
        body: JSON.stringify({ phases: nextPhases.map((item) => ({ ...item, questions: item.questions.map(([code, text, type, required, config]) => ({ code, text, type, required, config })) })) }),
      });
      setMessage(successMessage);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o produto.');
      return false;
    } finally { setSaving(false); }
  }

  async function saveProduct() {
    await persistProduct(phases, 'Produto salvo. Módulos, prazos e treinamentos já foram sincronizados com as implementações.');
  }

  const totalQuestions = phases.reduce((total, item) => total + item.questions.length, 0);

  return <>
    <div className={styles.productMeta}><span><small>PRODUTO</small><strong>{productName}</strong></span><span><small>ESTRUTURA</small><strong>{phases.length} fases · {totalQuestions} perguntas</strong></span></div>
    <div className={styles.productSaveBar}><div><strong>Configuração comercial e de implantação</strong><span>Defina módulos base, duração, reuniões e materiais de treinamento.</span></div><button className={styles.button} type="button" disabled={saving || !versionId} onClick={saveProduct}>{saving ? 'Salvando…' : 'Salvar produto'}</button></div>
    {message ? <p className={styles.productMessage} role="status">{message}</p> : null}
    <section className={styles.builder}>
      <aside className={styles.phaseList}>
        <div className={styles.builderHeader}><span>MÓDULOS DO PRODUTO</span><strong>Fases contratáveis</strong></div>
        {phases.map((item) => <button key={item.code} type="button" data-active={item.code === phase.code} onClick={() => setSelected(item.code)}><small>{item.code}</small><span>{item.name}</span><b>{item.isBase ? 'Base' : item.questions.length}</b></button>)}
      </aside>
      <article className={styles.questionPanel}>
        <div className={styles.panelHeading}><div><span>MÓDULO {phase.order}</span><h2>{phase.name}</h2><p>{phase.questions.length} tarefas nesta fase</p></div><div className={controls.phaseActions}><button className={controls.phaseAction} type="button" disabled={saving} onClick={openRenamePhase}>Editar fase</button><button className={controls.phaseDelete} type="button" disabled={saving || phases.length === 1} onClick={deletePhase}>Excluir fase</button><button className={styles.button} type="button" disabled={saving} onClick={openNewQuestion}>+ Nova pergunta</button></div></div>
        {renamingPhase ? <form className={controls.phaseNameEditor} onSubmit={savePhaseName}><label>Nome da fase<input value={phaseNameDraft} maxLength={100} onChange={(event) => setPhaseNameDraft(event.target.value)} autoFocus required /></label><button className={styles.editorCancel} type="button" disabled={saving} onClick={() => setRenamingPhase(false)}>Cancelar</button><button className={styles.button} type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar nome'}</button></form> : null}
        <section className={styles.moduleConfiguration}>
          <label className={styles.requiredToggle}><input type="checkbox" checked={phase.isBase} onChange={(event) => updatePhase({ isBase: event.target.checked })} /><span><strong>Módulo base</strong><small>Será incluído obrigatoriamente em toda venda deste produto.</small></span></label>
          <label>Duração prevista (semanas)<input type="number" min="1" max="52" value={phase.durationWeeks} onChange={(event) => updatePhase({ durationWeeks: Number(event.target.value) || 1 })} /></label>
          <label>Reuniões por semana<input type="number" min="0" max="7" value={phase.meetingsPerWeek} onChange={(event) => updatePhase({ meetingsPerWeek: Number(event.target.value) || 0 })} /></label>
          <div><small>PLANEJAMENTO DO MÓDULO</small><strong>{phase.durationWeeks} semana(s) · {phase.durationWeeks * phase.meetingsPerWeek} reunião(ões)</strong></div>
        </section>
        <div className={styles.questionList}>{phase.questions.map(([code, question, type, required, config], index) => <div className={styles.questionItem} key={code}>
          <span className={styles.order}>{index + 1}</span><div><small>{code} · {type}</small><strong>{question}</strong></div>
          {config?.trainingUrl ? <a className={styles.trainingLink} href={config.trainingUrl} target="_blank" rel="noreferrer">Treinamento ↗</a> : null}
          {required ? <span className={styles.required}>Obrigatória</span> : <span className={styles.optional}>Opcional</span>}
          <div className={styles.questionActions} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><button type="button" aria-label={`Editar ${code}`} onClick={() => openEditQuestion(index)} style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, padding: 0, border: 0, borderRadius: 6, background: 'transparent', color: '#7b887f', fontSize: 11, lineHeight: 1, cursor: 'pointer' }}>•••</button><button type="button" className={styles.questionDelete} aria-label={`Excluir ${code}`} onClick={() => deleteQuestion(index)} style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, padding: 0, border: 0, borderRadius: 6, background: 'transparent', color: '#b86a62', fontSize: 16, lineHeight: 1, cursor: 'pointer' }}>×</button></div>
        </div>)}</div>
      </article>

      {editor ? <div className={styles.editorBackdrop} role="presentation"><form className={styles.questionEditor} role="dialog" aria-modal="true" aria-labelledby="question-editor-title" onSubmit={saveQuestion}>
        <div className={styles.editorHeader}><div><span>{editor.questionIndex === null ? 'NOVA PERGUNTA' : 'EDITAR PERGUNTA'}</span><h2 id="question-editor-title">Configurar pergunta</h2></div><button type="button" className={styles.editorClose} aria-label="Fechar" onClick={() => setEditor(null)}>×</button></div>
        <div className={styles.editorBody}>
          <label className={styles.editorField}>Pergunta<textarea value={editor.text} onChange={(event) => setEditor({ ...editor, text: event.target.value })} rows={4} placeholder="Digite a tarefa da implementação" autoFocus required /></label>
          <div className={styles.editorGrid}><label className={styles.editorField}>Tipo de resposta<select value={editor.type} onChange={(event) => setEditor({ ...editor, type: event.target.value, config: { ...defaultConfig(event.target.value), trainingUrl: editor.config.trainingUrl } })}>{responseTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className={styles.editorField}>Código interno<input value={editor.code} onChange={(event) => setEditor({ ...editor, code: event.target.value })} disabled={editor.questionIndex !== null} /></label></div>
          <AnswerConfiguration editor={editor} onChange={setEditor} />
          <label className={styles.editorField}>Link de treinamento<input type="url" value={editor.config.trainingUrl ?? ''} onChange={(event) => setEditor({ ...editor, config: { ...editor.config, trainingUrl: event.target.value } })} placeholder="https://..." /><small>O botão será exibido na implementação, mas só poderá ser alterado aqui no Produto.</small></label>
          <label className={styles.requiredToggle}><input type="checkbox" checked={editor.required} onChange={(event) => setEditor({ ...editor, required: event.target.checked })} /><span><strong>Obrigatória</strong><small>A fase não avança enquanto esta tarefa estiver pendente.</small></span></label>
        </div>
        <div className={styles.editorActions}><button type="button" className={styles.editorCancel} disabled={saving} onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className={styles.button} disabled={saving}>{saving ? 'Salvando…' : 'Salvar pergunta'}</button></div>
      </form></div> : null}
    </section>
  </>;
}

function AnswerConfiguration({ editor, onChange }: { editor: EditorState; onChange: (next: EditorState) => void }) {
  if (editor.type === 'Caixa de seleção') return <div className={styles.answerConfig}><strong>Opções de resposta</strong><div className={styles.answerPreview}><span>Concluído</span><span>Em andamento</span><span>Não realizado</span></div><small>A empresa escolherá uma situação para esta tarefa.</small></div>;
  if (editor.type === 'Número') return <div className={styles.answerConfig}><strong>Formato do número</strong><div className={styles.editorGrid}><label className={styles.editorField}>Mínimo<input type="number" value={editor.config.min ?? ''} onChange={(event) => onChange({ ...editor, config: { ...editor.config, min: event.target.value } })} placeholder="Sem mínimo" /></label><label className={styles.editorField}>Máximo<input type="number" value={editor.config.max ?? ''} onChange={(event) => onChange({ ...editor, config: { ...editor.config, max: event.target.value } })} placeholder="Sem máximo" /></label></div></div>;
  return <div className={styles.answerConfig}><strong>Texto curto</strong><small>O texto será limitado a 100 caracteres.</small></div>;
}
