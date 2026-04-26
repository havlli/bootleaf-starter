import { mkdirSync } from 'node:fs';

const directories = [
    '../src/main/resources/static/images',
    '../src/main/resources/static/js',
    '../src/main/resources/static/lib',
    '../src/main/resources/static/svg',
    '../target/classes/static/css',
    '../target/classes/templates',
];

for (const dir of directories) {
    mkdirSync(dir, { recursive: true });
}
