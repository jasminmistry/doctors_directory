module.exports = {
  apps: [
    {
      name: 'doctors-directory',
      script: './server.js',          // plain Node.js file — required for cluster mode
      exec_mode: 'cluster',
      instances: process.env.PM2_INSTANCES || '4', // all CPUs; override e.g. PM2_INSTANCES=2
      wait_ready: true,               // wait for process.send('ready') before routing traffic
      listen_timeout: 30000,
      kill_timeout: 10000,            // drain in-flight requests before killing a worker
      max_memory_restart: '4096M',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '5s',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_file: '/dev/null',
      merge_logs: false,
    },
  ],
};
