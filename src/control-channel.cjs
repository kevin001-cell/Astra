const net = require('node:net');

function claimControlChannel(pipeName, onRestore, options = {}) {
  const timeoutMs = Number(options.timeoutMs) || 1500;
  const onEvent = typeof options.onEvent === 'function' ? options.onEvent : () => {};
  return new Promise(resolve => {
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const server = net.createServer(socket => {
      socket.setEncoding('utf8');
      socket.on('data', command => {
        if (command.includes('restore')) onRestore();
      });
    });
    server.once('error', error => {
      if (error.code !== 'EADDRINUSE') {
        onEvent('server-error', { code: error.code, message: error.message });
        finish({ isPrimary: true, server: null });
        return;
      }
      const client = net.createConnection(pipeName);
      const timeout = setTimeout(() => {
        client.destroy();
        onEvent('secondary-timeout');
        finish({ isPrimary: false, server: null });
      }, timeoutMs);
      client.once('connect', () => {
        clearTimeout(timeout);
        client.end('restore');
        onEvent('secondary-forwarded');
        finish({ isPrimary: false, server: null });
      });
      client.once('error', error => {
        clearTimeout(timeout);
        onEvent('secondary-error', { code: error.code, message: error.message });
        finish({ isPrimary: false, server: null });
      });
    });
    server.listen(pipeName, () => {
      onEvent('listening');
      finish({ isPrimary: true, server });
    });
  });
}

module.exports = { claimControlChannel };
