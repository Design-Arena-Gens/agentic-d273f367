'use client';

import { useCallback, useMemo, useState } from 'react';

type Aspect = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type QuestionOption = {
  id: string;
  label: string;
  tone: string;
  weights: Record<string, number>;
};

type Question = {
  id: string;
  prompt: string;
  note: string;
  options: QuestionOption[];
};

type Survey = {
  title: string;
  subtitle: string;
  intro: string;
  closing: string;
  aspects: Aspect[];
  questions: Question[];
};

const palette = ['#c89b6d', '#b088f9', '#80b6b2', '#f4ca8c', '#d39393', '#7aa5d2'];

const createId = () => Math.random().toString(36).slice(2, 10);

const ensureWeights = (option: QuestionOption, aspectIds: string[]) => {
  const nextWeights: Record<string, number> = {};
  aspectIds.forEach((aspectId) => {
    nextWeights[aspectId] = option.weights[aspectId] ?? 0;
  });
  return { ...option, weights: nextWeights };
};

export default function Page() {
  const [survey, setSurvey] = useState<Survey>(() => {
    const aspects: Aspect[] = [
      {
        id: createId(),
        name: 'Auric Dreamer',
        description: 'Intuitive, future-facing, and guided by luminous ideals.',
        color: palette[0]
      },
      {
        id: createId(),
        name: 'Serene Anchor',
        description: 'Grounded presence that centres teams and rituals.',
        color: palette[2]
      },
      {
        id: createId(),
        name: 'Velvet Spark',
        description: 'Playful curiosity with a love for elegant experiments.',
        color: palette[1]
      }
    ];

    const makeOption = (label: string, tone: string, weights: number[]) => {
      const base: Record<string, number> = {};
      aspects.forEach((aspect, index) => {
        base[aspect.id] = weights[index] ?? 0;
      });
      return {
        id: createId(),
        label,
        tone,
        weights: base
      };
    };

    const questions: Question[] = [
      {
        id: createId(),
        prompt: 'When a new idea glimmers on the horizon, what is your first instinct?',
        note: 'Invite respondents to lean into their gut reaction.',
        options: [
          makeOption('Sketch the vision and speak it aloud', 'Leads with possibility and momentum.', [3, 0, 2]),
          makeOption('Ground it with rituals and reality checks', 'Seeks stability and shared rhythm.', [0, 3, 1]),
          makeOption('Prototype quietly until it feels precious', 'Crafts through thoughtful tinkering.', [1, 1, 3])
        ]
      },
      {
        id: createId(),
        prompt: 'How do you bring ease to a group that feels tense or uncertain?',
        note: 'Helps reveal each respondent’s signature care pattern.',
        options: [
          makeOption('Paint a shimmering picture of where we are headed', 'Opens horizons and inspires trust.', [3, 1, 1]),
          makeOption('Hold space, listen, and steady the room', 'Offers calm assurance and presence.', [0, 3, 1]),
          makeOption('Introduce playful structure to unlock ideas', 'Combines levity with delicate design.', [1, 1, 3])
        ]
      },
      {
        id: createId(),
        prompt: 'Which ritual would you protect during a busy season?',
        note: 'Highlights the cadence each persona values most.',
        options: [
          makeOption('Weekly dreamstorm notebooks', 'Keeps the spark radiant.', [3, 0, 2]),
          makeOption('Shared grounding tea and check-ins', 'Keeps the circle balanced.', [0, 3, 1]),
          makeOption('Creative warm-up prompts', 'Keeps curiosity swirling.', [1, 1, 3])
        ]
      }
    ];

    return {
      title: 'Crystal Current Typology',
      subtitle: 'A luminous diagnostic to map how your collaborators hold vision, care, and play.',
      intro:
        'Offer this survey to understand the delicate balance of personalities in your studio. Share it before a retreat or product kickoff to surface the energy each person brings to the table.',
      closing:
        'Invite respondents to reflect on their dominant motif and one supporting note they want to amplify in the coming season.',
      aspects,
      questions
    };
  });

  const aspectMap = useMemo(() => {
    const map: Record<string, Aspect> = {};
    survey.aspects.forEach((aspect) => {
      map[aspect.id] = aspect;
    });
    return map;
  }, [survey.aspects]);

  const handleSurveyText = useCallback((key: 'title' | 'subtitle' | 'intro' | 'closing', value: string) => {
    setSurvey((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleAspectChange = useCallback((id: string, field: keyof Aspect, value: string) => {
    setSurvey((prev) => ({
      ...prev,
      aspects: prev.aspects.map((aspect) =>
        aspect.id === id
          ? {
              ...aspect,
              [field]: value
            }
          : aspect
      ),
      questions: prev.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => ensureWeights(option, prev.aspects.map((a) => a.id)))
      }))
    }));
  }, []);

  const handleAddAspect = useCallback(() => {
    setSurvey((prev) => {
      const nextColor = palette[prev.aspects.length % palette.length];
      const nextAspect: Aspect = {
        id: createId(),
        name: 'New Facet',
        description: 'Describe the subtle energy this facet represents.',
        color: nextColor
      };

      return {
        ...prev,
        aspects: [...prev.aspects, nextAspect],
        questions: prev.questions.map((question) => ({
          ...question,
          options: question.options.map((option) => ({
            ...option,
            weights: { ...option.weights, [nextAspect.id]: 0 }
          }))
        }))
      };
    });
  }, []);

  const handleRemoveAspect = useCallback((id: string) => {
    setSurvey((prev) => {
      if (prev.aspects.length <= 1) {
        return prev;
      }

      const nextAspects = prev.aspects.filter((aspect) => aspect.id !== id);

      return {
        ...prev,
        aspects: nextAspects,
        questions: prev.questions.map((question) => ({
          ...question,
          options: question.options.map((option) => {
            const { [id]: _removed, ...rest } = option.weights;
            const ensured = ensureWeights({ ...option, weights: rest }, nextAspects.map((aspect) => aspect.id));
            return ensured;
          })
        }))
      };
    });
  }, []);

  const handleQuestionPrompt = useCallback((id: string, field: 'prompt' | 'note', value: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === id
          ? {
              ...question,
              [field]: value
            }
          : question
      )
    }));
  }, []);

  const handleAddQuestion = useCallback(() => {
    setSurvey((prev) => {
      const aspectIds = prev.aspects.map((aspect) => aspect.id);
      const newQuestion: Question = {
        id: createId(),
        prompt: 'What luminous prompt do you want to add?',
        note: 'Invite a response that reveals how someone moves through collaboration.',
        options: [
          {
            id: createId(),
            label: 'Option A',
            tone: 'Describe the emotional signature of this answer.',
            weights: aspectIds.reduce<Record<string, number>>((acc, aspectId) => {
              acc[aspectId] = 0;
              return acc;
            }, {})
          }
        ]
      };

      return {
        ...prev,
        questions: [...prev.questions, newQuestion]
      };
    });
  }, []);

  const handleRemoveQuestion = useCallback((id: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.id !== id)
    }));
  }, []);

  const handleAddOption = useCallback((questionId: string) => {
    setSurvey((prev) => {
      const aspectIds = prev.aspects.map((aspect) => aspect.id);
      return {
        ...prev,
        questions: prev.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                options: [
                  ...question.options,
                  {
                    id: createId(),
                    label: 'New Option',
                    tone: 'Offer a poetic hint for this choice.',
                    weights: aspectIds.reduce<Record<string, number>>((acc, aspectId) => {
                      acc[aspectId] = 0;
                      return acc;
                    }, {})
                  }
                ]
              }
            : question
        )
      };
    });
  }, []);

  const handleOptionChange = useCallback((questionId: string, optionId: string, field: 'label' | 'tone', value: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      [field]: value
                    }
                  : option
              )
            }
          : question
      )
    }));
  }, []);

  const handleOptionWeight = useCallback((questionId: string, optionId: string, aspectId: string, value: number) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      weights: {
                        ...option.weights,
                        [aspectId]: value
                      }
                    }
                  : option
              )
            }
          : question
      )
    }));
  }, []);

  const handleRemoveOption = useCallback((questionId: string, optionId: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.length > 1 ? question.options.filter((option) => option.id !== optionId) : question.options
            }
          : question
      )
    }));
  }, []);

  const encodedSurvey = useMemo(() => {
    try {
      const raw = JSON.stringify(survey);
      if (typeof window === 'undefined') {
        return '';
      }
      return window.btoa(unescape(encodeURIComponent(raw)));
    } catch (error) {
      console.error(error);
      return '';
    }
  }, [survey]);

  const aggregatedWeights = useMemo(() => {
    const base = survey.aspects.reduce<Record<string, number>>((acc, aspect) => {
      acc[aspect.id] = 0;
      return acc;
    }, {});

    survey.questions.forEach((question) => {
      question.options.forEach((option) => {
        Object.entries(option.weights).forEach(([aspectId, weight]) => {
          base[aspectId] += Math.max(0, weight);
        });
      });
    });

    return base;
  }, [survey]);

  const handleCopyBlueprint = useCallback(async () => {
    if (typeof navigator === 'undefined' || !encodedSurvey) return;
    try {
      await navigator.clipboard.writeText(encodedSurvey);
    } catch (error) {
      console.error('Unable to copy blueprint', error);
    }
  }, [encodedSurvey]);

  const decodedPreview = useMemo(() => JSON.stringify(survey, null, 2), [survey]);

  return (
    <main>
      <header className="hero">
        <span className="hero-label">Personality Atelier</span>
        <h1>Precious Survey Maker</h1>
        <p className="hero-lead">
          Shape a luminous personality diagnostic tailored to your studio. Refine facets, craft questions, and share the blueprint in minutes.
        </p>
      </header>

      <section className="grid">
        <article className="card">
          <header className="card-header">
            <h2>Survey Identity</h2>
            <p>Define the jewel-box introduction that welcomes respondents.</p>
          </header>
          <label className="field">
            <span>Survey Title</span>
            <input value={survey.title} onChange={(event) => handleSurveyText('title', event.target.value)} />
          </label>
          <label className="field">
            <span>Tagline</span>
            <input value={survey.subtitle} onChange={(event) => handleSurveyText('subtitle', event.target.value)} />
          </label>
          <label className="field">
            <span>Introduction</span>
            <textarea value={survey.intro} onChange={(event) => handleSurveyText('intro', event.target.value)} rows={4} />
          </label>
          <label className="field">
            <span>Closing Prompt</span>
            <textarea value={survey.closing} onChange={(event) => handleSurveyText('closing', event.target.value)} rows={3} />
          </label>
        </article>

        <article className="card">
          <header className="card-header">
            <h2>Facets &amp; Energies</h2>
            <p>Curate the personalities you want to illuminate. Each option can contribute points to these facets.</p>
          </header>
          <div className="facet-grid">
            {survey.aspects.map((aspect, index) => (
              <div className="facet-card" key={aspect.id} style={{ borderColor: aspect.color }}>
                <div className="facet-top">
                  <span className="facet-index">{String(index + 1).padStart(2, '0')}</span>
                  <button type="button" className="ghost" onClick={() => handleRemoveAspect(aspect.id)} disabled={survey.aspects.length <= 1}>
                    Remove
                  </button>
                </div>
                <label className="field mini">
                  <span>Name</span>
                  <input value={aspect.name} onChange={(event) => handleAspectChange(aspect.id, 'name', event.target.value)} />
                </label>
                <label className="field mini">
                  <span>Description</span>
                  <textarea value={aspect.description} onChange={(event) => handleAspectChange(aspect.id, 'description', event.target.value)} rows={3} />
                </label>
                <label className="field mini">
                  <span>Accent Hue</span>
                  <input type="color" value={aspect.color} onChange={(event) => handleAspectChange(aspect.id, 'color', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
          <button type="button" className="add" onClick={handleAddAspect}>
            Add Facet
          </button>
        </article>
      </section>

      <section className="full">
        <article className="card">
          <header className="card-header">
            <div>
              <h2>Question Constellations</h2>
              <p>Sculpt responses that draw out cherished nuances. Assign gentle weights to facets for each answer.</p>
            </div>
            <button type="button" className="add" onClick={handleAddQuestion}>
              Add Question
            </button>
          </header>

          <div className="questions">
            {survey.questions.map((question, qIndex) => (
              <div key={question.id} className="question-card">
                <div className="question-head">
                  <span className="facet-index">{`Q${qIndex + 1}`}</span>
                  <button type="button" className="ghost" onClick={() => handleRemoveQuestion(question.id)}>
                    Remove
                  </button>
                </div>
                <label className="field">
                  <span>Prompt</span>
                  <input value={question.prompt} onChange={(event) => handleQuestionPrompt(question.id, 'prompt', event.target.value)} />
                </label>
                <label className="field">
                  <span>Helper Note</span>
                  <textarea value={question.note} onChange={(event) => handleQuestionPrompt(question.id, 'note', event.target.value)} rows={2} />
                </label>

                <div className="options">
                  {question.options.map((option) => (
                    <div key={option.id} className="option-card">
                      <div className="option-top">
                        <span>Choice</span>
                        <button type="button" className="ghost" onClick={() => handleRemoveOption(question.id, option.id)} disabled={question.options.length <= 1}>
                          Remove
                        </button>
                      </div>
                      <label className="field mini">
                        <span>Label</span>
                        <input value={option.label} onChange={(event) => handleOptionChange(question.id, option.id, 'label', event.target.value)} />
                      </label>
                      <label className="field mini">
                        <span>Tone</span>
                        <textarea value={option.tone} onChange={(event) => handleOptionChange(question.id, option.id, 'tone', event.target.value)} rows={2} />
                      </label>
                      <div className="weights">
                        {survey.aspects.map((aspect) => (
                          <label key={aspect.id} className="weight-field" style={{ borderColor: aspect.color }}>
                            <span>{aspect.name}</span>
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.5}
                              value={option.weights[aspect.id] ?? 0}
                              onChange={(event) => handleOptionWeight(question.id, option.id, aspect.id, Number(event.target.value))}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" className="add secondary" onClick={() => handleAddOption(question.id)}>
                  Add Option
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <header className="card-header">
            <h2>Facet Emphasis Preview</h2>
            <p>See which energies receive the most love across your choices.</p>
          </header>
          <ul className="totals">
            {survey.aspects.map((aspect) => {
              const total = aggregatedWeights[aspect.id] ?? 0;
              const max = Math.max(...Object.values(aggregatedWeights), 1);
              const width = Math.max((total / max) * 100, 6);
              return (
                <li key={aspect.id}>
                  <div className="total-label">
                    <span className="pill" style={{ backgroundColor: aspect.color }} />
                    <span>{aspect.name}</span>
                    <span className="total-value">{total.toFixed(1)}</span>
                  </div>
                  <div className="meter">
                    <div className="meter-fill" style={{ width: `${width}%`, backgroundColor: aspect.color }} />
                  </div>
                  <p className="muted">{aspect.description}</p>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="card">
          <header className="card-header">
            <h2>Blueprint Export</h2>
            <p>Share this encoded string with collaborators or drop it into your own renderer.</p>
          </header>
          <div className="export">
            <code>{encodedSurvey || 'Blueprint will appear once loaded in the browser.'}</code>
          </div>
          <button type="button" className="add" onClick={handleCopyBlueprint} disabled={!encodedSurvey}>
            Copy Blueprint
          </button>
          <details>
            <summary>JSON Preview</summary>
            <pre>{decodedPreview}</pre>
          </details>
        </article>
      </section>

      <style jsx>{`
        .hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 12px 0 10px;
          font-family: var(--font-serif);
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 500;
        }

        .hero-lead {
          margin: 0 auto;
          max-width: 640px;
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
        }

        .grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          margin-bottom: 32px;
        }

        .full {
          margin-bottom: 32px;
        }

        .card {
          position: relative;
          background: var(--bg-accent);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 28px;
          border: 1px solid rgba(110, 86, 74, 0.18);
          box-shadow: 0 24px 45px rgba(63, 43, 33, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header h2 {
          font-family: var(--font-serif);
          font-weight: 500;
          margin: 0 0 6px;
        }

        .card-header p {
          margin: 0;
          color: var(--muted);
          font-size: 15px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 18px;
          font-size: 15px;
        }

        .field span {
          font-weight: 500;
          color: rgba(46, 37, 34, 0.8);
        }

        input,
        textarea {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.65);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--ring);
        }

        textarea {
          resize: vertical;
        }

        .facet-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          margin-bottom: 16px;
        }

        .facet-card {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .facet-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .facet-index {
          font-family: var(--font-serif);
          font-size: 20px;
        }

        .mini {
          margin-bottom: 10px;
        }

        .ghost {
          appearance: none;
          background: none;
          border: none;
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 999px;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .ghost:hover:not(:disabled) {
          color: var(--ink);
          background: rgba(0, 0, 0, 0.04);
        }

        .ghost:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .add {
          appearance: none;
          border: none;
          border-radius: 999px;
          padding: 10px 18px;
          background: linear-gradient(135deg, rgba(200, 155, 109, 0.8), rgba(200, 155, 109, 1));
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 12px 24px rgba(200, 155, 109, 0.32);
        }

        .add:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 32px rgba(200, 155, 109, 0.38);
        }

        .add.secondary {
          margin-top: 12px;
          background: rgba(200, 155, 109, 0.12);
          color: var(--primary);
          box-shadow: none;
        }

        .add.secondary:hover {
          background: rgba(200, 155, 109, 0.2);
        }

        .questions {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .question-card {
          border-radius: 20px;
          padding: 22px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .question-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .option-card {
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
        }

        .option-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .weights {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          margin-top: 12px;
        }

        .weight-field {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.85);
        }

        .totals {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .totals li {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .total-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .total-value {
          margin-left: auto;
          font-variant-numeric: tabular-nums;
          color: var(--muted);
        }

        .pill {
          display: inline-flex;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .meter {
          height: 8px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .muted {
          color: var(--muted);
          font-size: 14px;
          margin: 0;
        }

        .export {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.78);
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
          font-size: 13px;
          word-break: break-all;
        }

        code {
          display: block;
          white-space: pre-wrap;
          line-height: 1.4;
          color: rgba(46, 37, 34, 0.8);
        }

        details {
          margin-top: 16px;
        }

        summary {
          cursor: pointer;
          font-weight: 500;
        }

        pre {
          white-space: pre-wrap;
          background: rgba(0, 0, 0, 0.04);
          padding: 16px;
          border-radius: 16px;
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .card {
            padding: 22px;
          }

          .weights {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
