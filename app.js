'use strict';

/* ============================= State ============================= */

const STORAGE_KEY = 'internship-tracker-state-v1';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(iso, style) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (style === 'full') return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  return `${months[dt.getMonth()]} ${dt.getDate()}`;
}

function defaultState() {
  const stageDefs = [
    ['Applied', 'normal'],
    ['Online Test', 'normal'],
    ['HireVue', 'normal'],
    ['Round 1 / Case', 'normal'],
    ['Round 2', 'normal'],
    ['More?', 'normal'],
    ['Accepted', 'accepted'],
    ['Rejected', 'rejected'],
  ];
  const stages = stageDefs.map(([name, kind]) => ({ id: uid(), name, kind }));
  const tags = [
    { id: uid(), name: 'Finance', color: '#5b7c99' },
    { id: uid(), name: 'Consulting', color: '#8a6f9e' },
    { id: uid(), name: 'Tech', color: '#5c8a6b' },
    { id: uid(), name: 'Remote', color: '#b08a4e' },
    { id: uid(), name: 'Event', color: '#a3763f' },
  ];

  const stageId = (name) => stages.find(s => s.name === name).id;
  const tagId = (name) => tags.find(t => t.name.toLowerCase() === name.toLowerCase()).id;

  const seedDefs = [
    { title: "UBS Tomorrow's Talent Program – Global Markets", company: 'UBS', stage: 'Rejected', date: '2026-06-18', tags: ['finance'] },
    { title: "UBS Tomorrow's Talent Program – Global Banking", company: 'UBS', stage: 'Rejected', date: '2026-06-18', tags: ['finance'] },
    { title: 'Work Experience Programme', company: '7IM', stage: 'Applied', date: '2026-07-01', tags: ['finance'] },
    { title: 'GIC Internship Programme 2027', company: 'GIC', stage: 'HireVue', date: '2026-07-01', tags: ['finance'], notes: 'Also: meet UBS event' },
    { title: 'Women in Banking Insight', company: 'UBS', stage: 'Applied', date: '2026-07-01', tags: ['finance', 'event'] },
    { title: 'Meet UBS in Office', company: 'UBS', location: 'London', stage: 'Applied', date: '2026-07-01', tags: ['finance', 'event'] },
    { title: '2027 Commercial & Investment Bank - Global Investment Banking Analyst Program - Summer Analyst', company: 'JPMorgan', location: 'Singapore', stage: 'HireVue', date: '2026-07-01', tags: ['finance'] },
    { title: '2027 Global Private Bank Advisor Program – Summer Internship', company: 'JPMorgan', location: 'Singapore', stage: 'Applied', date: '2026-07-01', tags: ['finance'], notes: 'Used aliceshi200759 account to apply' },
    { title: '2027 Summer Analyst Program - Investment Banking', location: 'Singapore', stage: 'Applied', date: '2026-07-01', tags: ['finance'] },
    { title: 'Summer Internship Program - Global Investment Banking (R-0000176298)', company: 'RBC', stage: 'Applied', date: '2026-07-01', tags: ['finance'], notes: 'Requisition ID R-0000176298' },
    { title: 'Summer Analyst Program - Corporate Advisory - 2026', location: 'Melbourne, Australia', stage: 'Applied', date: '2026-07-01', tags: ['finance'] },
    { title: 'Product Strategy', company: 'BlackRock', stage: 'HireVue', date: '2026-07-01', tags: ['finance'] },
    { title: 'Change Management', company: 'UBS', stage: 'HireVue', date: '2026-07-01', tags: ['finance'] },
    { title: 'Relationship Management - Corporate and Institutional Banking', company: 'HSBC', stage: 'HireVue', date: '2026-07-01', tags: ['finance'], notes: 'Applied under name Xiang, email aliceshi135' },
    { title: 'Risk & Regulatory', company: 'UBS', stage: 'Rejected', date: '2026-07-01', tags: ['finance'], notes: 'Applied under name Alice, email aliceshi135' },
    { title: 'Summer Internship', company: 'Bain & Company', location: 'Singapore', stage: 'Online Test', tags: ['consulting'] },
    { title: 'Strategy & Operations Manager', company: 'Revolut', stage: 'Applied', tags: ['finance'] },
    { title: 'Keystone Event at Evercore', company: 'Evercore', stage: 'Online Test', tags: ['finance', 'event'] },
    { title: 'Shanghai Online Sharing Session & Case Workshop', company: 'Oliver Wyman', location: 'Shanghai', stage: 'Applied', tags: ['consulting', 'event'] },
    { title: 'Summer Intern SG 2027', company: 'Oliver Wyman', location: 'Singapore', stage: 'Applied', tags: ['consulting'] },
    { title: 'Women in Consulting', company: 'Oliver Wyman', stage: 'Applied', tags: ['consulting', 'event'] },
    { title: '180DC Cambridge', company: '180 Degrees Consulting', location: 'Cambridge', stage: 'Applied', tags: ['consulting'] },
    { title: 'Business Analyst Intern SG', company: 'McKinsey & Company', location: 'Singapore', stage: 'Applied', tags: ['consulting'] },
    { title: '2027 Summer Internship Programme', company: 'Centerview Partners', stage: 'Applied', tags: ['finance'] },
    { title: 'Strategy and Product', company: 'Jane Street', location: 'London', stage: 'Applied', tags: ['finance'] },
    { title: 'London Product Strategy', company: 'BlackRock', location: 'London', stage: 'Applied', tags: ['finance'] },
  ];

  const orderCounters = {};
  const apps = seedDefs.map((d) => {
    const sId = stageId(d.stage);
    const order = orderCounters[sId] || 0;
    orderCounters[sId] = order + 1;
    return {
      id: uid(),
      title: d.title,
      company: d.company || '',
      location: d.location || '',
      appliedDate: d.date || '',
      deadline: '',
      stage: sId,
      order,
      tags: (d.tags || []).map(tagId),
      notes: d.notes || '',
      links: [],
      history: d.date ? [{ stage: d.stage, date: d.date }] : [],
    };
  });

  return { stages, tags, apps, filters: { search: '', tagIds: [], sort: 'manual' }, settings: { sheetSyncUrl: '', lastSyncedAt: '' } };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.stages || !parsed.apps) return defaultState();
    if (!parsed.filters) parsed.filters = { search: '', tagIds: [], sort: 'manual' };
    if (!parsed.tags) parsed.tags = [];
    if (!parsed.settings) parsed.settings = { sheetSyncUrl: '', lastSyncedAt: '' };
    return parsed;
  } catch (e) {
    console.warn('Failed to load state, resetting', e);
    return defaultState();
  }
}

let state = loadState();

let persistenceBroken = false;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    if (!persistenceBroken) {
      persistenceBroken = true;
      console.warn('Failed to save state — changes will not persist', e);
      showToast('⚠ Changes are not being saved — open this app via the local server, not by double-clicking the file');
    }
  }
  scheduleSheetSync();
}

/* ============================= Google Sheet Sync ============================= */

let sheetSyncTimer = null;

function scheduleSheetSync() {
  if (!state.settings || !state.settings.sheetSyncUrl) return;
  clearTimeout(sheetSyncTimer);
  sheetSyncTimer = setTimeout(syncToSheet, 1500);
}

function buildSyncPayload() {
  return {
    apps: state.apps.map(a => ({
      company: a.company,
      title: a.title,
      location: a.location,
      stage: (getStage(a.stage) || {}).name || '',
      appliedDate: a.appliedDate,
      deadline: a.deadline,
      tags: (a.tags || []).map(id => (getTag(id) || {}).name).filter(Boolean),
      notes: a.notes,
      links: (a.links || []).map(l => `${l.label || ''}${l.label && l.url ? ': ' : ''}${l.url || ''}`).filter(Boolean),
    })),
  };
}

function syncToSheet(manual) {
  const url = state.settings && state.settings.sheetSyncUrl;
  if (!url) {
    if (manual) setSyncStatus('No sync URL saved yet.', 'err');
    return Promise.resolve();
  }
  if (manual) setSyncStatus('Syncing…', '');
  return fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(buildSyncPayload()),
  }).then(() => {
    state.settings.lastSyncedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (manual) setSyncStatus(`Sent to sheet at ${formatDate(state.settings.lastSyncedAt.slice(0, 10), 'full')}. Check the sheet to confirm it landed — cross-origin requests can't report real errors back.`, 'ok');
  }).catch((e) => {
    console.warn('Sheet sync failed', e);
    if (manual) setSyncStatus('Could not reach that URL. Check it was copied correctly and the deployment is live.', 'err');
  });
}

function setSyncStatus(msg, cls) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'sync-status' + (cls ? ' ' + cls : '');
}

/* ============================= Helpers ============================= */

function getStage(id) { return state.stages.find(s => s.id === id); }
function getTag(id) { return state.tags.find(t => t.id === id); }
function appsInStage(stageId) {
  return state.apps
    .filter(a => a.stage === stageId)
    .sort((a, b) => a.order - b.order);
}
function nextOrderIn(stageId) {
  const apps = appsInStage(stageId);
  return apps.length ? Math.max(...apps.map(a => a.order)) + 1 : 0;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), 2200);
}

function pushHistory(app, stageName) {
  const last = app.history[app.history.length - 1];
  if (!last || last.stage !== stageName) {
    app.history.push({ stage: stageName, date: todayISO() });
  }
}

/* ============================= Board Rendering ============================= */

const boardEl = document.getElementById('board');

function getVisibleApps(stageId) {
  let apps = appsInStage(stageId);
  const { search, tagIds, sort } = state.filters;

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    apps = apps.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q)
    );
  }
  if (tagIds && tagIds.length) {
    apps = apps.filter(a => a.tags.some(tid => tagIds.includes(tid)));
  }

  if (sort === 'date-asc') {
    apps = [...apps].sort((a, b) => (a.appliedDate || '').localeCompare(b.appliedDate || ''));
  } else if (sort === 'date-desc') {
    apps = [...apps].sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
  } else if (sort === 'deadline') {
    apps = [...apps].sort((a, b) => (a.deadline || '9999-99-99').localeCompare(b.deadline || '9999-99-99'));
  } else if (sort === 'az') {
    apps = [...apps].sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  }
  return apps;
}

function renderBoard() {
  boardEl.innerHTML = '';
  state.stages.forEach(stage => {
    boardEl.appendChild(renderColumn(stage));
  });
}

function renderColumn(stage) {
  const col = document.createElement('div');
  col.className = 'column';
  if (stage.kind === 'accepted') col.classList.add('stage-accepted');
  if (stage.kind === 'rejected') col.classList.add('stage-rejected');
  col.dataset.stageId = stage.id;

  const header = document.createElement('div');
  header.className = 'column-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'column-title-wrap';

  const titleInput = document.createElement('input');
  titleInput.className = 'column-title';
  titleInput.value = stage.name;
  titleInput.addEventListener('change', () => {
    stage.name = titleInput.value.trim() || stage.name;
    saveState();
    renderBoard();
  });
  titleWrap.appendChild(titleInput);

  const count = document.createElement('span');
  count.className = 'column-count';
  count.textContent = appsInStage(stage.id).length;
  titleWrap.appendChild(count);

  header.appendChild(titleWrap);

  const menuBtn = document.createElement('button');
  menuBtn.className = 'column-menu-btn';
  menuBtn.textContent = '✕';
  menuBtn.title = 'Delete stage';
  menuBtn.addEventListener('click', () => {
    if (appsInStage(stage.id).length > 0) {
      showToast('Move or delete applications out of this stage first');
      return;
    }
    if (state.stages.length <= 1) {
      showToast('Cannot delete the last stage');
      return;
    }
    askConfirm(`Delete stage "${stage.name}"? This cannot be undone.`, { okLabel: 'Delete' }).then(ok => {
      if (!ok) return;
      state.stages = state.stages.filter(s => s.id !== stage.id);
      saveState();
      renderBoard();
    });
  });
  header.appendChild(menuBtn);

  col.appendChild(header);

  const cardsWrap = document.createElement('div');
  cardsWrap.className = 'column-cards';
  cardsWrap.dataset.stageId = stage.id;

  const apps = getVisibleApps(stage.id);
  apps.forEach(app => cardsWrap.appendChild(renderCard(app)));

  attachColumnDragEvents(cardsWrap, stage.id);
  col.appendChild(cardsWrap);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-card-btn';
  addBtn.textContent = '+ Add application';
  addBtn.addEventListener('click', () => openNewApplication(stage.id));
  col.appendChild(addBtn);

  return col;
}

function renderCard(app) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.dataset.appId = app.id;

  const stage = getStage(app.stage);
  if (stage && stage.kind === 'rejected') card.classList.add('rejected-card');

  const title = document.createElement('p');
  title.className = 'card-title';
  title.textContent = app.title || 'Untitled application';
  card.appendChild(title);

  if (app.company) {
    const company = document.createElement('p');
    company.className = 'card-company';
    company.textContent = app.company;
    card.appendChild(company);
  }

  if (app.location) {
    const meta = document.createElement('div');
    meta.className = 'card-meta-row';
    meta.innerHTML = `<span>📍 ${escapeHtml(app.location)}</span>`;
    card.appendChild(meta);
  }

  if (app.tags && app.tags.length) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'card-tags';
    app.tags.forEach(tid => {
      const tag = getTag(tid);
      if (!tag) return;
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.textContent = tag.name;
      chip.style.background = tag.color + '26';
      chip.style.color = tag.color;
      tagsWrap.appendChild(chip);
    });
    card.appendChild(tagsWrap);
  }

  if (app.notes) {
    const notes = document.createElement('p');
    notes.className = 'card-notes-preview';
    notes.textContent = app.notes;
    card.appendChild(notes);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const lastHist = app.history[app.history.length - 1];
  const dateEl = document.createElement('span');
  dateEl.className = 'card-date';
  dateEl.textContent = lastHist ? `${lastHist.stage} · ${formatDate(lastHist.date)}` : '';
  footer.appendChild(dateEl);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn';
  delBtn.textContent = '🗑';
  delBtn.title = 'Delete';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    askConfirm(`Delete "${app.title || 'this application'}"? This cannot be undone.`, { okLabel: 'Delete' }).then(ok => {
      if (!ok) return;
      state.apps = state.apps.filter(a => a.id !== app.id);
      saveState();
      renderBoard();
    });
  });
  actions.appendChild(delBtn);

  footer.appendChild(actions);
  card.appendChild(footer);

  card.addEventListener('click', () => openDetail(app.id));

  attachCardDragEvents(card, app);

  return card;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ============================= Drag & Drop ============================= */

let draggedAppId = null;
let placeholder = null;

function makePlaceholder() {
  const p = document.createElement('div');
  p.className = 'card drag-placeholder';
  return p;
}

function attachCardDragEvents(card, app) {
  card.addEventListener('dragstart', (e) => {
    draggedAppId = app.id;
    placeholder = makePlaceholder();
    setTimeout(() => card.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', app.id); } catch (err) {}
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    placeholder = null;
    draggedAppId = null;
    document.querySelectorAll('.column-cards.drag-over').forEach(el => el.classList.remove('drag-over'));
  });
}

function attachColumnDragEvents(cardsWrap, stageId) {
  cardsWrap.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedAppId) return;
    cardsWrap.classList.add('drag-over');
    if (!placeholder) placeholder = makePlaceholder();

    const siblings = [...cardsWrap.querySelectorAll('.card:not(.dragging)')];
    const y = e.clientY;
    let inserted = false;
    for (const sib of siblings) {
      const rect = sib.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y < mid) {
        cardsWrap.insertBefore(placeholder, sib);
        inserted = true;
        break;
      }
    }
    if (!inserted) cardsWrap.appendChild(placeholder);
  });

  cardsWrap.addEventListener('dragleave', (e) => {
    if (e.target === cardsWrap) cardsWrap.classList.remove('drag-over');
  });

  cardsWrap.addEventListener('drop', (e) => {
    e.preventDefault();
    cardsWrap.classList.remove('drag-over');
    if (!draggedAppId || !placeholder) return;

    const app = state.apps.find(a => a.id === draggedAppId);
    if (!app) return;

    const stage = getStage(stageId);
    const changedStage = app.stage !== stageId;
    app.stage = stageId;

    if (changedStage) {
      pushHistory(app, stage.name);
      if (!app.appliedDate && stage.kind !== 'rejected') app.appliedDate = todayISO();
    }

    const cardsInWrap = [...cardsWrap.children];
    const idx = cardsInWrap.indexOf(placeholder);
    const orderedIds = cardsInWrap
      .filter(el => el !== placeholder)
      .map(el => el.dataset.appId);
    orderedIds.splice(idx, 0, app.id);

    orderedIds.forEach((id, i) => {
      const a = state.apps.find(x => x.id === id);
      if (a) { a.stage = stageId; a.order = i; }
    });

    saveState();
    renderBoard();
  });
}

/* ============================= New Application ============================= */

function openNewApplication(stageId) {
  const stage = getStage(stageId) || state.stages[0];
  const app = {
    id: uid(),
    title: '',
    company: '',
    location: '',
    appliedDate: todayISO(),
    deadline: '',
    stage: stage.id,
    order: nextOrderIn(stage.id),
    tags: [],
    notes: '',
    links: [],
    history: [{ stage: stage.name, date: todayISO() }],
  };
  state.apps.push(app);
  saveState();
  renderBoard();
  openDetail(app.id, true);
}

document.getElementById('add-app-btn').addEventListener('click', () => {
  const applied = state.stages.find(s => s.kind === 'normal') || state.stages[0];
  openNewApplication(applied.id);
});

/* ============================= Detail Panel ============================= */

const overlay = document.getElementById('detail-overlay');
const detailContent = document.getElementById('detail-content');

function openDetail(appId, focusTitle) {
  const app = state.apps.find(a => a.id === appId);
  if (!app) return;
  renderDetail(app);
  overlay.classList.remove('hidden');
  if (focusTitle) {
    setTimeout(() => {
      const t = detailContent.querySelector('.detail-field-title');
      if (t) t.focus();
    }, 30);
  }
}

function closeDetail() {
  overlay.classList.add('hidden');
  detailContent.innerHTML = '';
  renderBoard();
}

document.getElementById('detail-close').addEventListener('click', closeDetail);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!overlay.classList.contains('hidden')) closeDetail();
    if (!document.getElementById('tag-modal-overlay').classList.contains('hidden')) closeTagModal();
  }
});

function renderDetail(app) {
  detailContent.innerHTML = '';

  const titleInput = document.createElement('textarea');
  titleInput.className = 'detail-field-title';
  titleInput.rows = 1;
  titleInput.value = app.title;
  titleInput.placeholder = 'Internship / role title';
  const autoGrowTitle = () => { titleInput.style.height = 'auto'; titleInput.style.height = titleInput.scrollHeight + 'px'; };
  titleInput.addEventListener('input', () => { app.title = titleInput.value; saveState(); autoGrowTitle(); });
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); companyInput.focus(); }
  });
  detailContent.appendChild(titleInput);
  requestAnimationFrame(autoGrowTitle);

  const companyInput = document.createElement('input');
  companyInput.className = 'detail-field-company';
  companyInput.value = app.company;
  companyInput.placeholder = 'Company name';
  companyInput.addEventListener('input', () => { app.company = companyInput.value; saveState(); });
  detailContent.appendChild(companyInput);

  const props = document.createElement('div');
  props.className = 'detail-props';

  props.appendChild(propLabel('Location'));
  const locInput = document.createElement('input');
  locInput.value = app.location || '';
  locInput.placeholder = 'e.g. Singapore, London';
  locInput.addEventListener('input', () => { app.location = locInput.value; saveState(); });
  props.appendChild(locInput);

  props.appendChild(propLabel('Stage'));
  const stageSelect = document.createElement('select');
  state.stages.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    if (s.id === app.stage) opt.selected = true;
    stageSelect.appendChild(opt);
  });
  stageSelect.addEventListener('change', () => {
    const newStage = getStage(stageSelect.value);
    app.stage = newStage.id;
    app.order = nextOrderIn(newStage.id);
    pushHistory(app, newStage.name);
    saveState();
    renderDetail(app);
  });
  props.appendChild(stageSelect);

  props.appendChild(propLabel('Applied'));
  const appliedInput = document.createElement('input');
  appliedInput.type = 'date';
  appliedInput.value = app.appliedDate || '';
  appliedInput.addEventListener('change', () => {
    app.appliedDate = appliedInput.value;
    const stage = getStage(app.stage);
    const matchIdx = app.history.findIndex(h => h.stage === stage.name);
    if (matchIdx !== -1) {
      app.history[matchIdx].date = appliedInput.value;
    } else if (app.history.length === 0) {
      app.history.push({ stage: stage.name, date: appliedInput.value });
    }
    saveState();
    renderDetail(app);
  });
  props.appendChild(appliedInput);

  props.appendChild(propLabel('Deadline'));
  const deadlineInput = document.createElement('input');
  deadlineInput.type = 'date';
  deadlineInput.value = app.deadline || '';
  deadlineInput.addEventListener('change', () => { app.deadline = deadlineInput.value; saveState(); });
  props.appendChild(deadlineInput);

  props.appendChild(propLabel('Tags'));
  const tagsEditor = document.createElement('div');
  tagsEditor.className = 'detail-tags-editor';
  renderTagsEditor(tagsEditor, app);
  props.appendChild(tagsEditor);

  detailContent.appendChild(props);

  const notesLabel = document.createElement('div');
  notesLabel.className = 'detail-section-label';
  notesLabel.textContent = 'Notes & preparation';
  detailContent.appendChild(notesLabel);

  const notesArea = document.createElement('textarea');
  notesArea.className = 'detail-notes';
  notesArea.value = app.notes || '';
  notesArea.placeholder = 'Interview prep, case notes, company research, questions to ask…';
  notesArea.addEventListener('input', () => { app.notes = notesArea.value; saveState(); });
  detailContent.appendChild(notesArea);

  const linksLabel = document.createElement('div');
  linksLabel.className = 'detail-section-label';
  linksLabel.textContent = 'Links';
  detailContent.appendChild(linksLabel);

  const linksList = document.createElement('div');
  linksList.className = 'links-list';
  renderLinks(linksList, app);
  detailContent.appendChild(linksList);

  const addLinkBtn = document.createElement('button');
  addLinkBtn.className = 'add-tag-inline';
  addLinkBtn.style.marginTop = '8px';
  addLinkBtn.textContent = '+ Add link';
  addLinkBtn.addEventListener('click', () => {
    app.links.push({ label: '', url: '' });
    saveState();
    renderLinks(linksList, app);
  });
  detailContent.appendChild(addLinkBtn);

  if (app.history && app.history.length) {
    const histLabel = document.createElement('div');
    histLabel.className = 'detail-section-label';
    histLabel.textContent = 'History';
    detailContent.appendChild(histLabel);

    const histList = document.createElement('div');
    histList.className = 'history-list';
    app.history.forEach(h => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `<span class="h-stage">${escapeHtml(h.stage)}</span><span class="h-date">${formatDate(h.date, 'full')}</span>`;
      histList.appendChild(row);
    });
    detailContent.appendChild(histList);
  }

  const footerActions = document.createElement('div');
  footerActions.className = 'detail-footer-actions';

  const delBtn = document.createElement('button');
  delBtn.className = 'danger-btn';
  delBtn.textContent = 'Delete application';
  delBtn.addEventListener('click', () => {
    askConfirm('Delete this application permanently? This cannot be undone.', { okLabel: 'Delete' }).then(ok => {
      if (!ok) return;
      state.apps = state.apps.filter(a => a.id !== app.id);
      saveState();
      closeDetail();
    });
  });
  footerActions.appendChild(delBtn);

  detailContent.appendChild(footerActions);
}

function propLabel(text) {
  const l = document.createElement('div');
  l.className = 'detail-prop-label';
  l.textContent = text;
  return l;
}

function renderTagsEditor(container, app) {
  container.innerHTML = '';
  app.tags.forEach(tid => {
    const tag = getTag(tid);
    if (!tag) return;
    const chip = document.createElement('span');
    chip.className = 'tag-chip removable';
    chip.style.background = tag.color + '26';
    chip.style.color = tag.color;
    chip.innerHTML = `${escapeHtml(tag.name)} <span class="x">×</span>`;
    chip.querySelector('.x').addEventListener('click', () => {
      app.tags = app.tags.filter(id => id !== tid);
      saveState();
      renderTagsEditor(container, app);
    });
    container.appendChild(chip);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-tag-inline';
  addBtn.textContent = '+ tag';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openTagPicker(addBtn, app, container);
  });
  container.appendChild(addBtn);
}

function openTagPicker(anchorEl, app, container) {
  const existing = document.querySelector('.tag-picker-menu');
  if (existing) { existing.remove(); return; }

  const menu = document.createElement('div');
  menu.className = 'dropdown-menu tag-picker-menu';
  menu.style.position = 'absolute';
  menu.style.zIndex = '300';
  const rect = anchorEl.getBoundingClientRect();
  menu.style.top = (rect.bottom + window.scrollY + 4) + 'px';
  menu.style.left = (rect.left + window.scrollX) + 'px';

  state.tags.forEach(tag => {
    if (app.tags.includes(tag.id)) return;
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `<span class="swatch" style="background:${tag.color}"></span>${escapeHtml(tag.name)}`;
    item.addEventListener('click', () => {
      app.tags.push(tag.id);
      saveState();
      renderTagsEditor(container, app);
      menu.remove();
    });
    menu.appendChild(item);
  });

  const manageItem = document.createElement('div');
  manageItem.className = 'dropdown-item';
  manageItem.style.borderTop = '1px solid var(--border-soft)';
  manageItem.style.marginTop = '4px';
  manageItem.style.paddingTop = '8px';
  manageItem.textContent = 'Manage tags…';
  manageItem.addEventListener('click', () => { menu.remove(); openTagModal(); });
  menu.appendChild(manageItem);

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', function closeOnce(ev) {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('click', closeOnce);
      }
    });
  }, 0);
}

function renderLinks(container, app) {
  container.innerHTML = '';
  app.links.forEach((link, i) => {
    const row = document.createElement('div');
    row.className = 'link-row';

    const labelInput = document.createElement('input');
    labelInput.className = 'link-label';
    labelInput.placeholder = 'Label';
    labelInput.value = link.label || '';
    labelInput.addEventListener('input', () => { link.label = labelInput.value; saveState(); });
    row.appendChild(labelInput);

    const urlInput = document.createElement('input');
    urlInput.className = 'link-url';
    urlInput.placeholder = 'https://…';
    urlInput.value = link.url || '';
    urlInput.addEventListener('input', () => { link.url = urlInput.value; saveState(); });
    row.appendChild(urlInput);

    if (link.url) {
      const openLink = document.createElement('a');
      openLink.className = 'link-open';
      openLink.href = link.url;
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.textContent = 'Open ↗';
      row.appendChild(openLink);
    }

    const rmBtn = document.createElement('button');
    rmBtn.className = 'icon-btn';
    rmBtn.textContent = '✕';
    rmBtn.addEventListener('click', () => {
      app.links.splice(i, 1);
      saveState();
      renderLinks(container, app);
    });
    row.appendChild(rmBtn);

    container.appendChild(row);
  });
}

/* ============================= Tag Modal ============================= */

const tagModalOverlay = document.getElementById('tag-modal-overlay');

function openTagModal() {
  renderTagModal();
  tagModalOverlay.classList.remove('hidden');
}
function closeTagModal() {
  tagModalOverlay.classList.add('hidden');
  renderBoard();
  populateFilterMenu();
}

document.getElementById('tag-modal-close').addEventListener('click', closeTagModal);
tagModalOverlay.addEventListener('click', (e) => { if (e.target === tagModalOverlay) closeTagModal(); });

function renderTagModal() {
  const list = document.getElementById('tag-list');
  list.innerHTML = '';
  state.tags.forEach(tag => {
    const row = document.createElement('div');
    row.className = 'tag-list-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = tag.name;
    nameInput.addEventListener('input', () => { tag.name = nameInput.value; saveState(); });
    row.appendChild(nameInput);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = tag.color;
    colorInput.addEventListener('input', () => { tag.color = colorInput.value; saveState(); });
    row.appendChild(colorInput);

    const rmBtn = document.createElement('button');
    rmBtn.className = 'icon-btn';
    rmBtn.textContent = '🗑';
    rmBtn.addEventListener('click', () => {
      state.tags = state.tags.filter(t => t.id !== tag.id);
      state.apps.forEach(a => { a.tags = a.tags.filter(id => id !== tag.id); });
      saveState();
      renderTagModal();
    });
    row.appendChild(rmBtn);

    list.appendChild(row);
  });
}

document.getElementById('tag-new-add').addEventListener('click', () => {
  const nameInput = document.getElementById('tag-new-name');
  const colorInput = document.getElementById('tag-new-color');
  const name = nameInput.value.trim();
  if (!name) return;
  state.tags.push({ id: uid(), name, color: colorInput.value });
  nameInput.value = '';
  saveState();
  renderTagModal();
});

/* ============================= Generic Confirm / Prompt Modal ============================= */

const confirmOverlay = document.getElementById('confirm-overlay');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmInput = document.getElementById('confirm-input');
const confirmOkBtn = document.getElementById('confirm-ok');
const confirmCancelBtn = document.getElementById('confirm-cancel');

let confirmResolver = null;

function closeConfirmModal(result) {
  confirmOverlay.classList.add('hidden');
  const resolve = confirmResolver;
  confirmResolver = null;
  if (resolve) resolve(result);
}

confirmOkBtn.addEventListener('click', () => {
  if (!confirmInput.classList.contains('hidden')) {
    const val = confirmInput.value.trim();
    closeConfirmModal(val || null);
  } else {
    closeConfirmModal(true);
  }
});
confirmCancelBtn.addEventListener('click', () => closeConfirmModal(confirmInput.classList.contains('hidden') ? false : null));
confirmOverlay.addEventListener('click', (e) => { if (e.target === confirmOverlay) closeConfirmModal(confirmInput.classList.contains('hidden') ? false : null); });
confirmInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); confirmOkBtn.click(); }
});

function askConfirm(message, opts) {
  opts = opts || {};
  confirmTitle.textContent = opts.title || 'Are you sure?';
  confirmMessage.textContent = message;
  confirmInput.classList.add('hidden');
  confirmOkBtn.textContent = opts.okLabel || 'Confirm';
  confirmOverlay.classList.remove('hidden');
  return new Promise(resolve => { confirmResolver = resolve; });
}

function askPrompt(message, opts) {
  opts = opts || {};
  confirmTitle.textContent = opts.title || 'Enter a value';
  confirmMessage.textContent = message || '';
  confirmMessage.style.display = message ? '' : 'none';
  confirmInput.classList.remove('hidden');
  confirmInput.value = opts.defaultValue || '';
  confirmInput.placeholder = opts.placeholder || '';
  confirmOkBtn.textContent = opts.okLabel || 'Add';
  confirmOverlay.classList.remove('hidden');
  setTimeout(() => { confirmInput.focus(); confirmInput.select(); }, 30);
  return new Promise(resolve => {
    confirmResolver = resolve;
  }).finally(() => { confirmMessage.style.display = ''; });
}

/* ============================= Toolbar: Search / Filter / Sort ============================= */

document.getElementById('search-input').addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  renderBoard();
});

document.getElementById('sort-select').addEventListener('change', (e) => {
  state.filters.sort = e.target.value;
  renderBoard();
});

const filterBtn = document.getElementById('filter-btn');
const filterMenu = document.getElementById('filter-menu');

filterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  populateFilterMenu();
  filterMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!filterMenu.contains(e.target) && e.target !== filterBtn) {
    filterMenu.classList.add('hidden');
  }
});

function populateFilterMenu() {
  filterMenu.innerHTML = '';
  if (!state.tags.length) {
    const empty = document.createElement('div');
    empty.className = 'dropdown-item';
    empty.textContent = 'No tags yet';
    filterMenu.appendChild(empty);
    return;
  }
  state.tags.forEach(tag => {
    const item = document.createElement('label');
    item.className = 'dropdown-item';
    const checked = state.filters.tagIds.includes(tag.id);
    item.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''} style="margin-right:4px;" /><span class="swatch" style="background:${tag.color}"></span>${escapeHtml(tag.name)}`;
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.filters.tagIds.push(tag.id);
      } else {
        state.filters.tagIds = state.filters.tagIds.filter(id => id !== tag.id);
      }
      renderBoard();
    });
    filterMenu.appendChild(item);
  });

  const clearItem = document.createElement('div');
  clearItem.className = 'dropdown-item';
  clearItem.style.borderTop = '1px solid var(--border-soft)';
  clearItem.style.marginTop = '4px';
  clearItem.style.paddingTop = '8px';
  clearItem.textContent = 'Clear filters';
  clearItem.addEventListener('click', () => {
    state.filters.tagIds = [];
    renderBoard();
    populateFilterMenu();
  });
  filterMenu.appendChild(clearItem);

  const manageItem = document.createElement('div');
  manageItem.className = 'dropdown-item';
  manageItem.textContent = 'Manage tags…';
  manageItem.addEventListener('click', () => { filterMenu.classList.add('hidden'); openTagModal(); });
  filterMenu.appendChild(manageItem);
}

/* ============================= Add Stage ============================= */

document.getElementById('add-stage-btn').addEventListener('click', () => {
  askPrompt('', { title: 'New stage', placeholder: 'Stage name', okLabel: 'Add' }).then(name => {
    if (!name) return;
    const newStage = { id: uid(), name: name.trim(), kind: 'normal' };
    const acceptedIdx = state.stages.findIndex(s => s.kind === 'accepted');
    if (acceptedIdx === -1) {
      state.stages.push(newStage);
    } else {
      state.stages.splice(acceptedIdx, 0, newStage);
    }
    saveState();
    renderBoard();
  });
});

/* ============================= Sync Modal Wiring ============================= */

const syncOverlay = document.getElementById('sync-overlay');
const syncUrlInput = document.getElementById('sync-url-input');

function openSyncModal() {
  syncUrlInput.value = (state.settings && state.settings.sheetSyncUrl) || '';
  setSyncStatus(
    state.settings && state.settings.lastSyncedAt
      ? `Last sent: ${formatDate(state.settings.lastSyncedAt.slice(0, 10), 'full')}`
      : ''
  );
  syncOverlay.classList.remove('hidden');
}
function closeSyncModal() { syncOverlay.classList.add('hidden'); }

document.getElementById('sync-btn').addEventListener('click', openSyncModal);
syncOverlay.addEventListener('click', (e) => { if (e.target === syncOverlay) closeSyncModal(); });

document.getElementById('sync-save-btn').addEventListener('click', () => {
  state.settings.sheetSyncUrl = syncUrlInput.value.trim();
  saveState();
  setSyncStatus(state.settings.sheetSyncUrl ? 'Saved. Syncing on every change from now on.' : 'Sync URL cleared.', 'ok');
});

document.getElementById('sync-now-btn').addEventListener('click', () => {
  state.settings.sheetSyncUrl = syncUrlInput.value.trim();
  saveState();
  syncToSheet(true);
});

document.getElementById('sync-help-btn').addEventListener('click', () => {
  closeSyncModal();
  askConfirm(
    "1. Open your Google Sheet → Extensions → Apps Script.\n2. Delete the placeholder code and paste the script from google-apps-script.gs (in your app folder).\n3. Click Deploy → New deployment → type \"Web app\".\n4. Set \"Execute as\": Me. \"Who has access\": Anyone.\n5. Click Deploy, authorize when prompted, then copy the Web app URL.\n6. Paste that URL back here and click Save.",
    { title: 'Sheet sync setup', okLabel: 'Got it' }
  ).then(() => openSyncModal());
});

/* ============================= Init ============================= */

renderBoard();
populateFilterMenu();
if (state.settings && state.settings.sheetSyncUrl) scheduleSheetSync();
