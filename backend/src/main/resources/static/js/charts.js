const CHARTS = {
    instances: {},

    destroyChart(canvasId) {
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
            delete this.instances[canvasId];
        }
    },

    renderBarChart(canvasId, label, labels, data, accentColor = '#3b82f6') {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: accentColor,
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    },

    renderLineChart(canvasId, label, labels, data, accentColor = '#3b82f6') {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: accentColor,
                    backgroundColor: accentColor + '15',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: accentColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    },

    renderDoughnutChart(canvasId, labels, data, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f8fafc' : '#1e293b';

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor,
                            font: { family: 'Outfit', size: 12 }
                        }
                    }
                }
            }
        });
    }
};
