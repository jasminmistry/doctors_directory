module.exports = {
  apps: [
    {
      name: 'doctors-directory',
      script: './server.js',          // plain Node.js file — required for cluster mode
      exec_mode: 'cluster',
      // node_args is the correct way to pass V8 flags in PM2 cluster mode.
      // NODE_OPTIONS in env: is not inherited by cluster workers.
      node_args: '--max-old-space-size=3072',
      instances: process.env.PM2_INSTANCES || '2', // safe default; override e.g. PM2_INSTANCES=4
      wait_ready: true,               // wait for process.send('ready') before routing traffic
      listen_timeout: 120000,         // 2 min — allows app.prepare() on slow/low-memory hosts
      kill_timeout: 10000,            // drain in-flight requests before killing a worker
      max_memory_restart: '3072M', // restart if memory exceeds 3GB
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '5s',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      error_file: '/dev/stderr',
      out_file: '/dev/null',
      log_file: '/dev/null',
      merge_logs: false,
    },
  ],
};
