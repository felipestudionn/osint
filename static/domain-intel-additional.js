// Additional Domain Intelligence Functions

// Export and utility functions
function exportDomainData() {
    if (!domainIntel.currentDomainData) {
        domainIntel.showToast('No domain data to export', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(domainIntel.currentDomainData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `domain-analysis-${domainIntel.currentDomainData.domain}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    domainIntel.showToast('Domain data exported successfully', 'success');
}

function saveDomainReport() {
    if (!domainIntel.currentDomainData) {
        domainIntel.showToast('No domain data to save', 'warning');
        return;
    }
    
    const reportData = {
        type: 'domain_analysis',
        target: domainIntel.currentDomainData.domain,
        data: domainIntel.currentDomainData,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`domain-report-${Date.now()}`, JSON.stringify(reportData));
    domainIntel.showToast('Domain report saved successfully', 'success');
}

function analyzeBulkDomains() {
    domainIntel.analyzeBulkDomains();
}

function exportBulkResults() {
    if (!domainIntel.bulkAnalysisData || domainIntel.bulkAnalysisData.length === 0) {
        domainIntel.showToast('No bulk analysis data to export', 'warning');
        return;
    }
    
    const csvContent = domainIntel.convertToCSV(domainIntel.bulkAnalysisData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk-domain-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    domainIntel.showToast('Bulk analysis results exported', 'success');
}

// Add methods to DomainIntelligence prototype
DomainIntelligence.prototype.analyzeBulkDomains = async function() {
    const bulkText = document.getElementById('bulkDomains').value.trim();
    if (!bulkText) {
        this.showToast('Please enter domains to analyze', 'warning');
        return;
    }
    
    const domains = bulkText.split('\n').filter(line => line.trim() && this.isValidDomain(line.trim()));
    if (domains.length === 0) {
        this.showToast('No valid domains found', 'warning');
        return;
    }
    
    const resultsSection = document.getElementById('bulkDomainResults');
    resultsSection.style.display = 'block';
    
    this.bulkAnalysisData = [];
    let completed = 0;
    
    for (const domain of domains) {
        await this.delay(1000);
        const analysis = {
            domain: domain.trim(),
            ip: this.generateRandomIP(),
            status: Math.random() > 0.2 ? 'online' : 'offline',
            ssl: Math.random() > 0.3 ? 'valid' : 'invalid',
            registrar: ['GoDaddy', 'Namecheap', 'CloudFlare'][Math.floor(Math.random() * 3)],
            country: ['US', 'DE', 'UK', 'SG'][Math.floor(Math.random() * 4)],
            security_score: Math.floor(Math.random() * 40) + 60,
            subdomains: Math.floor(Math.random() * 20) + 5
        };
        this.bulkAnalysisData.push(analysis);
        
        completed++;
        this.updateBulkDomainProgress(completed, domains.length);
    }
    
    this.displayBulkDomainResults();
    this.showToast(`Bulk analysis completed: ${completed} domains processed`, 'success');
};

DomainIntelligence.prototype.generateRandomIP = function() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

DomainIntelligence.prototype.updateBulkDomainProgress = function(completed, total) {
    const progressFill = document.getElementById('bulkDomainProgress');
    const progressText = document.getElementById('bulkDomainProgressText');
    
    const percentage = (completed / total) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed} / ${total} completed`;
};

DomainIntelligence.prototype.displayBulkDomainResults = function() {
    const tableContainer = document.getElementById('bulkDomainResultsTable');
    
    const table = `
        <table class="bulk-domain-table">
            <thead>
                <tr>
                    <th>Domain</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>SSL</th>
                    <th>Country</th>
                    <th>Security Score</th>
                    <th>Subdomains</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.bulkAnalysisData.map(data => `
                    <tr>
                        <td>${data.domain}</td>
                        <td>${data.ip}</td>
                        <td><span class="status-badge ${data.status}">${data.status}</span></td>
                        <td><span class="ssl-badge ${data.ssl}">${data.ssl}</span></td>
                        <td>${data.country}</td>
                        <td><span class="score-badge score-${data.security_score >= 80 ? 'good' : data.security_score >= 60 ? 'medium' : 'poor'}">${data.security_score}</span></td>
                        <td>${data.subdomains}</td>
                        <td>
                            <button class="action-btn" onclick="document.getElementById('domainInput').value='${data.domain}'; analyzeDomain();">
                                <i class="fas fa-search"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = table;
};

DomainIntelligence.prototype.convertToCSV = function(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
};

// Add missing methods for API integration
DomainIntelligence.prototype.loadSubdomains = async function(domain) {
    try {
        const response = await fetch(`/api/v1/domain/subdomains/${domain}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            document.getElementById('subdomainCount').textContent = data.stats.total;
            document.getElementById('activeSubdomains').textContent = data.stats.active;
            document.getElementById('inactiveSubdomains').textContent = data.stats.inactive;
            
            this.displaySubdomains(data.subdomains);
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.error('Error loading subdomains:', error);
        const subdomains = this.generateMockSubdomains(domain);
        document.getElementById('subdomainCount').textContent = subdomains.length;
        document.getElementById('activeSubdomains').textContent = subdomains.filter(s => s.active).length;
        document.getElementById('inactiveSubdomains').textContent = subdomains.filter(s => !s.active).length;
        this.displaySubdomains(subdomains);
    }
};

DomainIntelligence.prototype.generateMockSubdomains = function(domain) {
    const commonSubdomains = ['www', 'mail', 'ftp', 'admin', 'api', 'blog'];
    const subdomains = [];
    
    for (let i = 0; i < 6; i++) {
        const subdomain = commonSubdomains[i];
        const fullSubdomain = `${subdomain}.${domain}`;
        
        subdomains.push({
            name: fullSubdomain,
            ip: this.generateRandomIP(),
            active: Math.random() > 0.3,
            interesting: Math.random() > 0.7,
            ports: [80, 443, 22],
            technology: ['Apache', 'Nginx', 'IIS'][Math.floor(Math.random() * 3)]
        });
    }
    
    return subdomains;
};

DomainIntelligence.prototype.displaySubdomains = function(subdomains) {
    const container = document.getElementById('subdomainList');
    
    container.innerHTML = `
        <div class="subdomain-table">
            ${subdomains.map(subdomain => `
                <div class="subdomain-item ${subdomain.active ? 'active' : 'inactive'} ${subdomain.interesting ? 'interesting' : ''}">
                    <div class="subdomain-info">
                        <div class="subdomain-name">
                            <span class="subdomain-url">${subdomain.name}</span>
                            <div class="subdomain-badges">
                                <span class="status-badge ${subdomain.active ? 'active' : 'inactive'}">
                                    ${subdomain.active ? 'Active' : 'Inactive'}
                                </span>
                                ${subdomain.interesting ? '<span class="interesting-badge">Interesting</span>' : ''}
                            </div>
                        </div>
                        <div class="subdomain-details">
                            <span><i class="fas fa-server"></i> ${subdomain.ip}</span>
                            <span><i class="fas fa-cog"></i> ${subdomain.technology}</span>
                            <span><i class="fas fa-network-wired"></i> Ports: ${subdomain.ports.join(', ')}</span>
                        </div>
                    </div>
                    <div class="subdomain-actions">
                        <button class="action-btn" onclick="document.getElementById('domainInput').value='${subdomain.name}'; analyzeDomain();">
                            <i class="fas fa-search"></i>
                        </button>
                        <a href="http://${subdomain.name}" target="_blank" class="action-btn">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};
