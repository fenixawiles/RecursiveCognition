// dashboard.js
// Logic for handling the user interface and data presentation on the dashboard

import {
    getAllInsightData,
    getSessionData,
    getAllImpactData,
    getValenceTrend
} from './dataExports.js';

// Initialize charts after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateMetricsOverview();
    setupExportMechanism();
});

async function updateMetricsOverview() {
    // Mock data, initializing with sample values
    const totalSessions = 10;
    const totalInsights = 50;
    const breakthroughRate = '20%';
    const collaborationRate = '30%';

    // Fetch data from sources and update UI
document.getElementById('totalSessions').textContent = totalSessions;
document.getElementById('totalInsights').textContent = totalInsights;
document.getElementById('breakthroughRate').textContent = breakthroughRate;
document.getElementById('collaborationRate').textContent = collaborationRate;

    // Initialize charts
    initializeChart('sessionTimelineChart', getTimelineData());
    initializeChart('phaseDistributionChart', getPhaseDistributionData());
    initializeChart('attributionChart', getAttributionData());
    initializeChart('valenceChart', getValenceData());
    initializeChart('impactChart', getImpactData());
}

function initializeChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    // Example chart configuration
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Chart Title'
                }
            }
        }
    });
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

// Placeholder functions for fetching chart data
function getTimelineData() {
    return {
        labels: ['January', 'February', 'March', 'April'],
        datasets: [{
            label: 'Activities',
            data: [10, 20, 30, 40],
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
    };
}

function getPhaseDistributionData() {
    return {
        labels: ['Beginning', 'Middle', 'End'],
        datasets: [{
            label: 'Phase Duration',
            data: [3, 5, 2],
            backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)']
        }]
    };
}

function getAttributionData() {
    return {
        labels: ['User', 'AI', 'Co-constructed'],
        datasets: [{
            label: 'Attributions',
            data: [40, 25, 35],
            backgroundColor: ['rgba(255, 206, 86, 0.5)', 'rgba(54, 235, 162, 0.5)', 'rgba(153, 102, 255, 0.5)']
        }]
    };
}

function getValenceData() {
    return {
        labels: ['Negative', 'Neutral', 'Positive'],
        datasets: [{
            label: 'Valence Scores',
            data: [10, 50, 40],
            backgroundColor: ['rgba(255, 159, 64, 0.5)', 'rgba(201, 203, 207, 0.5)', 'rgba(75, 192, 192, 0.5)']
        }]
    };
}

function getImpactData() {
    return {
        labels: ['Minor', 'Moderate', 'Breakthrough'],
        datasets: [{
            label: 'Impact Ratings',
            data: [40, 45, 15],
            backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(153, 102, 255, 0.5)']
        }]
    };
}
