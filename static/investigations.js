// Investigations Management JavaScript

class InvestigationsManager {
    constructor() {
        this.investigations = [];
        this.currentView = 'grid';
        this.currentInvestigation = null;
        this.filters = {
            search: '',
            status: '',
            type: '',
            priority: ''
        };
        
        this.init();
    }

    init() {
        this.loadInvestigations();
        this.setupEventListeners();
        this.renderInvestigations();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('investigationSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderInvestigations();
        });

        // Form submission
        document.getElementById('createInvestigationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createInvestigation();
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.investigation-card')) {
                e.preventDefault();
                this.showContextMenu(e);
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    loadInvestigations() {
        // Load from localStorage or create sample data
        const saved = localStorage.getItem('osint_investigations');
        if (saved) {
            this.investigations = JSON.parse(saved);
        } else {
            this.investigations = this.generateSampleInvestigations();
            this.saveInvestigations();
        }
    }

    saveInvestigations() {
        localStorage.setItem('osint_investigations', JSON.stringify(this.investigations));
    }

    generateSampleInvestigations() {
        const sampleInvestigations = [
            {
                id: 'inv_001',
                name: 'Email Compromise Investigation',
                type: 'email',
                target: 'john.doe@company.com',
                description: 'Investigating potential email account compromise and data breach indicators.',
                priority: 'high',
                status: 'active',
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-20T14:45:00Z',
                deadline: '2024-02-01',
                tags: ['cybercrime', 'data-breach', 'email-security'],
                progress: 65,
                findings: [
                    'Email found in 3 data breaches',
                    'Suspicious login activity detected',
                    'Password reuse across multiple platforms'
                ],
                assignedTo: 'admin@example.com',
                estimatedHours: 20,
                actualHours: 13
            },
            {
                id: 'inv_002',
                name: 'Social Media Profile Analysis',
                type: 'social',
                target: '@suspicious_user',
                description: 'Comprehensive analysis of social media presence for background verification.',
                priority: 'medium',
                status: 'completed',
                createdAt: '2024-01-10T09:15:00Z',
                updatedAt: '2024-01-18T16:20:00Z',
                deadline: '2024-01-25',
                tags: ['background-check', 'social-media', 'verification'],
                progress: 100,
                findings: [
                    'Multiple fake profiles identified',
                    'Inconsistent personal information',
                    'Suspicious network connections'
                ],
                assignedTo: 'admin@example.com',
                estimatedHours: 15,
                actualHours: 18
            },
            {
                id: 'inv_003',
                name: 'Domain Infrastructure Mapping',
                type: 'domain',
                target: 'suspicious-site.com',
                description: 'Mapping domain infrastructure and identifying potential malicious activities.',
                priority: 'high',
                status: 'active',
                createdAt: '2024-01-20T11:00:00Z',
                updatedAt: '2024-01-22T13:30:00Z',
                deadline: '2024-02-05',
                tags: ['malware', 'infrastructure', 'threat-intel'],
                progress: 30,
                findings: [
                    'Domain registered with privacy protection',
                    'Multiple subdomains identified',
                    'Hosting provider traced to offshore location'
                ],
                assignedTo: 'admin@example.com',
                estimatedHours: 25,
                actualHours: 8
            },
            {
                id: 'inv_004',
                name: 'Phone Number Investigation',
                type: 'phone',
                target: '+1-555-0123',
                description: 'Investigating phone number associated with fraudulent activities.',
                priority: 'medium',
                status: 'paused',
                createdAt: '2024-01-12T14:20:00Z',
                updatedAt: '2024-01-19T10:15:00Z',
                deadline: '2024-01-30',
                tags: ['fraud', 'phone-investigation', 'scam'],
                progress: 45,
                findings: [
                    'Number linked to multiple online accounts',
                    'VoIP service provider identified',
                    'Previous fraud reports found'
                ],
                assignedTo: 'admin@example.com',
                estimatedHours: 12,
                actualHours: 5
            },
            {
                id: 'inv_005',
                name: 'Image Forensics Analysis',
                type: 'image',
                target: 'suspicious_image.jpg',
                description: 'Forensic analysis of image for authenticity and source identification.',
                priority: 'low',
                status: 'archived',
                createdAt: '2024-01-05T08:45:00Z',
                updatedAt: '2024-01-15T12:00:00Z',
                deadline: '2024-01-20',
                tags: ['forensics', 'image-analysis', 'authenticity'],
                progress: 100,
                findings: [
                    'Image metadata indicates manipulation',
                    'Original source identified through reverse search',
                    'Geolocation data extracted'
                ],
                assignedTo: 'admin@example.com',
                estimatedHours: 8,
                actualHours: 6
            }
        ];

        return sampleInvestigations;
    }

    createInvestigation() {
        const form = document.getElementById('createInvestigationForm');
        const formData = new FormData(form);
        
        const investigation = {
            id: 'inv_' + Date.now(),
            name: document.getElementById('investigationName').value,
            type: document.getElementById('investigationType').value,
            target: document.getElementById('investigationTarget').value,
            description: document.getElementById('investigationDescription').value,
            priority: document.getElementById('investigationPriority').value,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deadline: document.getElementById('investigationDeadline').value,
            tags: document.getElementById('investigationTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            progress: 0,
            findings: [],
            assignedTo: 'admin@example.com',
            estimatedHours: 0,
            actualHours: 0
        };

        this.investigations.unshift(investigation);
        this.saveInvestigations();
        this.renderInvestigations();
        this.updateStatistics();
        this.hideCreateModal();
        this.showToast('Investigation created successfully', 'success');
        
        // Reset form
        form.reset();
    }

    renderInvestigations() {
        const filteredInvestigations = this.filterInvestigations();
        
        if (filteredInvestigations.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        if (this.currentView === 'grid') {
            this.renderGridView(filteredInvestigations);
        } else {
            this.renderListView(filteredInvestigations);
        }
    }

    filterInvestigations() {
        return this.investigations.filter(investigation => {
            const matchesSearch = !this.filters.search || 
                investigation.name.toLowerCase().includes(this.filters.search) ||
                investigation.target.toLowerCase().includes(this.filters.search) ||
                investigation.description.toLowerCase().includes(this.filters.search) ||
                investigation.tags.some(tag => tag.toLowerCase().includes(this.filters.search));

            const matchesStatus = !this.filters.status || investigation.status === this.filters.status;
            const matchesType = !this.filters.type || investigation.type === this.filters.type;
            const matchesPriority = !this.filters.priority || investigation.priority === this.filters.priority;

            return matchesSearch && matchesStatus && matchesType && matchesPriority;
        });
    }

    renderGridView(investigations) {
        const grid = document.getElementById('investigationsGrid');
        grid.innerHTML = '';
        grid.style.display = 'grid';
        document.getElementById('investigationsList').style.display = 'none';

        investigations.forEach(investigation => {
            const card = this.createInvestigationCard(investigation);
            grid.appendChild(card);
        });
    }

    renderListView(investigations) {
        const list = document.getElementById('investigationsList');
        list.innerHTML = '';
        list.style.display = 'block';
        document.getElementById('investigationsGrid').style.display = 'none';

        investigations.forEach(investigation => {
            const row = this.createInvestigationRow(investigation);
            list.appendChild(row);
        });
    }

    createInvestigationCard(investigation) {
        const card = document.createElement('div');
        card.className = 'investigation-card';
        card.dataset.id = investigation.id;
        
        const statusClass = this.getStatusClass(investigation.status);
        const priorityClass = this.getPriorityClass(investigation.priority);
        const typeIcon = this.getTypeIcon(investigation.type);
        
        const daysUntilDeadline = investigation.deadline ? 
            Math.ceil((new Date(investigation.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-type">
                    <i class="${typeIcon}"></i>
                    <span>${this.getTypeName(investigation.type)}</span>
                </div>
                <div class="card-status ${statusClass}">
                    ${investigation.status}
                </div>
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${investigation.name}</h3>
                <p class="card-target">
                    <i class="fas fa-crosshairs"></i>
                    ${investigation.target || 'No target specified'}
                </p>
                <p class="card-description">${investigation.description || 'No description'}</p>
                
                <div class="card-progress">
                    <div class="progress-header">
                        <span>Progress</span>
                        <span>${investigation.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${investigation.progress}%"></div>
                    </div>
                </div>
                
                <div class="card-tags">
                    ${investigation.tags.slice(0, 3).map(tag => 
                        `<span class="tag">${tag}</span>`
                    ).join('')}
                    ${investigation.tags.length > 3 ? `<span class="tag-more">+${investigation.tags.length - 3}</span>` : ''}
                </div>
            </div>
            
            <div class="card-footer">
                <div class="card-meta">
                    <div class="priority ${priorityClass}">
                        <i class="fas fa-flag"></i>
                        ${investigation.priority}
                    </div>
                    ${daysUntilDeadline !== null ? `
                        <div class="deadline ${daysUntilDeadline < 0 ? 'overdue' : daysUntilDeadline < 3 ? 'urgent' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${daysUntilDeadline < 0 ? 'Overdue' : `${daysUntilDeadline}d left`}
                        </div>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="action-btn" onclick="investigationsManager.viewInvestigation('${investigation.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="investigationsManager.editInvestigation('${investigation.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="investigationsManager.toggleStatus('${investigation.id}')" title="Toggle Status">
                        <i class="fas fa-play-pause"></i>
                    </button>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                this.viewInvestigation(investigation.id);
            }
        });

        return card;
    }

    createInvestigationRow(investigation) {
        const row = document.createElement('div');
        row.className = 'investigation-row';
        row.dataset.id = investigation.id;
        
        const statusClass = this.getStatusClass(investigation.status);
        const priorityClass = this.getPriorityClass(investigation.priority);
        const typeIcon = this.getTypeIcon(investigation.type);

        row.innerHTML = `
            <div class="row-checkbox">
                <input type="checkbox" />
            </div>
            <div class="row-type">
                <i class="${typeIcon}"></i>
            </div>
            <div class="row-name">
                <div class="name-primary">${investigation.name}</div>
                <div class="name-secondary">${investigation.target || 'No target'}</div>
            </div>
            <div class="row-status">
                <span class="status-badge ${statusClass}">${investigation.status}</span>
            </div>
            <div class="row-priority">
                <span class="priority-badge ${priorityClass}">${investigation.priority}</span>
            </div>
            <div class="row-progress">
                <div class="mini-progress">
                    <div class="mini-progress-fill" style="width: ${investigation.progress}%"></div>
                </div>
                <span>${investigation.progress}%</span>
            </div>
            <div class="row-updated">
                ${this.formatDate(investigation.updatedAt)}
            </div>
            <div class="row-actions">
                <button class="action-btn" onclick="investigationsManager.viewInvestigation('${investigation.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="investigationsManager.editInvestigation('${investigation.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;

        return row;
    }

    viewInvestigation(id) {
        const investigation = this.investigations.find(inv => inv.id === id);
        if (!investigation) return;

        this.currentInvestigation = investigation;
        
        document.getElementById('detailsTitle').textContent = investigation.name;
        
        const detailsContainer = document.getElementById('investigationDetails');
        detailsContainer.innerHTML = `
            <div class="details-grid">
                <div class="details-main">
                    <div class="detail-section">
                        <h3>Investigation Overview</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Type</label>
                                <div class="detail-value">
                                    <i class="${this.getTypeIcon(investigation.type)}"></i>
                                    ${this.getTypeName(investigation.type)}
                                </div>
                            </div>
                            <div class="detail-item">
                                <label>Status</label>
                                <div class="detail-value">
                                    <span class="status-badge ${this.getStatusClass(investigation.status)}">${investigation.status}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <label>Priority</label>
                                <div class="detail-value">
                                    <span class="priority-badge ${this.getPriorityClass(investigation.priority)}">${investigation.priority}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <label>Progress</label>
                                <div class="detail-value">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${investigation.progress}%"></div>
                                    </div>
                                    <span>${investigation.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Target Information</h3>
                        <div class="detail-item">
                            <label>Primary Target</label>
                            <div class="detail-value target-value">${investigation.target || 'Not specified'}</div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Description</h3>
                        <div class="description-content">
                            ${investigation.description || 'No description provided'}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Key Findings</h3>
                        <div class="findings-list">
                            ${investigation.findings.length > 0 ? 
                                investigation.findings.map(finding => `
                                    <div class="finding-item">
                                        <i class="fas fa-check-circle"></i>
                                        ${finding}
                                    </div>
                                `).join('') : 
                                '<div class="no-findings">No findings recorded yet</div>'
                            }
                        </div>
                    </div>
                </div>

                <div class="details-sidebar">
                    <div class="detail-section">
                        <h3>Timeline</h3>
                        <div class="timeline-item">
                            <label>Created</label>
                            <div class="timeline-value">${this.formatDateTime(investigation.createdAt)}</div>
                        </div>
                        <div class="timeline-item">
                            <label>Last Updated</label>
                            <div class="timeline-value">${this.formatDateTime(investigation.updatedAt)}</div>
                        </div>
                        ${investigation.deadline ? `
                            <div class="timeline-item">
                                <label>Deadline</label>
                                <div class="timeline-value">${this.formatDate(investigation.deadline)}</div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="detail-section">
                        <h3>Assignment</h3>
                        <div class="assignment-info">
                            <div class="assignee">
                                <i class="fas fa-user"></i>
                                ${investigation.assignedTo}
                            </div>
                            <div class="hours-info">
                                <div class="hours-item">
                                    <label>Estimated</label>
                                    <span>${investigation.estimatedHours}h</span>
                                </div>
                                <div class="hours-item">
                                    <label>Actual</label>
                                    <span>${investigation.actualHours}h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Tags</h3>
                        <div class="tags-container">
                            ${investigation.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    }

    updateStatistics() {
        const total = this.investigations.length;
        const active = this.investigations.filter(inv => inv.status === 'active').length;
        const completed = this.investigations.filter(inv => inv.status === 'completed').length;
        const highPriority = this.investigations.filter(inv => inv.priority === 'high').length;

        document.getElementById('totalInvestigations').textContent = total;
        document.getElementById('activeInvestigations').textContent = active;
        document.getElementById('completedInvestigations').textContent = completed;
        document.getElementById('highPriorityInvestigations').textContent = highPriority;
    }

    // Utility methods
    getStatusClass(status) {
        const classes = {
            'active': 'status-active',
            'completed': 'status-completed',
            'paused': 'status-paused',
            'archived': 'status-archived'
        };
        return classes[status] || '';
    }

    getPriorityClass(priority) {
        const classes = {
            'high': 'priority-high',
            'medium': 'priority-medium',
            'low': 'priority-low'
        };
        return classes[priority] || '';
    }

    getTypeIcon(type) {
        const icons = {
            'email': 'fas fa-envelope',
            'domain': 'fas fa-globe',
            'social': 'fab fa-twitter',
            'phone': 'fas fa-phone',
            'image': 'fas fa-camera',
            'general': 'fas fa-search'
        };
        return icons[type] || 'fas fa-search';
    }

    getTypeName(type) {
        const names = {
            'email': 'Email Investigation',
            'domain': 'Domain Analysis',
            'social': 'Social Media',
            'phone': 'Phone Investigation',
            'image': 'Image Analysis',
            'general': 'General OSINT'
        };
        return names[type] || 'Unknown';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    showEmptyState() {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('investigationsGrid').style.display = 'none';
        document.getElementById('investigationsList').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('emptyState').style.display = 'none';
    }

    showToast(message, type = 'info') {
        // Implementation for toast notifications
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    // Modal management
    hideModals() {
        document.getElementById('createModal').style.display = 'none';
        document.getElementById('detailsModal').style.display = 'none';
    }

    // Additional methods for UI interactions
    toggleStatus(id) {
        const investigation = this.investigations.find(inv => inv.id === id);
        if (!investigation) return;

        const statusCycle = ['active', 'paused', 'completed', 'archived'];
        const currentIndex = statusCycle.indexOf(investigation.status);
        investigation.status = statusCycle[(currentIndex + 1) % statusCycle.length];
        investigation.updatedAt = new Date().toISOString();

        this.saveInvestigations();
        this.renderInvestigations();
        this.updateStatistics();
    }

    editInvestigation(id) {
        // Implementation for editing investigations
        this.showToast('Edit functionality coming soon', 'info');
    }

    duplicateInvestigation(id) {
        const investigation = this.investigations.find(inv => inv.id === id);
        if (!investigation) return;

        const duplicate = {
            ...investigation,
            id: 'inv_' + Date.now(),
            name: investigation.name + ' (Copy)',
            status: 'active',
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            findings: []
        };

        this.investigations.unshift(duplicate);
        this.saveInvestigations();
        this.renderInvestigations();
        this.updateStatistics();
        this.showToast('Investigation duplicated successfully', 'success');
    }

    deleteInvestigation(id) {
        if (!confirm('Are you sure you want to delete this investigation?')) return;

        this.investigations = this.investigations.filter(inv => inv.id !== id);
        this.saveInvestigations();
        this.renderInvestigations();
        this.updateStatistics();
        this.hideModals();
        this.showToast('Investigation deleted successfully', 'success');
    }
}

// Global functions for HTML onclick handlers
let investigationsManager;

function showCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
}

function hideCreateModal() {
    document.getElementById('createModal').style.display = 'none';
}

function hideDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function switchView(view) {
    investigationsManager.currentView = view;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    investigationsManager.renderInvestigations();
}

function filterInvestigations() {
    investigationsManager.filters.status = document.getElementById('statusFilter').value;
    investigationsManager.filters.type = document.getElementById('typeFilter').value;
    investigationsManager.filters.priority = document.getElementById('priorityFilter').value;
    investigationsManager.renderInvestigations();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    investigationsManager = new InvestigationsManager();
});
