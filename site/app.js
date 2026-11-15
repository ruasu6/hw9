const app = document.querySelector('#app');
let notes = [];
let remembered = [];
let storageOK = true;
const storageKey = 'mistake-lab:understood:v1';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) remembered = saved.filter(id => typeof id === 'string');
} catch { storageOK = false; }

// All content is inserted as text, never interpreted as HTML.
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'className') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) if (child !== null && child !== undefined) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return node;
}
const p = (text, className = '') => el('p', {className}, text);
const ready = () => notes.filter(n => n.status === 'ready');
const completed = () => ready().filter(n => remembered.includes(n.id)).length;
const tags = note => el('div', {className: 'tags'}, note.tags.map(tag => el('span', {className: 'tag'}, tag)));
function hero(kicker, title, description, stamp) {
  return el('section', {className: 'hero'}, el('div', {}, el('span', {className: 'eyebrow'}, kicker), el('h1', {}, title), p(description, 'intro')), stamp ? el('div', {className: 'stamp', 'aria-hidden': 'true'}, stamp, el('small', {}, 'STUDY JOURNAL')) : null);
}
function notice(text) { return el('div', {className: 'notice'}, text); }
function panel(step, title, ...children) {
  return el('section', {className: 'panel'}, el('h2', {}, el('span', {className: 'step'}, step), title), ...children);
}
function back() { return el('a', {href: '#notes', className: 'back'}, '← 回到錯題筆記'); }
function storageMessage() { return storageOK ? '進度只保存在這個瀏覽器，不會跨裝置同步。' : '目前無法儲存進度；你仍可正常閱讀與練習。'; }
function saveProgress(id) {
  remembered = remembered.includes(id) ? remembered.filter(item => item !== id) : [...remembered, id];
  try { localStorage.setItem(storageKey, JSON.stringify(remembered)); } catch { storageOK = false; }
}
function card(note) {
  const done = remembered.includes(note.id);
  return el('article', {className: `card${note.status === 'ready' ? ' featured' : ''}`},
    el('div', {className: 'card-top'}, el('span', {className: 'q-number'}, `QUESTION ${String(note.number).padStart(2, '0')}`), el('span', {className: `badge ${note.status === 'pending' ? 'pending' : done ? 'done' : ''}`}, note.status === 'pending' ? '待補原題' : done ? '✓ 已理解' : '可閱讀')),
    el('h3', {}, el('a', {href: `#note/${note.id}`}, note.title)),
    p(note.status === 'ready' ? `我的答案 ${note.userAnswer} → 正確答案 ${note.correctAnswer} · ${note.takeaway}` : '已保留題號與已知線索；補上試卷回次、題幹與選項後再整理。'),
    el('div', {className: 'card-bottom'}, tags(note), el('a', {className: 'card-link', href: `#note/${note.id}`}, note.status === 'ready' ? '翻開筆記 ↗' : '查看資料 →')));
}
function renderNotes() {
  app.replaceChildren(hero('MY JAPANESE LEARNING JOURNAL', '把錯題，變成下一次的線索。', '記下當時的困惑，拆開每一個選項，再用自己的節奏重新理解。', '復習'));
  app.append(el('div', {className: 'stats'}, ...[[notes.length, '已收錄題號'], [ready().length, '完整解說'], [completed(), '已標記理解']].map(([n, label]) => el('div', {className: 'stat'}, el('strong', {}, n), el('span', {}, label)))));
  const resultCount = el('small', {'aria-live': 'polite'});
  const heading = el('div', {className: 'section-header'}, el('h2', {}, '我的錯題筆記'), resultCount);
  const input = el('input', {type: 'search', id: 'search', placeholder: '搜尋題號、文法或關鍵字…', autocomplete: 'off'});
  const select = el('select', {id: 'filter'}, ...[['all', '全部筆記'], ['ready', '完整解說'], ['pending', '待補原題'], ['done', '已理解']].map(([value, label]) => el('option', {value}, label)));
  const grid = el('div', {className: 'cards'});
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const filtered = notes.filter(note => (select.value === 'all' || (select.value === 'done' ? note.status === 'ready' && remembered.includes(note.id) : note.status === select.value)) && [note.title, note.number, note.source, note.question || '', ...note.tags].join(' ').toLocaleLowerCase().includes(query));
    resultCount.textContent = `顯示 ${filtered.length} / ${notes.length} 則`;
    grid.replaceChildren(...(filtered.length ? filtered.map(card) : [p('找不到相符的筆記，試試其他關鍵字。', 'empty')]));
  };
  input.addEventListener('input', update); select.addEventListener('change', update);
  app.append(heading, el('div', {className: 'toolbar'}, el('label', {className: 'search', for: 'search'}, el('span', {className: 'field-label'}, '搜尋筆記'), input), el('label', {className: 'filter', for: 'filter'}, el('span', {className: 'field-label'}, '閱讀狀態'), select)), grid,
    notice('資料說明：第 36 題已依你新提供的圖片與答案完成整理；其餘僅取得對話中的題號或片段，保留為待補，不推測原題與答案。試卷回次仍待補註。'));
  update();
}
function renderNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) { app.replaceChildren(back(), p('這則筆記不存在。請回索引選擇一則筆記。')); return; }
  const header = el('header', {className: 'note-header'}, el('span', {className: 'eyebrow'}, `QUESTION ${note.number} / 學習筆記`), el('h1', {}, note.title), tags(note));
  app.replaceChildren(back(), header);
  if (note.status === 'pending') {
    app.append(panel('01', '這一題，先留一個位置。', p(note.source), notice('待補：試卷名稱／回次、完整題幹、所有選項、你選的答案與正確答案。資料齊全後，才能做可靠的解說與練習。')), el('a', {className: 'button secondary', href: '#rules'}, '查看新增錯題的方法 →'));
    return;
  }
  const questionPanel = panel('01', '回到原題', p(note.question, 'question'), el('div', {className: 'question-options'}, note.options.map((option, i) => el('div', {className: `question-option${i + 1 === note.correctAnswer ? ' correct' : i + 1 === note.userAnswer ? ' selected' : ''}`, lang: 'ja'}, `${i + 1}. ${option}${i + 1 === note.correctAnswer ? ' ✓ 正解' : i + 1 === note.userAnswer ? ' · 我選的' : ''}`))), p(note.translation, 'translation'));
  questionPanel.querySelector('.question').setAttribute('lang', 'ja');
  const main = el('div', {}, questionPanel,
    panel('02', `為什麼我選的 ${note.userAnswer} 不適合？`, p(note.whyWrong, 'explanation')),
    panel('03', `正解 ${note.correctAnswer} 的思考線索`, p(note.explanation, 'explanation')),
    panel('04', '把四個選項放在一起看', ...note.options.map((option, i) => el('div', {className: 'option-row'}, el('span', {className: 'option-index'}, i + 1), el('div', {}, el('strong', {lang: 'ja'}, option), p(note.optionNotes[i]))))),
    panel('05', '換個句子，再理解一次', p('以下為自編例句。', 'metadata'), ...note.examples.map(example => el('div', {className: 'example'}, el('p', {lang: 'ja'}, example.ja), el('small', {}, example.zh)))),
    el('div', {className: 'action-row'}, el('a', {href: `#review/${note.id}`, className: 'button'}, '做一題自編練習 →')));
  const mark = el('button', {className: 'button secondary full', type: 'button'});
  const storage = p(storageMessage());
  const updateMark = () => { const done = remembered.includes(note.id); mark.textContent = done ? '✓ 已理解 · 取消標記' : '標記為已理解'; mark.setAttribute('aria-pressed', String(done)); storage.textContent = storageMessage(); };
  mark.addEventListener('click', () => { saveProgress(note.id); updateMark(); });
  updateMark();
  const aside = el('aside', {className: 'note-aside', 'aria-label': '學習重點'}, el('div', {className: 'takeaway'}, el('span', {className: 'tiny'}, '帶走這個線索'), p(note.takeaway)), el('div', {className: 'panel'}, el('h2', {}, '我的複習進度'), mark, storage), el('div', {className: 'panel'}, el('h2', {}, '題目來源'), p(note.source)));
  app.append(el('div', {className: 'note-layout'}, main, aside));
}
function renderReview(id) {
  app.replaceChildren(hero('A SMALL PRACTICE, A CLEARER IDEA', '懂了之後，再試一次。', '用新的句子確認自己理解了語意，而不只是記得選項編號。'));
  const available = ready().filter(n => n.practice);
  let index = Math.max(0, available.findIndex(n => n.id === id));
  const area = el('div');
  app.append(area);
  function show() {
    if (!available.length) { area.replaceChildren(notice('目前沒有可練習的完整筆記。')); return; }
    const note = available[index], practice = note.practice;
    const feedback = el('div', {'aria-live': 'polite'});
    const options = el('div', {className: 'practice-options'});
    practice.options.forEach((option, i) => {
      const button = el('button', {type: 'button', lang: 'ja'}, `${i + 1}. ${option}`);
      button.addEventListener('click', () => {
        [...options.children].forEach((item, j) => { item.disabled = true; if (j + 1 === practice.correctAnswer) { item.classList.add('right'); item.append(' ✓ 正解'); } });
        if (i + 1 !== practice.correctAnswer) { button.classList.add('wrong'); button.append(' · 你的選擇'); }
        feedback.replaceChildren(el('div', {className: 'feedback'}, el('strong', {}, i + 1 === practice.correctAnswer ? '答對了！再看一次解題線索。' : `這次再想想：正解是 ${practice.correctAnswer}。`), p(practice.explanation)));
      });
      options.append(button);
    });
    area.replaceChildren(el('div', {className: 'section-header'}, el('h2', {}, '自編練習'), el('small', {}, `${index + 1} / ${available.length}`)), el('section', {className: 'panel'}, p(`對應筆記：第 ${note.number} 題 · 此題為自編，非原試卷`, 'review-label'), el('p', {className: 'question', lang: 'ja'}, practice.question), options, feedback, el('div', {className: 'action-row'}, el('a', {href: `#note/${note.id}`, className: 'button secondary'}, '回看解說'), el('button', {type: 'button', className: 'button', onClick: () => { index = (index + 1) % available.length; show(); }}, available.length === 1 ? '再練一次 ↻' : '下一題 →'))));
  }
  show();
}
function renderRules() {
  app.replaceChildren(hero('BUILD A SYSTEM THAT KEEPS GROWING', '讓下一篇筆記，有規則可循。', '這份專案不只是一個網頁，也是一套讓 AI 持續整理錯題的方法。'));
  app.append(el('div', {className: 'rules-grid'}, ...[
    ['01 · 收集原題', '題目與來源先到位', '留下試卷回次、完整選項、我的誤選與正解；資料不足就明確標成待補。'],
    ['02 · 依規則整理', '每題都用同一套格式', '原題 → 誤選原因 → 正解依據 → 選項比較 → 一句重點 → 自編練習。'],
    ['03 · 持續累積', '新增內容，自動成頁', '依資料範本新增一筆 JSON，索引、詳細頁與複習功能就會一起更新。']
  ].map(([step, title, description]) => el('div', {className: 'panel'}, el('span', {className: 'eyebrow'}, step), el('h2', {}, title), p(description)))));
  app.append(panel('↗', '給 AI 的協作入口', p('根目錄的 AGENTS.md 定義內容格式、檔案位置、視覺風格、驗證與發布方式。新增題目時，先讓 AI 讀這份規則。', 'rules-text'), el('div', {className: 'action-row'}, el('a', {href: 'AGENTS.md', className: 'button'}, '閱讀 AGENTS.md ↗'), el('a', {href: 'NOTE_TEMPLATE.json', className: 'button secondary', download: ''}, '下載錯題格式'), el('a', {href: 'https://github.com/ruasu6/hw9', className: 'button secondary', target: '_blank', rel: 'noopener'}, 'GitHub 原始碼 ↗'))));
  app.append(panel('＋', '下次可以這樣請 AI 幫忙', el('pre', {className: 'code'}, '請先讀取 AGENTS.md，依照 docs/NOTE_TEMPLATE.json，\n將以下日文錯題新增至 content/notes.json。\n\n來源與回次：……\n完整題目與選項：……\n我的答案：……\n正確答案與依據：……\n我的疑問：……\n\n不要改動既有題目。資訊不齊時標為 pending。\n完成後執行 npm run check 與 npm run build。')));
  app.append(panel('✓', '這份專案對應的作業內容', el('ol', {className: 'rules-text'}, ...['小專案：用自己的日文錯題建立學習筆記庫。', 'AI 規則：AGENTS.md 清楚定義結構、格式、風格與工作流程。', '網頁成果：可搜尋的索引、錯題解說與自編練習。', '持續發布：GitHub Actions 在 main 更新時檢查並建置 GitHub Pages。'].map(text => el('li', {}, text)))));
  app.append(notice('目前完整題目為新提供圖片的第 36 題；其他題號取自對話預覽，仍待補原文。原題答案由使用者提供，自編例句與練習另外標示。'));
}
function route() {
  const [page = 'notes', id] = location.hash.slice(1).split('/');
  const active = page === 'note' ? 'notes' : page;
  document.querySelectorAll('[data-route]').forEach(link => { const selected = link.dataset.route === active; link.classList.toggle('active', selected); if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  document.querySelector('#breadcrumb').textContent = {notes: '錯題筆記', review: '小小複習', rules: '專案與協作規則'}[active] || '錯題筆記';
  document.title = `${page === 'note' ? notes.find(n => n.id === id)?.title || '錯題筆記' : {notes: '錯題筆記', review: '小小複習', rules: '專案與協作規則'}[page] || '錯題筆記'}｜錯題研究室`;
  if (page === 'note') renderNote(id);
  else if (page === 'review') renderReview(id);
  else if (page === 'rules') renderRules();
  else renderNotes();
  window.scrollTo(0, 0);
}
async function start() {
  try {
    const response = await fetch('notes.json');
    if (!response.ok) throw new Error('資料載入失敗');
    notes = await response.json();
    document.querySelector('#total-count').textContent = notes.length;
    route();
    window.addEventListener('hashchange', () => { route(); document.querySelector('#main').focus({preventScroll: true}); });
  } catch {
    app.replaceChildren(el('h1', {}, '筆記暫時無法開啟'), p('請重新載入頁面，或到 GitHub 查看原始資料。'), el('a', {href: 'https://github.com/ruasu6/hw9'}, '前往 GitHub →'));
  }
}
start();
