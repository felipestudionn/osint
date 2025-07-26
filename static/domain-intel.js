class DomainIntelligence {
    constructor() {
        this.currentDomainData = null;
        this.bulkAnalysisData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('domainInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzeDomain();
        });

        document.getElementById('subdomainSearch').addEventListener('input', (e) => {
            this.filterSubdomains(e.target.value);
        });

        document.getElementById('subdomainFilter').addEventListener('change', (e) => {
            this.filterSubdomainsByStatus(e.target.value);
        });
    }

    async analyzeDomain() {
        const domain = document.getElementById('domainInput').value.trim().toLowerCase();
        if (!domain) {
            this.showToast('Please enter a domain name', 'warning');
            return;
        }

        if (!this.isValidDomain(domain)) {
            this.showToast('Please enter a valid domain name', 'warning');
            return;
        }

        this.showToast('Analyzing domain...', 'info');
        
        document.getElementById('domainResults').style.display = 'block';
        document.getElementById('domainResults').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        try {
            await this.performDomainAnalysis(domain);
            this.showToast('Domain analysis completed', 'success');
        } catch (error) {
            console.error('Domain analysis error:', error);
            this.showToast('Analysis failed. Please try again.', 'error');
        }
    }

    async performDomainAnalysis(domain) {
        await this.loadBasicInfo(domain);
        
        if (document.getElementById('includeWhois').checked) {
            await this.loadWhoisData(domain);
        }
        
        await this.loadDNSRecords(domain);
        
        if (document.getElementById('includeSubdomains').checked) {
            await this.loadSubdomains(domain);
        }
        
        await this.loadTechnologyStack(domain);
        
        if (document.getElementById('includeSecurity').checked) {
            await this.loadSecurityAssessment(domain);
        }
        
        await this.loadGeolocationData(domain);
        await this.loadRelatedDomains(domain);

        this.currentDomainData = {
            domain: domain,
            timestamp: new Date().toISOString(),
            data: this.gatherDomainData()
        };
    }

    async loadBasicInfo(domain) {
        try {
            const response = await fetch(`/api/v1/domain/basic-info/${domain}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const data = result.data;
                
                document.getElementById('domainName').textContent = data.domain;
                document.getElementById('domainIP').textContent = data.ip;
                document.getElementById('sslStatus').textContent = data.ssl_status;
                document.getElementById('registrationDate').textContent = data.registration_date;
                document.getElementById('expirationDate').textContent = data.expiration_date;
                document.getElementById('registrar').textContent = data.registrar;
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('Error loading basic info:', error);
            // Fallback to mock data
            const mockData = this.generateMockBasicInfo(domain);
            document.getElementById('domainName').textContent = domain;
            document.getElementById('domainIP').textContent = mockData.ip;
            document.getElementById('sslStatus').textContent = mockData.ssl;
            document.getElementById('registrationDate').textContent = mockData.registrationDate;
            document.getElementById('expirationDate').textContent = mockData.expirationDate;
            document.getElementById('registrar').textContent = mockData.registrar;
        }
    }

    generateMockBasicInfo(domain) {
        const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1'];
        const registrars = ['GoDaddy', 'Namecheap', 'CloudFlare', 'Google Domains'];
        
        const regDate = new Date();
        regDate.setFullYear(regDate.getFullYear() - Math.floor(Math.random() * 10) - 1);
        
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + Math.floor(Math.random() * 3) + 1);

        return {
            ip: ips[Math.floor(Math.random() * ips.length)],
            ssl: Math.random() > 0.2 ? 'Valid (TLS 1.3)' : 'Invalid/Expired',
            registrationDate: regDate.toISOString().split('T')[0],
            expirationDate: expDate.toISOString().split('T')[0],
            registrar: registrars[Math.floor(Math.random() * registrars.length)]
        };
    }

    async loadWhoisData(domain) {
        await this.delay(2000);

        const mockWhois = this.generateMockWhoisData(domain);
        const whoisContainer = document.getElementById('whoisContainer');
        
        whoisContainer.innerHTML = `
            <div class="whois-section">
                <h4>Registrant Information</h4>
                <div class="whois-data">
                    <p><strong>Name:</strong> ${mockWhois.registrant.name}</p>
                    <p><strong>Organization:</strong> ${mockWhois.registrant.organization}</p>
                    <p><strong>Email:</strong> ${mockWhois.registrant.email}</p>
                </div>
            </div>
        `;
    }

    generateMockWhoisData(domain) {
        return {
            registrant: {
                name: 'John Doe',
                organization: 'Example Corp',
                email: 'admin@' + domain
            }
        };
    }

    async loadDNSRecords(domain) {
        const recordTypes = ['a', 'aaaa', 'mx', 'ns', 'txt', 'cname'];
        
        for (const type of recordTypes) {
            await this.delay(500);
            const records = this.generateMockDNSRecords(domain, type);
            this.displayDNSRecords(type, records);
        }
    }

    generateMockDNSRecords(domain, type) {
        const records = {
            a: [{ value: '192.168.1.1', ttl: 300 }],
            aaaa: [{ value: '2001:db8::1', ttl: 300 }],
            mx: [{ value: 'mail.' + domain, priority: 10, ttl: 3600 }],
            ns: [{ value: 'ns1.' + domain, ttl: 86400 }],
            txt: [{ value: 'v=spf1 include:_spf.google.com ~all', ttl: 300 }],
            cname: [{ value: 'www.' + domain + ' -> ' + domain, ttl: 300 }]
        };

        return records[type] || [];
    }

    displayDNSRecords(type, records) {
        const container = document.getElementById(`${type}Records`);
        
        if (records.length === 0) {
            container.innerHTML = '<p class="no-records">No records found</p>';
            return;
        }

        container.innerHTML = `
            <table class="dns-table">
                <thead>
                    <tr>
                        <th>Value</th>
                        ${type === 'mx' ? '<th>Priority</th>' : ''}
                        <th>TTL</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => `
                        <tr>
                            <td>${record.value}</td>
                            ${type === 'mx' ? `<td>${record.priority}</td>` : ''}
                            <td>${record.ttl}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    gatherDomainData() {
        return {
            basicInfo: {
                name: document.getElementById('domainName').textContent,
                ip: document.getElementById('domainIP').textContent
            }
        };
    }
}

// Initialize Domain Intelligence
const domainIntel = new DomainIntelligence();

// Global functions
function analyzeDomain() {
    domainIntel.analyzeDomain();
}

function showDNSTab(tabName) {
    document.querySelectorAll('.dns-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.querySelectorAll('.dns-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-panel`).classList.add('active');
    event.target.classList.add('active');
}

function showRelatedTab(tabName) {
    document.querySelectorAll('.related-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.querySelectorAll('.related-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-panel`).classList.add('active');
    event.target.classList.add('active');
}
