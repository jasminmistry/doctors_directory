module.exports = {
  apps: [
    {
      name: 'doctors-directory',
      script: 'npm',
      args: 'run start',
      exec_mode: 'fork',
      instances: 2,
      max_memory_restart: '1G',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '5s',
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      error_file: '/dev/stderr',
      out_file: '/dev/stdout',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
