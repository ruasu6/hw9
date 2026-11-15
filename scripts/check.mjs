import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const notes = JSON.parse(await readFile(new URL('../content/notes.json', import.meta.url), 'utf8'));
assert(Array.isArray(notes) && notes.length > 0, 'notes 必須是非空陣列');
const ids = new Set();
const text = (value, name) => assert(typeof value === 'string' && value.trim().length > 0, `${name} 必須為非空字串`);
const options = (values, name) => {
  assert(Array.isArray(values) && values.length === 4, `${name} 需要四個項目`);
  values.forEach(value => text(value, name));
};
const answer = (value, name) => assert(Number.isInteger(value) && value >= 1 && value <= 4, `${name} 必須是 1–4`);
for (const note of notes) {
  text(note.id, 'id');
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.id), `無效 ID: ${note.id}`);
  assert(!ids.has(note.id), `重複 ID: ${note.id}`); ids.add(note.id);
  assert(Number.isInteger(note.number) && note.number > 0, `${note.id} 題號必須為正整數`);
  ['title', 'source'].forEach(key => text(note[key], `${note.id}.${key}`));
  assert(['ready', 'pending'].includes(note.status), `${note.id} 狀態無效`);
  assert(Array.isArray(note.tags), `${note.id} 需要 tags 陣列`);
  note.tags.forEach(tag => text(tag, `${note.id}.tags`));
  if (note.status === 'pending') continue;
  ['question', 'translation', 'whyWrong', 'explanation', 'takeaway'].forEach(key => text(note[key], `${note.id}.${key}`));
  options(note.options, `${note.id}.options`); options(note.optionNotes, `${note.id}.optionNotes`);
  answer(note.userAnswer, `${note.id}.userAnswer`); answer(note.correctAnswer, `${note.id}.correctAnswer`);
  assert(Array.isArray(note.examples) && note.examples.length > 0, `${note.id} 需要例句`);
  note.examples.forEach(example => { text(example.ja, '例句日文'); text(example.zh, '例句翻譯'); });
  assert(note.practice && typeof note.practice === 'object', `${note.id} 需要自編練習`);
  text(note.practice.question, '練習題幹'); options(note.practice.options, '練習選項');
  answer(note.practice.correctAnswer, '練習答案'); text(note.practice.explanation, '練習說明');
}
JSON.parse(await readFile(new URL('../docs/NOTE_TEMPLATE.json', import.meta.url), 'utf8'));
console.log(`資料檢查通過：${notes.length} 題，${notes.filter(note => note.status === 'ready').length} 題完整解說，ID 不重複、答案與選項格式正確。`);
