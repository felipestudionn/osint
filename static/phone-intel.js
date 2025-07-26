class PhoneIntelligence {
    constructor() {
        this.currentAnalysis = null;
        this.bulkAnalysisData = [];
        this.init();
    }

    init() {
        // Format phone number input as user types
        const phoneInput = document.getElementById('phoneNumber');
        phoneInput.addEventListener('input', this.formatPhoneInput.bind(this));
        
        // Handle Enter key in phone input
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzePhone();
            }
        });
    }

    formatPhoneInput(event) {
        let value = event.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            if (value.length <= 3) {
                formattedValue = value;
            } else if (value.length <= 6) {
                formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else {
                formattedValue = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }

        event.target.value = formattedValue;
    }

    async analyzePhone() {
        const countryCode = document.getElementById('countryCode').value;
        const phoneNumber = document.getElementById('phoneNumber').value.replace(/\D/g, '');
        
        if (!phoneNumber) {
            this.showToast('Please enter a phone number', 'warning');
            return;
        }

        const fullNumber = countryCode + phoneNumber;
        this.showToast('Analyzing phone number...', 'info');

        try {
            // Show results section
            document.getElementById('phoneResults').style.display = 'block';
            
            // Scroll to results
            document.getElementById('phoneResults').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

            // Start analysis
            await this.performPhoneAnalysis(fullNumber);
            
        } catch (error) {
            console.error('Phone analysis error:', error);
            this.showToast('Analysis failed. Please try again.', 'error');
        }
    }

    async performPhoneAnalysis(phoneNumber) {
        // Basic Information
        await this.loadBasicInfo(phoneNumber);
        
        // Validation Status
        await this.loadValidationStatus(phoneNumber);
        
        // Social Media Presence
        await this.loadSocialPresence(phoneNumber);
        
        // OSINT Sources
        this.loadOSINTSources(phoneNumber);
        
        // Historical Data
        await this.loadHistoricalData(phoneNumber);
        
        // Related Numbers
        await this.loadRelatedNumbers(phoneNumber);

        this.currentAnalysis = {
            number: phoneNumber,
            timestamp: new Date().toISOString(),
            data: this.gatherAnalysisData()
        };

        this.showToast('Phone analysis completed', 'success');
    }

    async loadBasicInfo(phoneNumber) {
        // Simulate API call delay
        await this.delay(1000);

        const mockData = this.generateMockBasicInfo(phoneNumber);
        
        document.getElementById('formattedNumber').textContent = mockData.formatted;
        document.getElementById('phoneCountry').textContent = mockData.country;
        document.getElementById('phoneRegion').textContent = mockData.region;
        document.getElementById('phoneCarrier').textContent = mockData.carrier;
        document.getElementById('phoneType').textContent = mockData.type;
        document.getElementById('phoneTimezone').textContent = mockData.timezone;
    }

    generateMockBasicInfo(phoneNumber) {
        const countryData = {
            '+1': {
                country: 'United States',
                region: 'California, San Francisco',
                carrier: 'Verizon Wireless',
                type: 'Mobile',
                timezone: 'PST (UTC-8)'
            },
            '+34': {
                country: 'Spain',
                region: 'Madrid',
                carrier: 'Movistar',
                type: 'Mobile',
                timezone: 'CET (UTC+1)'
            },
            '+33': {
                country: 'France',
                region: 'Paris',
                carrier: 'Orange',
                type: 'Mobile',
                timezone: 'CET (UTC+1)'
            }
        };

        const countryCode = phoneNumber.substring(0, 3);
        const data = countryData[countryCode] || countryData['+1'];
        
        return {
            formatted: this.formatPhoneNumber(phoneNumber),
            ...data
        };
    }

    formatPhoneNumber(phoneNumber) {
        if (phoneNumber.startsWith('+1')) {
            const number = phoneNumber.substring(2);
            return `+1 (${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
        }
        return phoneNumber;
    }

    async loadValidationStatus(phoneNumber) {
        await this.delay(1500);

        const validationResults = {
            valid: Math.random() > 0.2,
            active: Math.random() > 0.3,
            risk: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
        };

        this.updateValidationStatus('validStatus', validationResults.valid, 
            validationResults.valid ? 'Valid Number' : 'Invalid Number');
        
        this.updateValidationStatus('activeStatus', validationResults.active, 
            validationResults.active ? 'Active' : 'Inactive');
        
        this.updateRiskStatus('riskStatus', validationResults.risk);
    }

    updateValidationStatus(elementId, isValid, text) {
        const element = document.getElementById(elementId);
        element.innerHTML = `
            <i class="fas fa-${isValid ? 'check-circle' : 'times-circle'}"></i>
            <span>${text}</span>
        `;
        element.className = `validation-status ${isValid ? 'valid' : 'invalid'}`;
    }

    updateRiskStatus(elementId, riskLevel) {
        const element = document.getElementById(elementId);
        const riskData = {
            low: { icon: 'shield-alt', text: 'Low Risk', class: 'valid' },
            medium: { icon: 'exclamation-triangle', text: 'Medium Risk', class: 'warning' },
            high: { icon: 'exclamation-circle', text: 'High Risk', class: 'invalid' }
        };

        const risk = riskData[riskLevel];
        element.innerHTML = `
            <i class="fas fa-${risk.icon}"></i>
            <span>${risk.text}</span>
        `;
        element.className = `validation-status ${risk.class}`;
    }

    async loadSocialPresence(phoneNumber) {
        const platforms = ['whatsapp', 'telegram', 'viber', 'signal'];
        
        for (let i = 0; i < platforms.length; i++) {
            await this.delay(800);
            
            const platform = platforms[i];
            const isPresent = Math.random() > 0.6;
            
            const statusElement = document.getElementById(`${platform}Status`);
            const indicatorElement = document.getElementById(`${platform}Indicator`);
            
            statusElement.textContent = isPresent ? 'Account Found' : 'No Account Found';
            indicatorElement.innerHTML = `<i class="fas fa-${isPresent ? 'check-circle' : 'times-circle'}"></i>`;
            indicatorElement.className = `platform-status ${isPresent ? 'found' : 'not-found'}`;
        }
    }

    loadOSINTSources(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Update search links
        document.getElementById('googleSearch').href = 
            `https://www.google.com/search?q="${phoneNumber}"`;
        document.getElementById('bingSearch').href = 
            `https://www.bing.com/search?q="${phoneNumber}"`;
        document.getElementById('duckduckgoSearch').href = 
            `https://duckduckgo.com/?q="${phoneNumber}"`;
        
        document.getElementById('truecallerSearch').href = 
            `https://www.truecaller.com/search/us/${cleanNumber}`;
        document.getElementById('whocalldSearch').href = 
            `https://whocalld.com/+${cleanNumber}`;
        document.getElementById('reversePhoneSearch').href = 
            `https://www.whitepages.com/phone/1-${cleanNumber}`;
        
        document.getElementById('facebookSearch').href = 
            `https://www.facebook.com/search/top/?q=${phoneNumber}`;
        document.getElementById('linkedinSearch').href = 
            `https://www.linkedin.com/search/results/all/?keywords=${phoneNumber}`;
        document.getElementById('twitterSearch').href = 
            `https://twitter.com/search?q="${phoneNumber}"`;
    }

    async loadHistoricalData(phoneNumber) {
        await this.delay(2000);
        
        const timeline = document.getElementById('historyTimeline');
        const mockHistory = this.generateMockHistory();
        
        timeline.innerHTML = mockHistory.map(item => `
            <div class="timeline-item">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    generateMockHistory() {
        const events = [
            { title: 'First Seen', description: 'Number first appeared in public databases' },
            { title: 'Carrier Assignment', description: 'Number assigned to current carrier' },
            { title: 'Social Media Link', description: 'Associated with social media account' },
            { title: 'Business Registration', description: 'Used in business registration' },
            { title: 'Recent Activity', description: 'Recent activity detected' }
        ];

        return events.slice(0, Math.floor(Math.random() * 3) + 2).map((event, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (index * 5 + Math.floor(Math.random() * 10)));
            return {
                ...event,
                date: date.toISOString().split('T')[0]
            };
        });
    }

    async loadRelatedNumbers(phoneNumber) {
        await this.delay(1000);
        
        const relatedNumbers = this.generateRelatedNumbers(phoneNumber);
        const container = document.getElementById('relatedNumbers');
        
        container.innerHTML = relatedNumbers.map(number => `
            <div class="related-number">
                <div class="number-info">
                    <span class="number">${number.formatted}</span>
                    <span class="relation">${number.relation}</span>
                </div>
                <button class="analyze-related-btn" onclick="phoneIntel.analyzeRelatedNumber('${number.raw}')">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `).join('');
    }

    generateRelatedNumbers(phoneNumber) {
        const baseNumber = phoneNumber.replace(/\D/g, '');
        const related = [];
        
        // Sequential numbers
        for (let i = 1; i <= 2; i++) {
            const newNumber = (parseInt(baseNumber.slice(-4)) + i).toString().padStart(4, '0');
            const fullNumber = baseNumber.slice(0, -4) + newNumber;
            related.push({
                raw: '+' + fullNumber,
                formatted: this.formatPhoneNumber('+' + fullNumber),
                relation: 'Sequential'
            });
        }
        
        // Same carrier (random)
        const randomNumber = baseNumber.slice(0, -4) + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        related.push({
            raw: '+' + randomNumber,
            formatted: this.formatPhoneNumber('+' + randomNumber),
            relation: 'Same Carrier'
        });
        
        return related;
    }

    analyzeRelatedNumber(phoneNumber) {
        document.getElementById('phoneNumber').value = phoneNumber.replace(/\D/g, '').slice(1);
        this.analyzePhone();
    }

    async analyzeBulkPhones() {
        const bulkText = document.getElementById('bulkNumbers').value.trim();
        if (!bulkText) {
            this.showToast('Please enter phone numbers to analyze', 'warning');
            return;
        }

        const numbers = bulkText.split('\n').filter(line => line.trim());
        if (numbers.length === 0) {
            this.showToast('No valid phone numbers found', 'warning');
            return;
        }

        const resultsSection = document.getElementById('bulkResults');
        resultsSection.style.display = 'block';
        
        this.bulkAnalysisData = [];
        let completed = 0;

        for (const number of numbers) {
            const cleanNumber = number.trim().replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                await this.delay(1000); // Simulate analysis time
                
                const analysis = this.generateMockBulkAnalysis(number.trim());
                this.bulkAnalysisData.push(analysis);
                
                completed++;
                this.updateBulkProgress(completed, numbers.length);
            }
        }

        this.displayBulkResults();
        this.showToast(`Bulk analysis completed: ${completed} numbers processed`, 'success');
    }

    generateMockBulkAnalysis(phoneNumber) {
        return {
            number: phoneNumber,
            formatted: this.formatPhoneNumber(phoneNumber),
            valid: Math.random() > 0.2,
            active: Math.random() > 0.3,
            carrier: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'][Math.floor(Math.random() * 4)],
            type: Math.random() > 0.7 ? 'Landline' : 'Mobile',
            risk: Math.random() > 0.8 ? 'High' : Math.random() > 0.5 ? 'Medium' : 'Low'
        };
    }

    updateBulkProgress(completed, total) {
        const progressFill = document.getElementById('bulkProgress');
        const progressText = document.getElementById('bulkProgressText');
        
        const percentage = (completed / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed} / ${total} completed`;
    }

    displayBulkResults() {
        const tableContainer = document.getElementById('bulkResultsTable');
        
        const table = `
            <table class="bulk-table">
                <thead>
                    <tr>
                        <th>Phone Number</th>
                        <th>Valid</th>
                        <th>Active</th>
                        <th>Carrier</th>
                        <th>Type</th>
                        <th>Risk</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.bulkAnalysisData.map(data => `
                        <tr>
                            <td>${data.formatted}</td>
                            <td><span class="status-badge ${data.valid ? 'valid' : 'invalid'}">${data.valid ? 'Yes' : 'No'}</span></td>
                            <td><span class="status-badge ${data.active ? 'active' : 'inactive'}">${data.active ? 'Yes' : 'No'}</span></td>
                            <td>${data.carrier}</td>
                            <td>${data.type}</td>
                            <td><span class="risk-badge risk-${data.risk.toLowerCase()}">${data.risk}</span></td>
                            <td>
                                <button class="action-btn" onclick="phoneIntel.analyzeRelatedNumber('${data.number}')">
                                    <i class="fas fa-search"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        tableContainer.innerHTML = table;
    }

    exportPhoneReport(format) {
        if (!this.currentAnalysis) {
            this.showToast('No analysis data to export', 'warning');
            return;
        }

        this.showToast(`Exporting report as ${format.toUpperCase()}...`, 'info');
        
        setTimeout(() => {
            const filename = `phone-analysis-${Date.now()}.${format}`;
            this.showToast(`Report exported: ${filename}`, 'success');
            
            // In a real implementation, this would generate and download the actual file
            const link = document.createElement('a');
            link.href = '#';
            link.download = filename;
            link.click();
        }, 1500);
    }

    saveToInvestigation() {
        if (!this.currentAnalysis) {
            this.showToast('No analysis data to save', 'warning');
            return;
        }

        this.showToast('Saving to investigation...', 'info');
        
        setTimeout(() => {
            this.showToast('Phone analysis saved to current investigation', 'success');
        }, 1000);
    }

    gatherAnalysisData() {
        return {
            basicInfo: {
                formatted: document.getElementById('formattedNumber').textContent,
                country: document.getElementById('phoneCountry').textContent,
                region: document.getElementById('phoneRegion').textContent,
                carrier: document.getElementById('phoneCarrier').textContent,
                type: document.getElementById('phoneType').textContent,
                timezone: document.getElementById('phoneTimezone').textContent
            },
            validation: {
                valid: document.getElementById('validStatus').classList.contains('valid'),
                active: document.getElementById('activeStatus').classList.contains('valid'),
                risk: document.getElementById('riskStatus').textContent
            },
            socialPresence: {
                whatsapp: document.getElementById('whatsappIndicator').classList.contains('found'),
                telegram: document.getElementById('telegramIndicator').classList.contains('found'),
                viber: document.getElementById('viberIndicator').classList.contains('found'),
                signal: document.getElementById('signalIndicator').classList.contains('found')
            }
        };
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
}

// Initialize Phone Intelligence
const phoneIntel = new PhoneIntelligence();

// Global functions for HTML onclick events
function analyzePhone() {
    phoneIntel.analyzePhone();
}

function analyzeRelatedNumber(phoneNumber) {
    phoneIntel.analyzeRelatedNumber(phoneNumber);
}

function analyzeBulkPhones() {
    phoneIntel.analyzeBulkPhones();
}

function exportPhoneReport(format) {
    phoneIntel.exportPhoneReport(format);
}

function saveToInvestigation() {
    phoneIntel.saveToInvestigation();
}
