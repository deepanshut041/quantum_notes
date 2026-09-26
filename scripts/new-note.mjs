import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug, readNotes } from './content.mjs';
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, item, i, all) => { if (item.startsWith('--')) pairs.push([item.slice(2), all[i + 1]]); return pairs; }, []));
if (!args.course || !args.title || !/^[a-z0-9_-]+$/.test(args.course) || !slug(args.title)) {
  throw new Error('Usage: npm run new:note -- --course course-folder --title "Note title" [--course-title "New course name"]');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const { courses } = await readNotes(path.join(root, 'notes'), '/');
const existing = courses.find(c => c.id === args.course);
const title = existing?.title ?? args['course-title'];
if (!title) throw new Error('For a new course, supply --course-title "Course name".');
const order = Math.max(0, ...(existing?.notes.map(n => n.order) ?? [])) + 1;
const folder = path.join(root, 'notes', args.course);
await fs.mkdir(folder, { recursive: true });
const target = path.join(folder, `${String(order).padStart(2, '0')}-${slug(args.title)}.md`);
const template = await fs.readFile(path.join(root, 'templates/note.md'), 'utf8');
const text = template.replace('title: "Your note title"', `title: ${JSON.stringify(args.title)}`).replace('course: "Your course name"', `course: ${JSON.stringify(title)}`).replace('updated: "2026-09-26"', `updated: "${new Date().toISOString().slice(0, 10)}"`).replace('order: 1', `order: ${order}`).replace('# Your note title', `# ${args.title}`);
await fs.writeFile(target, text, { flag: 'wx' });
console.log(`Created ${path.relative(root, target)}`);
