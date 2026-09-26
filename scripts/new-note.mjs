import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug, readNotes } from './content.mjs';
import { sections } from '../sections.mjs';
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, item, i, all) => { if (item.startsWith('--')) pairs.push([item.slice(2), all[i + 1]]); return pairs; }, []));
if (!args.section || !args.topic || !args.title || !slug(args.title)) {
  throw new Error('Usage: npm run new:note -- --section foundations --topic mathematics --title "Note title" [--course ibm-quantum | --course-title "New course name"]');
}
const section = sections.find(s => s.id === args.section);
if (!section || !section.topics.some(t => t.id === args.topic)) throw new Error('Choose a section and topic from sections.mjs.');
if (args.course && args['course-title']) throw new Error('Use --course for an existing course or --course-title for a new one.');
const root = fileURLToPath(new URL('../', import.meta.url));
const { courses, notes } = await readNotes(path.join(root, 'notes'), '/');
const existing = args.course ? courses.find(c => c.id === args.course) : null;
if (args.course && !existing) throw new Error(`Unknown course ${args.course}. Use --course-title for a new course.`);
const courseTitle = existing?.title ?? args['course-title'];
const courseId = existing?.id ?? (courseTitle ? slug(courseTitle) : null);
if (args['course-title'] && courses.some(c => c.id === courseId)) throw new Error('This course already exists. Use --course with its ID.');
const order = Math.max(0, ...notes.filter(n => n.sectionId === args.section && n.topicId === args.topic).map(n => n.order)) + 1;
const folder = path.join(root, 'notes', args.section, args.topic);
await fs.mkdir(folder, { recursive: true });
const target = path.join(folder, `${String(order).padStart(2, '0')}-${slug(args.title)}.md`);
const template = await fs.readFile(path.join(root, 'templates/note.md'), 'utf8');
const courseFields = courseTitle ? `course: ${JSON.stringify(courseTitle)}\ncourse_id: ${courseId}\n` : '';
const text = template.replace('title: "Your note title"', `title: ${JSON.stringify(args.title)}`).replace('description: "One sentence explaining what this note covers."', `${courseFields}description: "One sentence explaining what this note covers."`).replace('updated: "2026-09-26"', `updated: "${new Date().toISOString().slice(0, 10)}"`).replace('order: 1', `order: ${order}`).replace('# Your note title', `# ${args.title}`);
await fs.writeFile(target, text, { flag: 'wx' });
console.log(`Created ${path.relative(root, target)}`);
