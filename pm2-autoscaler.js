/**
 * PM2 Auto-Scaler
 * Runs as a companion process inside the same container.
 * Periodically samples CPU/memory across all cluster workers and
 * scales the target app up or down within configured bounds.
 */

'use strict';

const pm2 = require('pm2');

// ---------------------------------------------------------------------------
// Configuration (override via environment variables)
// ---------------------------------------------------------------------------
const APP_NAME        = process.env.AUTOSCALER_APP        || 'doctors-directory';
const MIN_INSTANCES   = parseInt(process.env.AUTOSCALER_MIN   || '2',  10);
const MAX_INSTANCES   = parseInt(process.env.AUTOSCALER_MAX   || String(require('os').cpus().length), 10);
const SCALE_UP_CPU    = parseInt(process.env.AUTOSCALER_UP_CPU   || '70', 10); // % — scale up above this
const SCALE_DOWN_CPU  = parseInt(process.env.AUTOSCALER_DOWN_CPU || '30', 10); // % — scale down below this
const POLL_INTERVAL   = parseInt(process.env.AUTOSCALER_INTERVAL || '15000', 10); // ms
const COOLDOWN        = parseInt(process.env.AUTOSCALER_COOLDOWN || '60000', 10); // ms between scale actions

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let lastScaleAt = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function log(msg) {
  console.log(`[pm2-autoscaler] ${new Date().toISOString()} ${msg}`);
}

function getProcessList() {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => (err ? reject(err) : resolve(list)));
  });
}

function scaleApp(count) {
  return new Promise((resolve, reject) => {
    pm2.scale(APP_NAME, count, (err) => (err ? reject(err) : resolve()));
  });
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
async function tick() {
  try {
    const list = await getProcessList();
    const workers = list.filter(
      (p) => p.name === APP_NAME && p.pm2_env.status === 'online'
    );

    if (workers.length === 0) {
      log(`No online workers found for "${APP_NAME}", skipping.`);
      return;
    }

    // Average CPU across all workers
    const avgCpu = workers.reduce((sum, p) => sum + (p.monit?.cpu ?? 0), 0) / workers.length;
    const current = workers.length;
    const now = Date.now();
    const cooledDown = now - lastScaleAt >= COOLDOWN;

    log(`workers=${current}  avg_cpu=${avgCpu.toFixed(1)}%  (min=${MIN_INSTANCES} max=${MAX_INSTANCES})`);

    if (!cooledDown) {
      log('In cooldown period, skipping scale decision.');
      return;
    }

    if (avgCpu >= SCALE_UP_CPU && current < MAX_INSTANCES) {
      const next = Math.min(current + 1, MAX_INSTANCES);
      log(`CPU ${avgCpu.toFixed(1)}% >= ${SCALE_UP_CPU}% → scaling UP ${current} → ${next}`);
      await scaleApp(next);
      lastScaleAt = now;
    } else if (avgCpu <= SCALE_DOWN_CPU && current > MIN_INSTANCES) {
      const next = Math.max(current - 1, MIN_INSTANCES);
      log(`CPU ${avgCpu.toFixed(1)}% <= ${SCALE_DOWN_CPU}% → scaling DOWN ${current} → ${next}`);
      await scaleApp(next);
      lastScaleAt = now;
    }
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
pm2.connect((err) => {
  if (err) {
    console.error('[pm2-autoscaler] Failed to connect to PM2 daemon:', err);
    process.exit(1);
  }

  log(
    `Started — app="${APP_NAME}" min=${MIN_INSTANCES} max=${MAX_INSTANCES} ` +
    `scale_up>=${SCALE_UP_CPU}% scale_down<=${SCALE_DOWN_CPU}% ` +
    `poll=${POLL_INTERVAL}ms cooldown=${COOLDOWN}ms`
  );

  // Run immediately then on interval
  tick();
  setInterval(tick, POLL_INTERVAL);
});
