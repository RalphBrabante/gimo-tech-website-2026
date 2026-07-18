const { createInterface } = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { resolve } = require('node:path');
const { config } = require('dotenv');
const { hash } = require('bcryptjs');
const mysql = require('mysql2/promise');

config({ path: resolve(__dirname, '../../.env') });

function hiddenQuestion(label) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Password input requires an interactive terminal.'));
  }

  stdout.write(label);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolvePassword, rejectPassword) => {
    let value = '';

    function finish() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off('data', onData);
      stdout.write('\n');
    }

    function onData(character) {
      if (character === '\u0003') {
        finish();
        rejectPassword(new Error('Cancelled.'));
      } else if (character === '\r' || character === '\n') {
        finish();
        resolvePassword(value);
      } else if (character === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += character;
      }
    }

    stdin.on('data', onData);
  });
}

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  const username = (await prompt.question('Username: ')).trim().toLowerCase();
  const email = (await prompt.question('Recovery email: ')).trim().toLowerCase();
  prompt.close();
  const password = await hiddenQuestion('Password: ');

  if (!username || username.length > 80) {
    throw new Error('Username must contain between 1 and 80 characters.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Enter a valid recovery email address.');
  }

  if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Password must contain 12–128 characters with uppercase, lowercase, and a number.');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  });

  try {
    const passwordHash = await hash(password, 12);
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, is_active)
       VALUES (?, ?, ?, true)
       ON DUPLICATE KEY UPDATE email = VALUES(email), password_hash = VALUES(password_hash), is_active = true,
       failed_login_attempts = 0, password_reset_required = false`,
      [username, email, passwordHash]
    );

    const action = result.affectedRows === 1 ? 'created' : 'updated';
    stdout.write(`Internal user ${action}: ${username}\n`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
