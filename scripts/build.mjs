import {cp, mkdir, rm} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
await cp(new URL('site/', root), dist, {recursive: true});
for (const [from, to] of [['content/notes.json', 'notes.json'], ['AGENTS.md', 'AGENTS.md'], ['docs/NOTE_TEMPLATE.json', 'NOTE_TEMPLATE.json']]) {
  await cp(new URL(from, root), new URL(to, dist));
}
console.log('已建置 dist/：靜態網站、錯題資料與協作規則。');
