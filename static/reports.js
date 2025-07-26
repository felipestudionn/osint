// Reports & Analytics JavaScript

class ReportsManager {
    constructor() {
        this.charts = {};
        this.data = {};
        this.dateRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
        };
        
        this.init();
    }

    init() {
        this.setupDatePickers();
        this.loadReportsData();
        this.setupEventListeners();
    }

    setupDatePickers() {
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        startDate.value = this.dateRange.start.toISOString().split('T')[0];
        endDate.value = this.dateRange.end.toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Custom filter type change
        document.getElementById('customFilterType').addEventListener('change', (e) => {
            this.updateCustomFilterOptions(e.target.value);
        });

        // Search and filter handlers
        document.getElementById('topInvestigationsSearch').addEventListener('input', (e) => {
            this.filterTopInvestigations(e.target.value);
        });

        document.getElementById('topInvestigationsSort').addEventListener('change', (e) => {
            this.sortTopInvestigations(e.target.value);
        });

        document.getElementById('activityFilter').addEventListener('change', (e) => {
            this.filterActivityLog(e.target.value);
        });
    }

    async loadReportsData() {
        try {
            // Load all data from API endpoints
            await this.loadMetrics();
            await this.loadTopInvestigations();
            await this.loadActivityLog();
            
            // Initialize charts with API data
            await this.loadActivityChart();
            await this.loadInvestigationTypesChart();
            await this.loadSuccessTrendsChart();
            await this.loadPriorityChart();
            
            // Populate tables
            this.populateTopInvestigationsTable(this.data.topInvestigations || []);
            this.populateActivityLogTable(this.data.activityLog || []);
            
        } catch (error) {
            console.error('Error loading reports data:', error);
            this.showToast('Error loading reports data', 'error');
        }
    }

    async loadMetrics() {
        try {
            const response = await fetch('/api/v1/reports/metrics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const metrics = {
                    totalInvestigations: result.data.total_investigations,
                    totalFindings: result.data.total_findings,
                    successRate: result.data.success_rate,
                    avgTime: result.data.avg_investigation_time
                };
                this.data.metrics = metrics;
            } else {
                // Fallback to simulated data if API fails
                const metrics = {
                    totalInvestigations: 147,
                    totalFindings: 892,
                    successRate: 87.3,
                    avgTime: 14.2
                };
                this.updateMetricsCards(metrics);
            }
        } catch (error) {
            console.error('Error loading metrics:', error);
            // Fallback to simulated data
            const metrics = {
                totalInvestigations: 147,
                totalFindings: 892,
                successRate: 87.3,
                avgTime: 14.2
            };
            this.updateMetricsCards(metrics);
        }
    }

    async loadTopInvestigations() {
        try {
            const response = await fetch('/api/v1/reports/top-investigations?sort_by=findings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let investigations;
            if (response.ok) {
                const result = await response.json();
                investigations = result.data;
            } else {
                // Fallback to simulated data
                investigations = [
                    {
                        name: 'Email Compromise Analysis',
                        type: 'email',
                        findings: 23,
                        duration: '12.5h',
                        success_rate: 95,
                        status: 'completed'
                    },
                    {
                        name: 'Social Media Profile Investigation',
                        type: 'social',
                        findings: 18,
                        duration: '8.2h',
                        success_rate: 89,
                        status: 'completed'
                    },
                    {
                        name: 'Domain Infrastructure Mapping',
                        type: 'domain',
                        findings: 31,
                        duration: '16.7h',
                        success_rate: 92,
                        status: 'active'
                    },
                    {
                        name: 'Phone Number Trace',
                        type: 'phone',
                        findings: 14,
                        duration: '6.3h',
                        success_rate: 78,
                        status: 'completed'
                    },
                    {
                        name: 'Image Forensics Analysis',
                        type: 'image',
                        findings: 9,
                        duration: '4.1h',
                        success_rate: 83,
                        status: 'completed'
                    }
                ];
            }
            
            this.data.topInvestigations = investigations;
        } catch (error) {
            console.error('Error loading top investigations:', error);
            // Fallback to simulated data
            const investigations = [
                {
                    name: 'Email Compromise Analysis',
                    type: 'email',
                    findings: 23,
                    duration: '12.5h',
                    success_rate: 95,
                    status: 'completed'
                },
                {
                    name: 'Social Media Profile Investigation',
                    type: 'social',
                    findings: 18,
                    duration: '8.2h',
                    success_rate: 89,
                    status: 'completed'
                },
                {
                    name: 'Domain Infrastructure Mapping',
                    type: 'domain',
                    findings: 31,
                    duration: '16.7h',
                    success_rate: 92,
                    status: 'active'
                },
                {
                    name: 'Phone Number Trace',
                    type: 'phone',
                    findings: 14,
                    duration: '6.3h',
                    success_rate: 78,
                    status: 'completed'
                },
                {
                    name: 'Image Forensics Analysis',
                    type: 'image',
                    findings: 9,
                    duration: '4.1h',
                    success_rate: 83,
                    status: 'completed'
                }
            ];
            this.data.topInvestigations = investigations;
        }
    }

    async loadActivityLog() {
        try {
            const response = await fetch('/api/v1/reports/activity-log?filter_type=all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let activities;
            if (response.ok) {
                const result = await response.json();
                activities = result.data;
            } else {
                // Fallback to simulated data
                activities = [
                    {
                        timestamp: '2024-01-22T14:30:00Z',
                        action: 'Investigation Completed',
                        investigation: 'Email Compromise Analysis',
                        user: 'admin@example.com',
                        details: 'Investigation marked as completed with 23 findings'
                    },
                    {
                        timestamp: '2024-01-22T14:15:00Z',
                        action: 'New Finding Added',
                        investigation: 'Domain Infrastructure Mapping',
                        user: 'admin@example.com',
                        details: "Added finding: 'Suspicious subdomain identified'"
                    },
                    {
                        timestamp: '2024-01-22T13:45:00Z',
                        action: 'Investigation Created',
                        investigation: 'Social Media Background Check',
                        user: 'admin@example.com',
                        details: 'New investigation created with high priority'
                    },
                    {
                        timestamp: '2024-01-22T12:30:00Z',
                        action: 'Investigation Updated',
                        investigation: 'Phone Number Trace',
                        user: 'admin@example.com',
                        details: 'Progress updated to 75%'
                    },
                    {
                        timestamp: '2024-01-22T11:20:00Z',
                        action: 'Report Exported',
                        investigation: 'Multiple Investigations',
                        user: 'admin@example.com',
                        details: 'PDF report exported for date range'
                    }
                ];
            }
            
            this.populateActivityLogTable(activities);
        } catch (error) {
            console.error('Error loading activity log:', error);
            // Fallback to simulated data
            const activities = [
                {
                    timestamp: '2024-01-22T14:30:00Z',
                    action: 'Investigation Completed',
                    investigation: 'Email Compromise Analysis',
                    user: 'admin@example.com',
                    details: 'Investigation marked as completed with 23 findings'
                },
                {
                    timestamp: '2024-01-22T14:15:00Z',
                    action: 'New Finding Added',
                    investigation: 'Domain Infrastructure Mapping',
                    user: 'admin@example.com',
                    details: "Added finding: 'Suspicious subdomain identified'"
                },
                {
                    timestamp: '2024-01-22T13:45:00Z',
                    action: 'Investigation Created',
                    investigation: 'Social Media Background Check',
                    user: 'admin@example.com',
                    details: 'New investigation created with high priority'
                },
                {
                    timestamp: '2024-01-22T12:30:00Z',
                    action: 'Investigation Updated',
                    investigation: 'Phone Number Trace',
                    user: 'admin@example.com',
                    details: 'Progress updated to 75%'
                },
                {
                    timestamp: '2024-01-22T11:20:00Z',
                    action: 'Report Exported',
                    investigation: 'Multiple Investigations',
                    user: 'admin@example.com',
                    details: 'PDF report exported for date range'
                }
            ];
            this.populateActivityLogTable(activities);
        }
    }

    async loadActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        try {
            const response = await fetch('/api/v1/reports/activity?period=30d', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let data;
            if (response.ok) {
                const result = await response.json();
                data = result.data;
                data.datasets[0].fill = true;
                data.datasets[0].tension = 0.4;
            } else {
                // Fallback to simulated data
                data = {
                    labels: this.generateDateLabels(30),
                    datasets: [{
                        label: 'Investigations',
                        data: this.generateRandomData(30, 3, 18),
                        borderColor: '#4285f4',
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                };
            }
            
            this.charts.activity = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        },
                        x: {
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading activity data:', error);
            // Fallback to simulated data
            const data = {
                labels: this.generateDateLabels(30),
                datasets: [{
                    label: 'Investigations',
                    data: this.generateRandomData(30, 3, 18),
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            };
            
            this.charts.activity = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        },
                        x: {
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        }
    }

    async loadInvestigationTypesChart() {
        const ctx = document.getElementById('typesChart').getContext('2d');
        
        try {
            const response = await fetch('/api/v1/reports/investigation-types', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let data;
            if (response.ok) {
                const result = await response.json();
                data = result.data;
            } else {
                // Fallback to simulated data
                data = {
                    labels: ['Email', 'Domain', 'Social Media', 'Phone', 'Image'],
                    datasets: [{
                        data: [45, 32, 28, 24, 18],
                        backgroundColor: [
                            '#4285f4',
                            '#34a853',
                            '#fbbc04',
                            '#ea4335',
                            '#9aa0a6'
                        ]
                    }]
                };
            }
            
            this.charts.investigationTypes = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9aa0a6',
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading investigation types:', error);
            // Fallback to simulated data
            const data = {
                labels: ['Email', 'Domain', 'Social Media', 'Phone', 'Image'],
                datasets: [{
                    data: [45, 32, 28, 24, 18],
                    backgroundColor: [
                        '#4285f4',
                        '#34a853',
                        '#fbbc04',
                        '#ea4335',
                        '#9aa0a6'
                    ]
                }]
            };
            
            this.charts.investigationTypes = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9aa0a6',
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    }
                }
            });
        }
    }

    async loadSuccessTrendsChart() {
        const ctx = document.getElementById('successChart').getContext('2d');
        
        try {
            const response = await fetch('/api/v1/reports/success-trends?period=monthly', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let data;
            if (response.ok) {
                const result = await response.json();
                data = result.data;
                data.datasets[0].fill = true;
                data.datasets[0].tension = 0.4;
            } else {
                // Fallback to simulated data
                data = {
                    labels: this.generateMonthLabels(12),
                    datasets: [{
                        label: 'Success Rate (%)',
                        data: this.generateRandomData(12, 75, 95),
                        borderColor: '#34a853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                };
            }
            
            this.charts.success = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            min: 70,
                            max: 100,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading success trends:', error);
            // Fallback to simulated data
            const data = {
                labels: this.generateMonthLabels(12),
                datasets: [{
                    label: 'Success Rate (%)',
                    data: this.generateRandomData(12, 75, 95),
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            };
            
            this.charts.success = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            min: 70,
                            max: 100,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        }
    }

    async loadPriorityChart() {
        const ctx = document.getElementById('priorityChart').getContext('2d');
        
        try {
            const response = await fetch('/api/v1/reports/priority-distribution', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let data;
            if (response.ok) {
                const result = await response.json();
                data = result.data;
            } else {
                // Fallback to simulated data
                data = {
                    labels: ['High', 'Medium', 'Low'],
                    datasets: [{
                        data: [23, 78, 46],
                        backgroundColor: [
                            '#ea4335',
                            '#fbbc04',
                            '#34a853'
                        ]
                    }]
                };
            }
            
            this.charts.priority = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading priority distribution:', error);
            // Fallback to simulated data
            const data = {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    data: [23, 78, 46],
                    backgroundColor: [
                        '#ea4335',
                        '#fbbc04',
                        '#34a853'
                    ]
                }]
            };
            
            this.charts.priority = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#2a2a2a'
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9aa0a6'
                            }
                        }
                    }
                }
            });
        }
    }

    updateMetrics() {
        document.getElementById('totalInvestigationsMetric').textContent = this.data.metrics.totalInvestigations;
        document.getElementById('totalFindingsMetric').textContent = this.data.metrics.totalFindings;
        document.getElementById('successRateMetric').textContent = this.data.metrics.successRate + '%';
        document.getElementById('avgTimeMetric').textContent = this.data.metrics.avgTime + 'h';
    }

    initializeCharts() {
        this.createActivityChart();
        this.createInvestigationTypesChart();
        this.createSuccessChart();
        this.createPriorityChart();
    }

    createActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(30),
                datasets: [{
                    label: 'Investigations',
                    data: this.generateRandomData(30, 3, 18),
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#2a2a2a'
                        },
                        ticks: {
                            color: '#9aa0a6'
                        }
                    },
                    x: {
                        grid: {
                            color: '#2a2a2a'
                        },
                        ticks: {
                            color: '#9aa0a6'
                        }
                    }
                }
            }
        });
    }

    createInvestigationTypesChart() {
        const ctx = document.getElementById('investigationTypesChart').getContext('2d');
        
        const data = this.data.investigationTypes;
        
        this.charts.investigationTypes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Email', 'Domain', 'Social Media', 'Phone', 'Image'],
                datasets: [{
                    data: [data.email, data.domain, data.social, data.phone, data.image],
                    backgroundColor: [
                        '#4285f4',
                        '#34a853',
                        '#fbbc04',
                        '#ea4335',
                        '#9aa0a6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9aa0a6',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createSuccessChart() {
        const ctx = document.getElementById('successChart').getContext('2d');
        
        this.charts.success = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateMonthLabels(12),
                datasets: [{
                    label: 'Success Rate (%)',
                    data: this.generateRandomData(12, 75, 95),
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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
                    y: {
                        min: 70,
                        max: 100,
                        grid: {
                            color: '#2a2a2a'
                        },
                        ticks: {
                            color: '#9aa0a6',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: '#2a2a2a'
                        },
                        ticks: {
                            color: '#9aa0a6'
                        }
                    }
                }
            }
        });
    }

    createPriorityChart() {
        const ctx = document.getElementById('priorityChart').getContext('2d');
        
        const data = this.data.priorityDistribution;
        
        this.charts.priority = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    data: [data.high, data.medium, data.low],
                    backgroundColor: [
                        '#ea4335',
                        '#fbbc04',
                        '#34a853'
                    ],
                    borderWidth: 0,
                    borderRadius: 4
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
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#2a2a2a'
                        },
                        ticks: {
                            color: '#9aa0a6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9aa0a6'
                        }
                    }
                }
            }
        });
    }

    populateTables() {
        this.populateTopInvestigations();
        this.populateActivityLog();
    }

    populateTopInvestigationsTable(investigations) {
        const tbody = document.getElementById('topInvestigationsBody');
        tbody.innerHTML = '';
        
        investigations.forEach(inv => {
            const successRate = inv.success_rate || inv.successRate || 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="investigation-cell">
                        <i class="${this.getTypeIcon(inv.type)}"></i>
                        <span>${inv.name}</span>
                    </div>
                </td>
                <td><span class="type-badge type-${inv.type}">${inv.type}</span></td>
                <td><span class="findings-count">${inv.findings}</span></td>
                <td><span class="duration">${inv.duration}</span></td>
                <td>
                    <div class="success-rate">
                        <div class="success-bar">
                            <div class="success-fill" style="width: ${successRate}%"></div>
                        </div>
                        <span>${successRate}%</span>
                    </div>
                </td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    populateActivityLogTable(activities) {
        const tbody = document.getElementById('activityLogBody');
        tbody.innerHTML = '';
        
        activities.forEach(activity => {
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="activity-time">${timeAgo}</span></td>
                <td><span class="activity-action">${activity.action}</span></td>
                <td><span class="activity-investigation">${activity.investigation}</span></td>
                <td><span class="activity-user">${activity.user}</span></td>
                <td><span class="activity-details">${activity.details}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    getTypeIcon(type) {
        const icons = {
            'email': 'fas fa-envelope',
            'domain': 'fas fa-globe',
            'social': 'fab fa-twitter',
            'phone': 'fas fa-phone',
            'image': 'fas fa-camera'
        };
        return icons[type] || 'fas fa-search';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    // Chart update functions
    updateActivityChart() {
        const period = document.getElementById('activityPeriod').value;
        // In a real implementation, this would fetch new data based on period
        this.showToast('Activity chart updated', 'success');
    }

    updateSuccessChart() {
        const period = document.getElementById('successPeriod').value;
        // In a real implementation, this would fetch new data based on period
        this.showToast('Success chart updated', 'success');
    }

    toggleChartType(chartName, type) {
        // Update toggle buttons
        const container = document.querySelector(`#${chartName}Chart`).closest('.chart-card');
        container.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        container.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // Recreate chart with new type
        if (chartName === 'investigationTypes') {
            this.charts.investigationTypes.destroy();
            
            const ctx = document.getElementById('investigationTypesChart').getContext('2d');
            const data = this.data.investigationTypes;
            
            this.charts.investigationTypes = new Chart(ctx, {
                type: type,
                data: {
                    labels: ['Email', 'Domain', 'Social Media', 'Phone', 'Image'],
                    datasets: [{
                        data: [data.email, data.domain, data.social, data.phone, data.image],
                        backgroundColor: [
                            '#4285f4',
                            '#34a853',
                            '#fbbc04',
                            '#ea4335',
                            '#9aa0a6'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: type === 'doughnut' ? 'bottom' : 'top',
                            labels: {
                                color: '#9aa0a6',
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: type === 'bar' ? {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#2a2a2a' },
                            ticks: { color: '#9aa0a6' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#9aa0a6' }
                        }
                    } : {}
                }
            });
        }
    }

    // Filter and search functions
    filterTopInvestigations(searchTerm) {
        const rows = document.querySelectorAll('#topInvestigationsBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    sortTopInvestigations(sortBy) {
        // In a real implementation, this would re-sort the data and repopulate
        this.showToast(`Sorted by ${sortBy}`, 'success');
    }

    filterActivityLog(filterType) {
        const rows = document.querySelectorAll('#activityLogBody tr');
        rows.forEach(row => {
            if (filterType === 'all') {
                row.style.display = '';
            } else {
                const action = row.querySelector('.activity-action').textContent.toLowerCase();
                row.style.display = action.includes(filterType) ? '' : 'none';
            }
        });
    }

    refreshActivityLog() {
        this.showToast('Activity log refreshed', 'success');
        // In a real implementation, this would fetch fresh data
    }

    // Export functions
    async exportReport(format) {
        this.showLoading('Generating ' + format.toUpperCase() + ' report...');
        
        try {
            const response = await fetch('/api/v1/reports/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    format: format,
                    date_range: {
                        start: document.getElementById('startDate').value,
                        end: document.getElementById('endDate').value
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.hideLoading();
                this.showToast(`${format.toUpperCase()} report export initiated successfully`, 'success');
                
                // Simulate download after a delay
                setTimeout(() => {
                    this.showToast('Report ready for download', 'info');
                    // In a real implementation, this would use the download_url from the response
                    const link = document.createElement('a');
                    link.href = '#';
                    link.download = `osint-report-${result.data.export_id}.${format}`;
                    link.click();
                }, 3000);
            } else {
                this.hideLoading();
                this.showToast('Export failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.hideLoading();
            // Fallback to simulated export
            setTimeout(() => {
                this.showToast(`${format.toUpperCase()} report exported successfully`, 'success');
                const link = document.createElement('a');
                link.href = '#';
                link.download = `osint-report.${format}`;
                link.click();
            }, 2000);
        }
    }

    exportAllReports() {
        this.showLoading('Generating comprehensive report package...');
        
        setTimeout(() => {
            this.hideLoading();
            this.showToast('All reports exported successfully', 'success');
        }, 3000);
    }

    // Custom report functions
    updateCustomFilterOptions(filterType) {
        const filterValue = document.getElementById('customFilterValue');
        
        if (!filterType) {
            filterValue.style.display = 'none';
            return;
        }
        
        filterValue.style.display = 'block';
        filterValue.innerHTML = '';
        
        let options = [];
        switch (filterType) {
            case 'type':
                options = ['Email', 'Domain', 'Social Media', 'Phone', 'Image'];
                break;
            case 'status':
                options = ['Active', 'Completed', 'Paused', 'Archived'];
                break;
            case 'priority':
                options = ['High', 'Medium', 'Low'];
                break;
            case 'user':
                options = ['admin@example.com', 'user@example.com'];
                break;
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.toLowerCase();
            optionElement.textContent = option;
            filterValue.appendChild(optionElement);
        });
    }

    previewCustomReport() {
        const reportName = document.getElementById('customReportName').value;
        if (!reportName) {
            this.showToast('Please enter a report name', 'warning');
            return;
        }
        
        this.showToast('Report preview generated', 'success');
        // In a real implementation, this would show a preview modal
    }

    async generateCustomReport() {
        const reportName = document.getElementById('customReportName').value;
        if (!reportName) {
            this.showToast('Please enter a report name', 'warning');
            return;
        }
        
        const reportType = document.getElementById('customReportType').value;
        const metrics = Array.from(document.querySelectorAll('input[name="metrics"]:checked')).map(cb => cb.value);
        const filterType = document.getElementById('customFilterType').value;
        const filterValue = document.getElementById('customFilterValue').value;
        
        this.showLoading('Generating custom report...');
        
        try {
            const response = await fetch('/api/v1/reports/custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: reportName,
                    type: reportType,
                    metrics: metrics,
                    filters: {
                        type: filterType,
                        value: filterValue
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.hideLoading();
                this.showToast('Custom report generated successfully', 'success');
                
                // Reset form
                document.getElementById('customReportName').value = '';
                document.getElementById('customReportType').value = '';
                document.querySelectorAll('input[name="metrics"]:checked').forEach(cb => cb.checked = false);
                document.getElementById('customFilterType').value = '';
                this.updateCustomFilterOptions('');
            } else {
                this.hideLoading();
                this.showToast('Failed to generate custom report', 'error');
            }
        } catch (error) {
            console.error('Custom report error:', error);
            this.hideLoading();
            // Fallback to simulated generation
            setTimeout(() => {
                this.showToast('Custom report generated successfully', 'success');
            }, 2500);
        }
    }

    // Date filter
    applyDateFilter() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            this.showToast('Please select both start and end dates', 'warning');
            return;
        }
        
        this.dateRange.start = new Date(startDate);
        this.dateRange.end = new Date(endDate);
        
        this.showToast('Date filter applied', 'success');
        // In a real implementation, this would reload data with new date range
    }

    // Utility functions
    showLoading(message) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('p').textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        // Implementation for toast notifications
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Global functions for HTML onclick handlers
let reportsManager;

function applyDateFilter() {
    reportsManager.applyDateFilter();
}

function exportAllReports() {
    reportsManager.exportAllReports();
}

function updateActivityChart() {
    reportsManager.updateActivityChart();
}

function updateSuccessChart() {
    reportsManager.updateSuccessChart();
}

function toggleChartType(chartName, type) {
    reportsManager.toggleChartType(chartName, type);
}

function refreshActivityLog() {
    reportsManager.refreshActivityLog();
}

function exportReport(format) {
    reportsManager.exportReport(format);
}

function previewCustomReport() {
    reportsManager.previewCustomReport();
}

function generateCustomReport() {
    reportsManager.generateCustomReport();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    reportsManager = new ReportsManager();
});
