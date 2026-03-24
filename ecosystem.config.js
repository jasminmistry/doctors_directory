module.exports = {
  apps: [
    // -----------------------------------------------------------------------
    // Auto-scaler companion — must start AFTER the main app is online.
    // It connects to the PM2 daemon (shared inside the container) and
    // adjusts the worker count based on average CPU.
    // -----------------------------------------------------------------------
    {
      name: 'autoscaler',
      script: './pm2-autoscaler.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        // Tune these without changing code:
        AUTOSCALER_APP:        'doctors-directory',
        AUTOSCALER_MIN:        process.env.AUTOSCALER_MIN        || '2',
        AUTOSCALER_MAX:        process.env.AUTOSCALER_MAX        || String(require('os').cpus().length),
        AUTOSCALER_UP_CPU:     process.env.AUTOSCALER_UP_CPU     || '70',  // scale up  above this %
        AUTOSCALER_DOWN_CPU:   process.env.AUTOSCALER_DOWN_CPU   || '30',  // scale down below this %
        AUTOSCALER_INTERVAL:   process.env.AUTOSCALER_INTERVAL   || '15000', // poll every 15 s
        AUTOSCALER_COOLDOWN:   process.env.AUTOSCALER_COOLDOWN   || '60000', // 60 s between actions
      },
      error_file: '/dev/stderr',
      out_file: '/dev/stdout',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    // -----------------------------------------------------------------------
    // Main Next.js application
    // -----------------------------------------------------------------------
    {
      name: 'doctors-directory',
      script: 'node_modules/.bin/next',
      args: 'start',

      // --- Scaling ---
      // 'max' uses all available CPUs. Override via PM2_INSTANCES env var
      // when you want to cap cores (e.g. PM2_INSTANCES=2 pm2-runtime start ecosystem.config.js)
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',

      // --- Graceful reload (zero-downtime deploys) ---
      // Wait for the app to signal ready before sending traffic
      wait_ready: true,
      listen_timeout: 30000,   // ms to wait for ready signal before force-starting
      kill_timeout: 10000,     // ms to wait for in-flight requests to drain on stop

      // --- Auto-restart on memory pressure ---
      max_memory_restart: process.env.PM2_MAX_MEMORY || '1G',

      // --- Restart policy ---
      restart_delay: 1000,     // wait 1 s between automatic restarts
      max_restarts: 10,        // give up after 10 rapid restarts
      min_uptime: '5s',        // must stay up 5 s to count as a successful start

      // --- Environment ---
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NEXT_TELEMETRY_DISABLED: '1',
      },

      // --- Logging (route to stdout/stderr so Docker captures them) ---
      error_file: '/dev/stderr',
      out_file: '/dev/stdout',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
