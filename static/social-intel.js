class SocialMediaIntelligence {
    constructor() {
        this.currentSearchResults = [];
        this.bulkSearchData = [];
        this.searchStartTime = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilters();
    }

    setupEventListeners() {
        // Enter key handlers for search inputs
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchByUsername();
        });
        
        document.getElementById('emailInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchByEmail();
        });
        
        document.getElementById('phoneInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchByPhone();
        });

        // Filter change handlers
        document.getElementById('platformFilter').addEventListener('change', () => {
            this.filterResults();
        });
        
        document.getElementById('sortFilter').addEventListener('change', () => {
            this.sortResults();
        });
    }

    setupFilters() {
        // Initialize filter options
        this.updatePlatformFilter();
    }

    switchMethod(method) {
        // Update tab states
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update method visibility
        document.querySelectorAll('.search-method').forEach(methodDiv => {
            methodDiv.classList.remove('active');
        });
        document.getElementById(`${method}-method`).classList.add('active');
    }

    async searchByUsername() {
        const username = document.getElementById('usernameInput').value.trim();
        if (!username) {
            this.showToast('Please enter a username', 'warning');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        if (selectedPlatforms.length === 0) {
            this.showToast('Please select at least one platform', 'warning');
            return;
        }

        this.startSearch('username', username, selectedPlatforms);
    }

    async searchByEmail() {
        const email = document.getElementById('emailInput').value.trim();
        if (!email) {
            this.showToast('Please enter an email address', 'warning');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('Please enter a valid email address', 'warning');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        this.startSearch('email', email, selectedPlatforms);
    }

    async searchByPhone() {
        const phone = document.getElementById('phoneInput').value.trim();
        if (!phone) {
            this.showToast('Please enter a phone number', 'warning');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        this.startSearch('phone', phone, selectedPlatforms);
    }

    async searchByName() {
        const firstName = document.getElementById('firstNameInput').value.trim();
        const lastName = document.getElementById('lastNameInput').value.trim();
        const location = document.getElementById('locationInput').value.trim();

        if (!firstName && !lastName) {
            this.showToast('Please enter at least a first or last name', 'warning');
            return;
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const selectedPlatforms = this.getSelectedPlatforms();
        
        this.startSearch('name', { fullName, firstName, lastName, location }, selectedPlatforms);
    }

    async startSearch(type, query, platforms) {
        this.searchStartTime = Date.now();
        this.showToast('Starting social media search...', 'info');
        
        // Show results section
        document.getElementById('searchResults').style.display = 'block';
        document.getElementById('searchResults').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        // Clear previous results
        this.currentSearchResults = [];
        document.getElementById('resultsGrid').innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching platforms...</div>';

        // Update stats
        document.getElementById('platformsSearched').textContent = platforms.length;
        document.getElementById('profilesFound').textContent = '0';

        try {
            // Simulate search across platforms
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                await this.delay(1000 + Math.random() * 2000); // Realistic delay
                
                const results = await this.searchPlatform(platform, type, query);
                this.currentSearchResults.push(...results);
                
                // Update progress
                this.updateSearchProgress();
            }

            this.displayResults();
            this.updateSearchStats();
            this.showToast(`Search completed! Found ${this.currentSearchResults.length} profiles`, 'success');

        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.', 'error');
        }
    }

    async searchPlatform(platform, type, query) {
        // Simulate platform-specific search
        const results = [];
        const numResults = Math.floor(Math.random() * 3); // 0-2 results per platform

        for (let i = 0; i < numResults; i++) {
            results.push(this.generateMockProfile(platform, type, query));
        }

        return results;
    }

    generateMockProfile(platform, searchType, query) {
        const platformData = {
            facebook: { icon: 'fab fa-facebook', color: '#1877f2', name: 'Facebook' },
            twitter: { icon: 'fab fa-twitter', color: '#1da1f2', name: 'Twitter' },
            instagram: { icon: 'fab fa-instagram', color: '#e4405f', name: 'Instagram' },
            linkedin: { icon: 'fab fa-linkedin', color: '#0077b5', name: 'LinkedIn' },
            youtube: { icon: 'fab fa-youtube', color: '#ff0000', name: 'YouTube' },
            tiktok: { icon: 'fab fa-tiktok', color: '#000000', name: 'TikTok' },
            github: { icon: 'fab fa-github', color: '#333333', name: 'GitHub' },
            reddit: { icon: 'fab fa-reddit', color: '#ff4500', name: 'Reddit' }
        };

        const data = platformData[platform] || platformData.facebook;
        const searchQuery = typeof query === 'object' ? query.fullName : query;

        return {
            id: `${platform}_${Date.now()}_${Math.random()}`,
            platform: platform,
            platformName: data.name,
            platformIcon: data.icon,
            platformColor: data.color,
            username: this.generateUsername(searchQuery),
            displayName: this.generateDisplayName(searchQuery),
            profileUrl: `https://${platform}.com/profile/${this.generateUsername(searchQuery)}`,
            profileImage: `https://via.placeholder.com/100x100/${data.color.replace('#', '')}/ffffff?text=${data.name.charAt(0)}`,
            followers: Math.floor(Math.random() * 10000),
            following: Math.floor(Math.random() * 1000),
            posts: Math.floor(Math.random() * 500),
            verified: Math.random() > 0.8,
            lastActive: this.generateLastActive(),
            bio: this.generateBio(),
            location: this.generateLocation(),
            joinDate: this.generateJoinDate(),
            relevanceScore: Math.floor(Math.random() * 100) + 1
        };
    }

    generateUsername(query) {
        const variations = [
            query.toLowerCase().replace(/\s+/g, '_'),
            query.toLowerCase().replace(/\s+/g, '.'),
            query.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 999),
            query.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 99)
        ];
        return variations[Math.floor(Math.random() * variations.length)];
    }

    generateDisplayName(query) {
        const names = typeof query === 'string' ? [query] : [
            query,
            query + ' ✓',
            query.split(' ')[0],
            query.toUpperCase()
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    generateBio() {
        const bios = [
            'Digital marketing enthusiast | Coffee lover ☕',
            'Photographer | Travel addict 📸',
            'Software developer | Tech geek 💻',
            'Entrepreneur | Startup founder 🚀',
            'Content creator | Influencer ✨',
            'Student | Future engineer 🎓',
            'Artist | Creative soul 🎨',
            'Fitness enthusiast | Healthy lifestyle 💪'
        ];
        return bios[Math.floor(Math.random() * bios.length)];
    }

    generateLocation() {
        const locations = [
            'New York, NY',
            'Los Angeles, CA',
            'London, UK',
            'Paris, France',
            'Tokyo, Japan',
            'Sydney, Australia',
            'Toronto, Canada',
            'Berlin, Germany'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    generateLastActive() {
        const days = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    generateJoinDate() {
        const years = Math.floor(Math.random() * 10) + 1;
        const date = new Date();
        date.setFullYear(date.getFullYear() - years);
        return date.toISOString().split('T')[0];
    }

    updateSearchProgress() {
        document.getElementById('profilesFound').textContent = this.currentSearchResults.length;
    }

    updateSearchStats() {
        const searchTime = ((Date.now() - this.searchStartTime) / 1000).toFixed(1);
        document.getElementById('searchTime').textContent = searchTime;
    }

    displayResults() {
        const resultsGrid = document.getElementById('resultsGrid');
        
        if (this.currentSearchResults.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No profiles found</h3>
                    <p>Try adjusting your search terms or selecting more platforms</p>
                </div>
            `;
            return;
        }

        resultsGrid.innerHTML = this.currentSearchResults.map(profile => `
            <div class="profile-card" data-platform="${profile.platform}">
                <div class="profile-header">
                    <div class="platform-badge" style="background-color: ${profile.platformColor}">
                        <i class="${profile.platformIcon}"></i>
                        <span>${profile.platformName}</span>
                    </div>
                    <div class="relevance-score">${profile.relevanceScore}%</div>
                </div>
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="${profile.profileImage}" alt="Profile picture">
                        ${profile.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                    </div>
                    <div class="profile-details">
                        <h3>${profile.displayName}</h3>
                        <p class="username">@${profile.username}</p>
                        <p class="bio">${profile.bio}</p>
                        <div class="profile-stats">
                            <span><i class="fas fa-users"></i> ${this.formatNumber(profile.followers)}</span>
                            <span><i class="fas fa-user-plus"></i> ${this.formatNumber(profile.following)}</span>
                            <span><i class="fas fa-images"></i> ${this.formatNumber(profile.posts)}</span>
                        </div>
                        <div class="profile-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${profile.location}</span>
                            <span><i class="fas fa-calendar"></i> Joined ${profile.joinDate}</span>
                            <span><i class="fas fa-clock"></i> Active ${profile.lastActive}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <a href="${profile.profileUrl}" target="_blank" class="action-btn primary">
                        <i class="fas fa-external-link-alt"></i>
                        View Profile
                    </a>
                    <button class="action-btn" onclick="socialIntel.analyzeProfile('${profile.id}')">
                        <i class="fas fa-chart-line"></i>
                        Analyze
                    </button>
                    <button class="action-btn" onclick="socialIntel.saveProfile('${profile.id}')">
                        <i class="fas fa-bookmark"></i>
                        Save
                    </button>
                </div>
            </div>
        `).join('');

        this.updatePlatformFilter();
    }

    analyzeProfile(profileId) {
        const profile = this.currentSearchResults.find(p => p.id === profileId);
        if (!profile) return;

        this.showToast('Loading detailed analysis...', 'info');
        
        setTimeout(() => {
            this.showDetailedAnalysis(profile);
        }, 1500);
    }

    showDetailedAnalysis(profile) {
        const analysisSection = document.getElementById('detailedAnalysis');
        const analysisContent = document.getElementById('analysisContent');
        
        const mockAnalysis = this.generateDetailedAnalysis(profile);
        
        analysisContent.innerHTML = `
            <div class="analysis-overview">
                <div class="profile-summary">
                    <img src="${profile.profileImage}" alt="Profile">
                    <div class="summary-info">
                        <h4>${profile.displayName}</h4>
                        <p>@${profile.username} on ${profile.platformName}</p>
                        <div class="trust-score">
                            <span>Trust Score: </span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${mockAnalysis.trustScore}%"></div>
                            </div>
                            <span>${mockAnalysis.trustScore}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="analysis-sections">
                <div class="analysis-section">
                    <h4><i class="fas fa-chart-bar"></i> Activity Analysis</h4>
                    <div class="activity-metrics">
                        <div class="metric">
                            <span class="metric-label">Posting Frequency</span>
                            <span class="metric-value">${mockAnalysis.postingFrequency}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Peak Activity</span>
                            <span class="metric-value">${mockAnalysis.peakActivity}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Engagement Rate</span>
                            <span class="metric-value">${mockAnalysis.engagementRate}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-users"></i> Network Analysis</h4>
                    <div class="network-info">
                        <p><strong>Connected Profiles:</strong> ${mockAnalysis.connectedProfiles}</p>
                        <p><strong>Mutual Connections:</strong> ${mockAnalysis.mutualConnections}</p>
                        <p><strong>Network Influence:</strong> ${mockAnalysis.networkInfluence}</p>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-language"></i> Content Analysis</h4>
                    <div class="content-insights">
                        <p><strong>Primary Language:</strong> ${mockAnalysis.primaryLanguage}</p>
                        <p><strong>Sentiment:</strong> ${mockAnalysis.sentiment}</p>
                        <p><strong>Topics:</strong> ${mockAnalysis.topics.join(', ')}</p>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-shield-alt"></i> Risk Assessment</h4>
                    <div class="risk-indicators">
                        ${mockAnalysis.riskFactors.map(risk => `
                            <div class="risk-item ${risk.level}">
                                <i class="fas fa-${risk.level === 'high' ? 'exclamation-triangle' : risk.level === 'medium' ? 'exclamation-circle' : 'check-circle'}"></i>
                                <span>${risk.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        analysisSection.style.display = 'block';
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateDetailedAnalysis(profile) {
        return {
            trustScore: Math.floor(Math.random() * 40) + 60,
            postingFrequency: ['Daily', 'Weekly', 'Monthly', 'Irregular'][Math.floor(Math.random() * 4)],
            peakActivity: ['Morning', 'Afternoon', 'Evening', 'Night'][Math.floor(Math.random() * 4)],
            engagementRate: Math.floor(Math.random() * 20) + 5,
            connectedProfiles: Math.floor(Math.random() * 50) + 10,
            mutualConnections: Math.floor(Math.random() * 20),
            networkInfluence: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            primaryLanguage: 'English',
            sentiment: ['Positive', 'Neutral', 'Mixed'][Math.floor(Math.random() * 3)],
            topics: ['Technology', 'Travel', 'Food', 'Sports', 'Music'].slice(0, Math.floor(Math.random() * 3) + 2),
            riskFactors: this.generateRiskFactors()
        };
    }

    generateRiskFactors() {
        const allRisks = [
            { level: 'low', description: 'Profile appears authentic' },
            { level: 'low', description: 'Consistent posting history' },
            { level: 'medium', description: 'Limited profile information' },
            { level: 'medium', description: 'Recent account creation' },
            { level: 'high', description: 'Suspicious activity patterns' },
            { level: 'high', description: 'Potential fake profile indicators' }
        ];
        
        return allRisks.slice(0, Math.floor(Math.random() * 4) + 2);
    }

    closeDetailedAnalysis() {
        document.getElementById('detailedAnalysis').style.display = 'none';
    }

    saveProfile(profileId) {
        const profile = this.currentSearchResults.find(p => p.id === profileId);
        if (!profile) return;

        this.showToast(`Profile saved: ${profile.displayName}`, 'success');
        // In a real implementation, this would save to the investigation
    }

    filterResults() {
        const platformFilter = document.getElementById('platformFilter').value;
        const profileCards = document.querySelectorAll('.profile-card');
        
        profileCards.forEach(card => {
            const platform = card.dataset.platform;
            if (platformFilter === 'all' || platform === platformFilter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    sortResults() {
        const sortBy = document.getElementById('sortFilter').value;
        // In a real implementation, this would re-sort the results
        this.showToast(`Results sorted by ${sortBy}`, 'info');
    }

    updatePlatformFilter() {
        const platforms = [...new Set(this.currentSearchResults.map(p => p.platform))];
        const platformFilter = document.getElementById('platformFilter');
        
        // Keep existing options and add new ones
        const existingOptions = Array.from(platformFilter.options).map(opt => opt.value);
        
        platforms.forEach(platform => {
            if (!existingOptions.includes(platform)) {
                const option = document.createElement('option');
                option.value = platform;
                option.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
                platformFilter.appendChild(option);
            }
        });
    }

    getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('input[data-platform]:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.platform);
    }

    selectAllPlatforms() {
        document.querySelectorAll('input[data-platform]').forEach(cb => {
            cb.checked = true;
        });
    }

    deselectAllPlatforms() {
        document.querySelectorAll('input[data-platform]').forEach(cb => {
            cb.checked = false;
        });
    }

    async startBulkSearch() {
        const bulkInput = document.getElementById('bulkSearchInput').value.trim();
        if (!bulkInput) {
            this.showToast('Please enter search terms for bulk search', 'warning');
            return;
        }

        const searchTerms = bulkInput.split('\n').filter(term => term.trim());
        if (searchTerms.length === 0) {
            this.showToast('No valid search terms found', 'warning');
            return;
        }

        const resultsSection = document.getElementById('bulkSearchResults');
        resultsSection.style.display = 'block';
        
        this.bulkSearchData = [];
        let completed = 0;

        for (const term of searchTerms) {
            const cleanTerm = term.trim();
            if (cleanTerm) {
                await this.delay(2000); // Simulate search time
                
                const searchType = this.detectSearchType(cleanTerm);
                const results = await this.performBulkSearch(cleanTerm, searchType);
                
                this.bulkSearchData.push({
                    term: cleanTerm,
                    type: searchType,
                    results: results,
                    profileCount: results.length
                });
                
                completed++;
                this.updateBulkProgress(completed, searchTerms.length);
            }
        }

        this.displayBulkResults();
        this.showToast(`Bulk search completed: ${completed} terms processed`, 'success');
    }

    detectSearchType(term) {
        if (this.isValidEmail(term)) return 'email';
        if (/^\+?[\d\s\-\(\)]+$/.test(term)) return 'phone';
        if (term.includes(' ')) return 'name';
        return 'username';
    }

    async performBulkSearch(term, type) {
        // Simulate search results
        const numResults = Math.floor(Math.random() * 5);
        const results = [];
        
        for (let i = 0; i < numResults; i++) {
            const platform = ['facebook', 'twitter', 'instagram', 'linkedin'][Math.floor(Math.random() * 4)];
            results.push(this.generateMockProfile(platform, type, term));
        }
        
        return results;
    }

    updateBulkProgress(completed, total) {
        const progressFill = document.getElementById('bulkProgress');
        const progressText = document.getElementById('bulkProgressText');
        
        const percentage = (completed / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed} / ${total} completed`;
    }

    displayBulkResults() {
        const summaryContainer = document.getElementById('bulkResultsSummary');
        
        const totalProfiles = this.bulkSearchData.reduce((sum, item) => sum + item.profileCount, 0);
        
        summaryContainer.innerHTML = `
            <div class="bulk-summary-stats">
                <div class="summary-stat">
                    <h4>${this.bulkSearchData.length}</h4>
                    <p>Search Terms</p>
                </div>
                <div class="summary-stat">
                    <h4>${totalProfiles}</h4>
                    <p>Profiles Found</p>
                </div>
                <div class="summary-stat">
                    <h4>${Math.round(totalProfiles / this.bulkSearchData.length * 10) / 10}</h4>
                    <p>Avg per Term</p>
                </div>
            </div>
            
            <div class="bulk-results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Search Term</th>
                            <th>Type</th>
                            <th>Profiles Found</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.bulkSearchData.map(item => `
                            <tr>
                                <td>${item.term}</td>
                                <td><span class="type-badge">${item.type}</span></td>
                                <td>${item.profileCount}</td>
                                <td>
                                    <button class="action-btn small" onclick="socialIntel.viewBulkResults('${item.term}')">
                                        <i class="fas fa-eye"></i>
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    viewBulkResults(term) {
        const item = this.bulkSearchData.find(i => i.term === term);
        if (!item) return;
        
        this.currentSearchResults = item.results;
        this.displayResults();
        
        document.getElementById('searchResults').style.display = 'block';
        document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
        
        this.showToast(`Viewing results for: ${term}`, 'info');
    }

    exportResults() {
        if (this.currentSearchResults.length === 0) {
            this.showToast('No results to export', 'warning');
            return;
        }

        this.showToast('Exporting search results...', 'info');
        
        setTimeout(() => {
            const filename = `social-media-search-${Date.now()}.json`;
            this.showToast(`Results exported: ${filename}`, 'success');
            
            // In a real implementation, this would generate and download the actual file
            const link = document.createElement('a');
            link.href = '#';
            link.download = filename;
            link.click();
        }, 1500);
    }

    // Advanced Tools
    openNetworkMapper() {
        this.showToast('Opening Social Network Mapper...', 'info');
        // In a real implementation, this would open the network mapping tool
    }

    openImageAnalyzer() {
        this.showToast('Opening Profile Image Analyzer...', 'info');
        // In a real implementation, this would open the image analysis tool
    }

    openActivityTimeline() {
        this.showToast('Opening Activity Timeline...', 'info');
        // In a real implementation, this would open the timeline tool
    }

    openContentAnalyzer() {
        this.showToast('Opening Content Analyzer...', 'info');
        // In a real implementation, this would open the content analysis tool
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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

// Initialize Social Media Intelligence
const socialIntel = new SocialMediaIntelligence();

// Global functions for HTML onclick events
function switchMethod(method) {
    socialIntel.switchMethod(method);
}

function searchByUsername() {
    socialIntel.searchByUsername();
}

function searchByEmail() {
    socialIntel.searchByEmail();
}

function searchByPhone() {
    socialIntel.searchByPhone();
}

function searchByName() {
    socialIntel.searchByName();
}

function selectAllPlatforms() {
    socialIntel.selectAllPlatforms();
}

function deselectAllPlatforms() {
    socialIntel.deselectAllPlatforms();
}

function exportResults() {
    socialIntel.exportResults();
}

function startBulkSearch() {
    socialIntel.startBulkSearch();
}

function openNetworkMapper() {
    socialIntel.openNetworkMapper();
}

function openImageAnalyzer() {
    socialIntel.openImageAnalyzer();
}

function openActivityTimeline() {
    socialIntel.openActivityTimeline();
}

function openContentAnalyzer() {
    socialIntel.openContentAnalyzer();
}
