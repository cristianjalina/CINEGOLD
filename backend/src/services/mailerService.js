import net from 'node:net';
import tls from 'node:tls';
import { env } from '../config/env.js';

function encodeBase64(value) {
  return Buffer.from(String(value ?? ''), 'utf8').toString('base64');
}

function createSocket() {
  const port = Number(env.smtp?.port || 587);
  const host = env.smtp?.host;
  const secure = Boolean(env.smtp?.secure) || port === 465;

  if (secure) {
    return tls.connect({
      host,
      port,
      rejectUnauthorized: env.smtp?.rejectUnauthorized !== false,
    });
  }

  return net.createConnection({ host, port });
}

async function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const onData = (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const lastLine = lines[lines.length - 1];
      if (/^\d{3} /.test(lastLine)) {
        socket.off('data', onData);
        resolve(buffer);
      }
    };

    socket.on('data', onData);
    socket.once('error', reject);
  });
}

function writeLine(socket, line) {
  socket.write(`${line}\r\n`);
}

async function expectOk(socket) {
  const response = await readResponse(socket);
  const code = Number(String(response).slice(0, 3));
  if (Number.isNaN(code) || code >= 400) {
    throw new Error(`SMTP error: ${response.trim()}`);
  }
  return response;
}

async function upgradeToTls(socket) {
  writeLine(socket, 'STARTTLS');
  await expectOk(socket);

  return new Promise((resolve, reject) => {
    const tlsSocket = tls.connect({
      socket,
      servername: env.smtp?.host,
      rejectUnauthorized: env.smtp?.rejectUnauthorized !== false,
    });
    tlsSocket.once('secureConnect', () => resolve(tlsSocket));
    tlsSocket.once('error', reject);
  });
}

function sanitizeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

export async function sendSmtpMail({ to, subject, text, html, from }) {
  if (!env.smtp?.host || !env.smtp?.from) {
    return { skipped: true };
  }

  let socket = createSocket();
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('secureConnect', resolve);
    socket.once('error', reject);
  });

  await expectOk(socket);
  writeLine(socket, `EHLO ${env.smtp?.ehlo || 'cinegold.local'}`);
  await expectOk(socket);

  const port = Number(env.smtp?.port || 587);
  const isImplicitTls = Boolean(env.smtp?.secure) || port === 465;
  if (!isImplicitTls && port === 587) {
    socket = await upgradeToTls(socket);
    writeLine(socket, `EHLO ${env.smtp?.ehlo || 'cinegold.local'}`);
    await expectOk(socket);
  }

  if (env.smtp?.user) {
    writeLine(socket, 'AUTH LOGIN');
    await expectOk(socket);
    writeLine(socket, encodeBase64(env.smtp.user));
    await expectOk(socket);
    writeLine(socket, encodeBase64(env.smtp.password));
    await expectOk(socket);
  }

  const fromAddress = from || env.smtp.from;
  writeLine(socket, `MAIL FROM:<${fromAddress}>`);
  await expectOk(socket);
  writeLine(socket, `RCPT TO:<${to}>`);
  await expectOk(socket);
  writeLine(socket, 'DATA');
  await expectOk(socket);
  writeLine(socket, `From: ${sanitizeHeader(fromAddress)}`);
  writeLine(socket, `To: ${sanitizeHeader(to)}`);
  writeLine(socket, `Subject: ${sanitizeHeader(subject)}`);
  writeLine(socket, 'MIME-Version: 1.0');
  writeLine(socket, 'Content-Type: text/html; charset="utf-8"');
  writeLine(socket, '');
  writeLine(socket, html || text || '');
  writeLine(socket, '.');
  await expectOk(socket);
  writeLine(socket, 'QUIT');
  socket.end();

  return { skipped: false };
}
