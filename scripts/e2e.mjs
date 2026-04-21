import { spawn } from 'node:child_process';
import net from 'node:net';

const composeFile = new URL('../../backend-diplo-final/docker-compose.yml', import.meta.url).pathname;

function run(cmd, args, { stdio = 'inherit', env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio, shell: false, env: env ?? process.env });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} failed with ${code}`))));
  });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '0.0.0.0');
  });
}

async function pickPort(preferred, fallbacks = []) {
  const candidates = [preferred, ...fallbacks];
  for (const port of candidates) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found from candidates: ${candidates.join(', ')}`);
}

async function waitFor(url, { timeoutMs = 60_000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main() {
  const shouldKeep = process.env.E2E_KEEP_STACK === '1';
  const backendPort = await pickPort(Number(process.env.BACKEND_PORT ?? 8000), [8001, 8002]);
  const frontendPort = await pickPort(Number(process.env.FRONTEND_PORT ?? 5173), [5174, 5175, 5176]);
  const env = {
    ...process.env,
    BACKEND_PORT: String(backendPort),
    FRONTEND_PORT: String(frontendPort),
    E2E_BASE_URL: `http://localhost:${frontendPort}`,
  };

  try {
    await run('docker', ['compose', '-f', composeFile, 'up', '--build', '-d'], { env });
    await waitFor(`http://localhost:${backendPort}/api/health/`);
    await waitFor(`http://localhost:${frontendPort}/`);
    await run('npx', ['playwright', 'test'], { env });
  } finally {
    if (!shouldKeep) {
      await run('docker', ['compose', '-f', composeFile, 'down', '-v'], { env }).catch(() => {});
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
