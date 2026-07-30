import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

console.log('=== OS ===');
console.log(execFileSync('cat', ['/etc/os-release'], { encoding: 'utf8' }));
console.log('=== PACKAGE MANAGERS ===');
for (const manager of ['dnf', 'yum', 'microdnf', 'apk']) {
  try {
    const path = execFileSync('which', [manager], { encoding: 'utf8' }).trim();
    console.log(`${manager}: ${path}`);
  } catch {
    console.log(`${manager}: ausente`);
  }
}
console.log('=== NSPR ===');
for (const directory of ['/usr/lib', '/usr/lib64', '/lib', '/lib64']) {
  if (!existsSync(directory)) continue;
  const matches = readdirSync(directory).filter((name) => name.startsWith('libnspr4.so'));
  for (const match of matches) console.log(`${directory}/${match}`);
}
