const questionBlueprint = [
  {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'Which option best describes your views on AI in education?',
    results: {
      totalResponses: 49,
      options: [
        { label: 'Excited & using it', value: 35 },
        { label: 'Curious & cautious', value: 13 },
        { label: 'Overwhelmed & unsure', value: 0 },
        { label: 'Skeptical & reluctant', value: 1 }
      ]
    }
  },
  {
    id: 'q2',
    type: 'open_ended',
    prompt: 'In just a few words, what do you feel is the biggest obstacle for AI integration at your institution?',
    results: {
      responses: [
        'Fear and uncertainty: fear of change, waiting for others to go first, lack of training, limited time, uncertainty about AI capability, hallucinations, and the challenge of building buy-in.',
        'Faculty resistance: reluctance among some senior faculty, skepticism about impact on student learning, and resistance from vocal faculty in positions of influence.',
        'Academic integrity: concerns about cheating, student misuse, data security, and the need for trusted experts to guide responsible use.',
        'Institutional support and standardization: lack of institutional direction, no central organizing body, limited investment, readiness gaps, and a culture of \"we have always done it this way.\"',
        'Ethical concerns: privacy, equity, environmental impact, and concern that students may not build foundational skills such as writing.'
      ]
    }
  },
  {
    id: 'q3',
    type: 'stat',
    prompt: 'Where are you on the Gartner Hype Cycle?',
    results: {
      countsByStage: {
        'Technology Trigger': 3,
        'Peak of Inflated Expectations': 10,
        'Trough of Disillusionment': 12,
        'Slope of Enlightenment': 8,
        'Plateau of Productivity': 2
      }
    }
  },
  {
    id: 'q4',
    type: 'open_ended',
    prompt: 'Does your institution have AI policies set in place? If so, what are the key characteristics of those policies?',
    results: {
      responses: [
        'Current status: a majority reported no formal AI policy or said their institution is not there yet.',
        'In progress: many colleges are actively developing policy through faculty task forces, committee work, and draft review cycles.',
        'Policy pattern: syllabus-specific statements often clarify whether AI use must be disclosed or is not permitted.',
        'Policy pattern: guidance commonly emphasizes data security, privacy, and ethical use.',
        'Policy pattern: several institutions allow AI for efficiency gains or when explicit instructor permission is given.',
        'Policy pattern: some colleges are folding AI expectations into existing academic integrity policies as an interim solution.'
      ]
    }
  },
  {
    id: 'q5',
    type: 'word_cloud',
    prompt: 'In one word, what would most help you move closer to adopting AI in your role?',
    results: {
      words: [
        { term: 'training', weight: 11 },
        { term: 'time', weight: 7 },
        { term: 'education', weight: 2 },
        { term: 'examples', weight: 2 },
        { term: 'policy', weight: 2 },
        { term: 'successes', weight: 2 },
        { term: 'access', weight: 1 },
        { term: 'leadership', weight: 1 },
        { term: 'money', weight: 1 },
        { term: 'tools', weight: 1 }
      ]
    }
  }
];

let state = structuredClone(questionBlueprint);
const thematicTitles = {
  q1: 'Audience Perspective',
  q2: 'Barriers to Adoption',
  q3: 'Hype Cycle Status',
  q4: 'Institutional Readiness',
  q5: 'Top Enablers'
};

function renderDashboard(questions) {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';

  questions.forEach((q) => {
    if (q.id === 'q4') {
      return;
    }

    const card = document.createElement('article');
    card.className = 'card';

    const type = document.createElement('p');
    type.className = 'type';
    type.textContent = thematicTitles[q.id] || q.type.replace('_', ' ');

    const title = document.createElement('h3');
    title.textContent = q.prompt;

    card.append(type, title);

    switch (q.type) {
      case 'multiple_choice':
        card.append(renderMultipleChoice(q.results));
        break;
      case 'open_ended':
        card.append(renderOpenEnded(q.results));
        break;
      case 'word_cloud':
        card.append(renderWordCloud(q.results));
        break;
      case 'stat':
        card.append(renderStat(q.results));
        break;
      default:
        card.append(createEmpty('Unsupported question type.'));
    }

    dashboard.append(card);
  });
}

function renderMultipleChoice(results = {}) {
  const total = results.totalResponses || 0;
  const wrap = document.createElement('div');

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = `Responses: ${total}`;
  wrap.append(note);

  if (!Array.isArray(results.options) || results.options.length === 0) {
    wrap.append(createEmpty('No option results available yet.'));
    return wrap;
  }

  const list = document.createElement('ul');
  list.className = 'list';

  results.options.forEach((opt) => {
    const li = document.createElement('li');
    const value = Number(opt.value || 0);
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const statusText = total === 0 ? 'Awaiting audience input' : `${value} vote${value === 1 ? '' : 's'} (${pct}%)`;
    li.innerHTML = `
      <div class="list-row">
        <strong>${opt.label}</strong>
        <span>${statusText}</span>
      </div>
    `;

    const barWrap = document.createElement('div');
    if (total === 0 || value === 0) {
      barWrap.className = 'bar-empty';
      barWrap.textContent = total === 0 ? 'Awaiting audience input' : '0 votes recorded';
    } else {
      barWrap.className = 'bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.width = `${pct}%`;
      barWrap.append(bar);
    }

    li.append(barWrap);
    list.append(li);
  });

  wrap.append(list);
  return wrap;
}

function renderOpenEnded(results = {}) {
  if (!Array.isArray(results.responses) || results.responses.length === 0) {
    return createEmpty('No written responses loaded yet.');
  }

  const list = document.createElement('ul');
  list.className = 'list list-themes';
  results.responses.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.append(li);
  });
  return list;
}

function renderWordCloud(results = {}) {
  if (!Array.isArray(results.words) || results.words.length === 0) {
    return createEmpty('No word cloud terms loaded yet.');
  }

  const tags = document.createElement('div');
  tags.className = 'tags';

  results.words
    .slice()
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .forEach((word) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.style.fontSize = `${Math.max(0.8, Math.min(1.6, (word.weight || 1) / 10 + 0.8))}rem`;
      span.textContent = `${word.term} (${word.weight || 1})`;
      tags.append(span);
    });

  return tags;
}

function renderStat(results = {}) {
  const entries = Object.entries(results.countsByStage || {});
  if (!entries.length) {
    return createEmpty('No distribution data loaded yet.');
  }

  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  const wrap = document.createElement('div');

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = `Responses: ${total}`;
  wrap.append(note);

  if (total > 0) {
    const middleCluster = (Number(results.countsByStage['Peak of Inflated Expectations'] || 0) +
      Number(results.countsByStage['Trough of Disillusionment'] || 0));
    const plateau = Number(results.countsByStage['Plateau of Productivity'] || 0);
    const summary = document.createElement('p');
    summary.className = 'stat-summary';
    summary.textContent =
      `${Math.round((middleCluster / total) * 100)}% of participants are clustered between the Peak of Inflated Expectations and the Trough of Disillusionment, while only ${Math.round((plateau / total) * 100)}% report reaching the Plateau of Productivity.`;
    wrap.append(summary);
  }

  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  const dominant = total > 0 ? Math.max(...entries.map(([, value]) => Number(value || 0))) : 0;

  entries.forEach(([stage, value]) => {
    const count = Number(value || 0);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const block = document.createElement('div');
    block.className = count > 0 && count === dominant ? 'stat stat-dominant' : 'stat';
    block.innerHTML =
      count === 0
        ? `<span>${stage}</span><b>${count}</b><small>Awaiting responses...</small>`
        : `<span>${stage}</span><b>${count}</b><small>${pct}%</small>`;
    grid.append(block);
  });

  wrap.append(grid);
  return wrap;
}

function createEmpty(message) {
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = message;
  return p;
}

function hasMeaningfulData(question) {
  const r = question.results || {};
  if (question.type === 'multiple_choice') {
    return (r.totalResponses || 0) > 0;
  }
  if (question.type === 'open_ended') {
    return Array.isArray(r.responses) && r.responses.length > 0;
  }
  if (question.type === 'word_cloud') {
    return Array.isArray(r.words) && r.words.length > 0;
  }
  if (question.type === 'stat') {
    return Object.values(r.countsByStage || {}).some((v) => Number(v || 0) > 0);
  }
  return false;
}

function mergeIncoming(incoming) {
  if (!incoming || !Array.isArray(incoming.questions)) {
    throw new Error('Expected shape: { "questions": [...] }');
  }

  const byId = new Map(incoming.questions.map((q) => [q.id, q]));

  return questionBlueprint.map((base) => {
    const found = byId.get(base.id);
    if (!found) return structuredClone(base);
    return {
      ...base,
      ...found,
      results: {
        ...base.results,
        ...(found.results || {})
      }
    };
  });
}

const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');

if (loadBtn) {
  loadBtn.addEventListener('click', () => {
    const message = document.getElementById('message');
    try {
      const raw = document.getElementById('json-input').value.trim();
      if (!raw) {
        message.textContent = 'Please paste JSON first.';
        return;
      }

      const parsed = JSON.parse(raw);
      state = mergeIncoming(parsed);
      renderDashboard(state);
      message.textContent = 'Results loaded successfully.';
    } catch (error) {
      message.textContent = `Could not load JSON: ${error.message}`;
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    state = structuredClone(questionBlueprint);
    document.getElementById('json-input').value = '';
    document.getElementById('message').textContent = 'Template reset. Waiting for results.';
    renderDashboard(state);
  });
}

renderDashboard(state);
