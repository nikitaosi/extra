import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiRoot = resolve(process.env.API_REPO_DIR ?? '../extra-api');
const source = resolve(apiRoot, 'gen/extra/v1/expense_pb.ts');
const destination = resolve('src/shared/api/gen/expense_pb.ts');

await mkdir(resolve('src/shared/api/gen'), { recursive: true });
const generated = await readFile(source, 'utf8');
await writeFile(destination, `${generated.trimEnd()}\n`);
console.log(`Synced generated API types from ${source}`);
