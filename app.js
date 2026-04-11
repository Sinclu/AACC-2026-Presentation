const questionBlueprint = [
  {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'Which option best describes your views on AI in education?',
    results: {
      totalResponses: 0,
      options: [
        { label: 'Excited & using it', value: 0 },
        { label: 'Curious & cautious', value: 0 },
        { label: 'Overwhelmed & unsure', value: 0 },
        { label: 'Skeptical & reluctant', value: 0 }
      ]
    }
  },
  {
    id: 'q2',
    type: 'open_ended',
    prompt: 'In just a few words, what do you feel is the biggest obstacle for AI integration at your institution?',
    results: {
      responses: []
    }
  },
  {
    id: 'q3',
    type: 'stat',
    prompt: 'Where are you on the Gartner Hype Cycle?',
    results: {
      countsByStage: {
        'Technology Trigger': 0,
        'Peak of Inflated Expectations': 0,
        'Trough of Disillusionment': 0,
        'Slope of Enlightenment': 0,
        'Plateau of Productivity': 0
      }
    }
  },
  {
    id: 'q4',
    type: 'open_ended',
    prompt: 'Does your institution have AI policies set in place? If so, what are the key characteristics of those policies?',
    results: {
      responses: []
    }
  },
  {
    id: 'q5',
    type: 'word_cloud',
    prompt: 'In one word, what would most help you move closer to adopting AI in your role?',
    results: {
      words: []
    }
  }
];

let state = structuredClone(questionBlueprint);
const thematicTitles = {
  q1: 'Audience Sentiment',
  q2: 'Key Obstacles',
  q3: 'Hype Cycle Status',
  q4: 'Policy Landscape',
  q5: 'What Would Help Most'
};

function renderDashboard(questions) {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';

  questions.forEach((q) => {
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
    const statusText = value === 0 ? 'Awaiting responses...' : `${value} (${pct}%)`;
    li.innerHTML = `<strong>${opt.label}</strong>: ${statusText}`;

    const barWrap = document.createElement('div');
    if (value === 0) {
      barWrap.className = 'bar-empty';
      barWrap.textContent = 'Awaiting responses...';
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
  list.className = 'list';
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

  const grid = document.createElement('div');
  grid.className = 'stat-grid';

  entries.forEach(([stage, value]) => {
    const count = Number(value || 0);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const block = document.createElement('div');
    block.className = 'stat';
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
