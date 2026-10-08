import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function monthLabel(month) {
  return new Intl.DateTimeFormat('es-NI', { month: 'short' }).format(new Date(2024, Number(month) - 1, 1));
}

export default function SalesChart({ metrics = [] }) {
  const labels = metrics.length ? metrics.map((row) => `${monthLabel(row.Mes)} ${row.Anio}`) : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const values = metrics.length ? metrics.map((row) => Number(row.TotalRecaudado || 0)) : [4200, 5100, 4800, 6200, 7500, 9300];

  const data = {
    labels,
    datasets: [{
      label: 'Métricas de Ventas Mensuales (C$)',
      data: values,
      borderColor: '#C29470',
      backgroundColor: 'rgba(194, 148, 112, 0.2)',
      tension: 0.3,
    }],
  };

  return <Line data={data} options={{ responsive: true, plugins: { legend: { labels: { color: '#fff' } } } }} />;
}
