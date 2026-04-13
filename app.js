const DATA_URL = 'poll-results.json';
const POLL_INTERVAL_MS = 30000;
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
let pollTimer = null;
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

function renderInsight(questions) {
  const insight = document.getElementById('insight-text');
  const audience = questions.find((q) => q.id === 'q1');
  const hype = questions.find((q) => q.id === 'q3');
  const enablers = questions.find((q) => q.id === 'q5');

  if (!insight) {
    return;
  }

  const audienceTotal = Number(audience?.results?.totalResponses || 0);
  const peak = Number(hype?.results?.countsByStage?.['Peak of Inflated Expectations'] || 0);
  const trough = Number(hype?.results?.countsByStage?.['Trough of Disillusionment'] || 0);
  const plateau = Number(hype?.results?.countsByStage?.['Plateau of Productivity'] || 0);
  const hypeTotal = Object.values(hype?.results?.countsByStage || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const training = Number(
    (enablers?.results?.words || []).find((word) => word.term.toLowerCase() === 'training')?.weight || 0
  );
  const time = Number(
    (enablers?.results?.words || []).find((word) => word.term.toLowerCase() === 'time')?.weight || 0
  );

  if (audienceTotal === 0 && hypeTotal === 0 && training === 0 && time === 0) {
    insight.textContent =
      'Audience perspective, adoption barriers, and readiness signals will populate here as AACC participants submit responses.';
    return;
  }

  const middlePct = hypeTotal > 0 ? Math.round(((peak + trough) / hypeTotal) * 100) : 0;
  const plateauPct = hypeTotal > 0 ? Math.round((plateau / hypeTotal) * 100) : 0;

  insight.textContent =
    `Participants are largely optimistic about AI, but the strongest barriers remain fear, uncertainty, and uneven institutional readiness. ${middlePct}% of respondents place their institutions between the Peak of Inflated Expectations and the Trough of Disillusionment, while ${plateauPct}% report reaching the Plateau of Productivity. Training (${training}) and time (${time}) remain the clearest needs.`;
}

function renderReadiness(questions) {
  const readinessQuestion = questions.find((q) => q.id === 'q4');
  const summary = document.getElementById('readiness-summary');
  const list = document.getElementById('readiness-list');

  if (!summary || !list) {
    return;
  }

  const responses = Array.isArray(readinessQuestion?.results?.responses)
    ? readinessQuestion.results.responses
    : [];

  list.innerHTML = '';

  if (responses.length === 0) {
    summary.textContent =
      'Policy development updates will appear here as institutional readiness responses are collected.';
    const item = document.createElement('li');
    item.textContent = 'Institutions are still submitting readiness and policy observations.';
    list.append(item);
    return;
  }

  summary.textContent = responses[0];
  responses.slice(1).forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry;
    list.append(item);
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
      total === 0
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
  const questions = normalizeQuestions(incoming);
  if (!Array.isArray(questions)) {
    throw new Error('Expected shape: { "questions": [...] }');
  }

  const byId = new Map(questions.map((q) => [q.id, q]));

  return questionBlueprint.map((base) => {
    const found = byId.get(base.id);
    if (!found) return structuredClone(base);

    const mergedResults = {
      ...base.results,
      ...(found.results || {})
    };

    if (base.type === 'multiple_choice') {
      const baseOptions = Array.isArray(base.results.options) ? base.results.options : [];
      const incomingOptions = Array.isArray(found.results?.options) ? found.results.options : [];
      const optionByLabel = new Map(
        incomingOptions.map((option) => [String(option.label || '').toLowerCase(), option])
      );

      mergedResults.options = baseOptions.map((option) => {
        const match = optionByLabel.get(option.label.toLowerCase());
        return {
          ...option,
          ...(match || {}),
          value: Number(match?.value ?? option.value ?? 0)
        };
      });

      mergedResults.totalResponses =
        Number(found.results?.totalResponses) ||
        mergedResults.options.reduce((sum, option) => sum + Number(option.value || 0), 0);
    }

    if (base.type === 'stat') {
      const baseStages = base.results.countsByStage || {};
      const incomingStages = found.results?.countsByStage || {};
      mergedResults.countsByStage = Object.fromEntries(
        Object.keys(baseStages).map((stage) => [stage, Number(incomingStages[stage] ?? baseStages[stage] ?? 0)])
      );
    }

    if (base.type === 'open_ended') {
      mergedResults.responses = Array.isArray(found.results?.responses) ? found.results.responses : base.results.responses;
    }

    if (base.type === 'word_cloud') {
      mergedResults.words = Array.isArray(found.results?.words)
        ? found.results.words.map((word) => ({
            term: String(word.term || ''),
            weight: Number(word.weight || 0)
          }))
        : base.results.words;
    }

    return {
      ...base,
      ...found,
      results: mergedResults
    };
  });
}

function normalizeQuestions(incoming) {
  if (!incoming) {
    return null;
  }

  if (Array.isArray(incoming.questions)) {
    return incoming.questions;
  }

  if (Array.isArray(incoming)) {
    return incoming;
  }

  return null;
}

async function refreshPollData() {
  const message = document.getElementById('message');

  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Unable to load poll data (${response.status})`);
    }

    const parsed = await response.json();
    state = mergeIncoming(parsed);
    renderAll();

    if (message) {
      message.textContent = 'Results refreshed.';
    }
  } catch (error) {
    if (message) {
      message.textContent = `Live refresh failed: ${error.message}`;
    }
  }
}

function renderAll() {
  renderInsight(state);
  renderReadiness(state);
  renderDashboard(state);
}

function startPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(() => {
    refreshPollData();
  }, POLL_INTERVAL_MS);
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
      renderAll();
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
    renderAll();
  });
}

renderAll();
refreshPollData();
startPolling();
