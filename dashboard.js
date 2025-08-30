// dashboard.js
// Logic for handling the user interface and data presentation on the dashboard

import { generateDashboardData } from './dataExports.js';
import { generateRecommendationExport } from './recommendationEngine.js';

// Initialize charts after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateMetricsOverview();
    setupExportMechanism();
});

async function updateMetricsOverview() {
    const data = generateDashboardData();

    // Top-level metrics
    const totalSessions = data.sessions.sessionCount || 0;
    const totalInsights = data.insights.insightStats?.total || 0;
    const breakthroughs = data.insights.insightStats?.byType?.breakthrough || 0;
    const breakthroughRate = totalInsights > 0 ? Math.round((breakthroughs / totalInsights) * 100) + '%' : '0%';
    const collaborationRate = (data.origins.statistics?.collaborationRate ?? 0) + '%';

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalInsights').textContent = totalInsights;
    document.getElementById('breakthroughRate').textContent = breakthroughRate;
    document.getElementById('collaborationRate').textContent = collaborationRate;

    // Charts
    initializeChart('sessionTimelineChart', buildTimelineChart(data));
    initializeChart('phaseDistributionChart', buildPhaseChart(data));
    initializeChart('attributionChart', buildAttributionChart(data));
    initializeChart('valenceChart', buildValenceChart(data));
    initializeChart('impactChart', buildImpactChart(data));

    // Recommendations
    populateRecommendations();
}

function initializeChart(canvasId, data) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');
    new Chart(ctx, data);
}

function setupExportMechanism() {
    const exportBtn = document.getElementById('exportDataBtn');
    const exportModal = document.getElementById('exportModal');
    const closeModal = document.getElementById('closeExportModal');
    
    exportBtn.addEventListener('click', () => {
        exportModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });

    const cancelExport = document.getElementById('cancelExport');
    const confirmExport = document.getElementById('confirmExport');

    cancelExport.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });

    confirmExport.addEventListener('click', () => {
        performExport();
        exportModal.style.display = 'none';
    });
}

function performExport() {
    const exportFormat = document.getElementById('exportFormat').value;

    // Determine what to export
    const exportOptions = {};
    exportOptions.insights = document.getElementById('exportInsights').checked;
    exportOptions.sessions = document.getElementById('exportSessions').checked;
    exportOptions.metrics = document.getElementById('exportMetrics').checked;
    exportOptions.charts = document.getElementById('exportCharts').checked;

    // Handle the export logic
    console.log('Exporting data in the following format:', exportFormat);
    console.log('Export options:', exportOptions);
    // Fetch and process data based on exportOptions
}

// Builders from real exports
function buildTimelineChart(data) {
    const phases = data.phases.timeline?.phases || [];
    const labels = phases.map(p => p.phase);
    const values = phases.map(p => p.messageCount || 0);
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Messages per Phase',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Session Timeline' } } }
    };
}

function buildPhaseChart(data) {
    const phases = data.phases.phaseData?.phases || [];
    const labels = phases.map(p => p.phase);
    const durations = phases.map(p => {
        const start = new Date(p.startTime).getTime();
        const end = p.endTime ? new Date(p.endTime).getTime() : Date.now();
        return Math.max(0, (end - start) / 60000); // minutes
    });
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Phase Duration (min)',
                data: durations,
                backgroundColor: ['rgba(255,99,132,0.5)', 'rgba(75,192,192,0.5)', 'rgba(153,102,255,0.5)']
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Insight Development Phases' } } }
    };
}

function buildAttributionChart(data) {
    const chartData = data.origins.attributionChart?.chartData || [];
    const labels = chartData.map(x => x.label || x.origin);
    const values = chartData.map(x => x.count);
    return {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Attributions',
                data: values,
                backgroundColor: ['rgba(255, 206, 86, 0.5)', 'rgba(54, 235, 162, 0.5)', 'rgba(153, 102, 255, 0.5)']
            }]
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Insight Attribution' } } }
    };
}

function buildValenceChart(data) {
    const dist = data.valence.valenceData?.valenceDistribution || { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 };
    const labels = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'];
    const values = [dist['-2'] || 0, dist['-1'] || 0, dist['0'] || 0, dist['1'] || 0, dist['2'] || 0];
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Valence Distribution',
                data: values,
                backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(201, 203, 207, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(54, 162, 235, 0.5)']
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Emotional Valence' } } }
    };
}

function buildImpactChart(data) {
    const chartData = data.impacts.impactChart?.chartData || [];
    const labels = chartData.map(x => x.label || x.rating);
    const values = chartData.map(x => x.count);
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Impact Ratings',
                data: values,
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(153, 102, 255, 0.5)']
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Impact Distribution' } } }
    };
}

function populateRecommendations() {
    const rec = generateRecommendationExport();
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;
    container.innerHTML = '';
    (rec.recommendations || []).forEach(r => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <div class="rec-header">${r.icon || '💡'} <strong>${r.title}</strong></div>
            <p>${r.description}</p>
            ${r.reason ? `<small>${r.reason}</small>` : ''}
        `;
        container.appendChild(card);
    });
}
