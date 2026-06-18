// Lightweight sparkline and chart helpers using Chart.js

const chartRegistry = {};

function destroyChart(id) {
  if (chartRegistry[id]) {
    chartRegistry[id].destroy();
    delete chartRegistry[id];
  }
}

function renderSparkline(canvasEl, data, isPositiveTrend) {
  const id = canvasEl.id || (canvasEl.id = 'spark_' + Math.random().toString(36).slice(2));
  destroyChart(id);

  const color = isPositiveTrend ? '#34d399' : '#f87171';
  const ctx = canvasEl.getContext('2d');

  chartRegistry[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 40);
          gradient.addColorStop(0, color + '33');
          gradient.addColorStop(1, color + '00');
          return gradient;
        },
      }],
    },
    options: {
      animation: false,
      responsive: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
}

// Render a full line chart into a canvas element (for section detail views)
function renderLineChart(canvasEl, datasets, labels, opts = {}) {
  const id = canvasEl.id || (canvasEl.id = 'chart_' + Math.random().toString(36).slice(2));
  destroyChart(id);
  const ctx = canvasEl.getContext('2d');

  const colors = ['#4f8ef7', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
  chartRegistry[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: colors[i % colors.length],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      })),
    },
    options: {
      animation: { duration: 300 },
      responsive: true,
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: { color: '#8892aa', font: { size: 11 } },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1a1d27',
          borderColor: '#2e3250',
          borderWidth: 1,
          titleColor: '#e2e8f0',
          bodyColor: '#8892aa',
        },
      },
      scales: {
        x: {
          ticks: { color: '#8892aa', font: { size: 10 } },
          grid: { color: '#2e3250' },
        },
        y: {
          ticks: { color: '#8892aa', font: { size: 10 } },
          grid: { color: '#2e3250' },
          title: opts.yLabel ? { display: true, text: opts.yLabel, color: '#8892aa', font: { size: 10 } } : undefined,
        },
      },
    },
  });
}

// Generate month labels going back N months
function monthLabels(n) {
  const labels = [];
  const now = new Date(2026, 5, 1); // June 2026
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }
  return labels;
}
