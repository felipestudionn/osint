// Advanced Search Tools JavaScript

// Tool Toggle Functions
function toggleTool(toolId) {
    const content = document.getElementById(toolId);
    const toggle = content.previousElementSibling.querySelector('.tool-toggle i');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        toggle.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        toggle.style.transform = 'rotate(0deg)';
    }
}

// Google Dorking Functions
function applyDork(dorkQuery) {
    document.getElementById('customDork').value = dorkQuery;
    executeCustomDork();
}

function executeCustomDork() {
    const query = document.getElementById('customDork').value;
    if (!query.trim()) {
        showToast('Please enter a search query', 'warning');
        return;
    }

    showToast('Executing Google dork...', 'info');
    
    // Simulate search results
    setTimeout(() => {
        const results = generateDorkResults(query);
        displayDorkResults(results);
    }, 1500);
}

function generateDorkResults(query) {
    const sampleResults = [
        {
            title: `Advanced result for: ${query}`,
            url: 'https://example.com/result1',
            snippet: 'This is a sample result that would be found using the Google dork query. Contains relevant information...',
            domain: 'example.com'
        },
        {
            title: `Security finding: ${query.substring(0, 30)}...`,
            url: 'https://target-site.com/admin/login',
            snippet: 'Potential security exposure found through advanced search techniques. This demonstrates the power of Google dorking...',
            domain: 'target-site.com'
        },
        {
            title: `Document discovery: ${query}`,
            url: 'https://company.com/documents/sensitive.pdf',
            snippet: 'PDF document containing information related to the search query. Found through file type targeting...',
            domain: 'company.com'
        },
        {
            title: `Social media profile found`,
            url: 'https://linkedin.com/in/target-user',
            snippet: 'Professional profile discovered through social media dorking techniques...',
            domain: 'linkedin.com'
        }
    ];

    return sampleResults.slice(0, Math.floor(Math.random() * 4) + 1);
}

function displayDorkResults(results) {
    const resultsContainer = document.getElementById('dorkResults');
    const resultsList = document.getElementById('dorkResultsList');
    
    resultsList.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.innerHTML = `
            <div class="result-header">
                <h4><a href="${result.url}" target="_blank">${result.title}</a></h4>
                <span class="result-domain">${result.domain}</span>
            </div>
            <p class="result-snippet">${result.snippet}</p>
            <div class="result-actions">
                <button onclick="copyToClipboard('${result.url}')" class="action-btn">
                    <i class="fas fa-copy"></i> Copy URL
                </button>
                <button onclick="analyzeUrl('${result.url}')" class="action-btn">
                    <i class="fas fa-search"></i> Analyze
                </button>
            </div>
        `;
        resultsList.appendChild(resultElement);
    });
    
    resultsContainer.style.display = 'block';
    showToast(`Found ${results.length} results`, 'success');
}

// Domain Analysis Functions
function analyzeDomain() {
    const domain = document.getElementById('domainInput').value.trim();
    if (!domain) {
        showToast('Please enter a domain name', 'warning');
        return;
    }

    showToast('Analyzing domain...', 'info');
    
    setTimeout(() => {
        const analysis = generateDomainAnalysis(domain);
        displayDomainResults(analysis);
    }, 2000);
}

function generateDomainAnalysis(domain) {
    return {
        whois: {
            registrar: 'Example Registrar Inc.',
            creation_date: '2020-01-15',
            expiration_date: '2025-01-15',
            registrant: 'Privacy Protected',
            nameservers: ['ns1.example.com', 'ns2.example.com'],
            status: 'Active'
        },
        subdomains: [
            { name: `www.${domain}`, ip: '192.168.1.1', status: 'Active' },
            { name: `mail.${domain}`, ip: '192.168.1.2', status: 'Active' },
            { name: `ftp.${domain}`, ip: '192.168.1.3', status: 'Active' },
            { name: `admin.${domain}`, ip: '192.168.1.4', status: 'Potential Risk' },
            { name: `api.${domain}`, ip: '192.168.1.5', status: 'Active' }
        ],
        dns: {
            A: ['192.168.1.1'],
            AAAA: ['2001:db8::1'],
            MX: [`mail.${domain}`, `mail2.${domain}`],
            NS: ['ns1.example.com', 'ns2.example.com'],
            TXT: ['v=spf1 include:_spf.google.com ~all']
        },
        security: {
            ssl_certificate: 'Valid (Let\'s Encrypt)',
            security_headers: 'Partial Implementation',
            vulnerabilities: 'Low Risk',
            blacklist_status: 'Clean'
        }
    };
}

function displayDomainResults(analysis) {
    const resultsContainer = document.getElementById('domainResults');
    
    // WHOIS Info
    document.getElementById('whoisInfo').innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <strong>Registrar:</strong> ${analysis.whois.registrar}
            </div>
            <div class="info-item">
                <strong>Creation Date:</strong> ${analysis.whois.creation_date}
            </div>
            <div class="info-item">
                <strong>Expiration Date:</strong> ${analysis.whois.expiration_date}
            </div>
            <div class="info-item">
                <strong>Status:</strong> <span class="status-active">${analysis.whois.status}</span>
            </div>
            <div class="info-item">
                <strong>Nameservers:</strong> ${analysis.whois.nameservers.join(', ')}
            </div>
        </div>
    `;
    
    // Subdomains
    const subdomainsList = analysis.subdomains.map(sub => `
        <div class="subdomain-item">
            <div class="subdomain-name">${sub.name}</div>
            <div class="subdomain-ip">${sub.ip}</div>
            <div class="subdomain-status ${sub.status.includes('Risk') ? 'status-risk' : 'status-active'}">${sub.status}</div>
        </div>
    `).join('');
    
    document.getElementById('subdomainsList').innerHTML = `
        <div class="subdomains-header">
            <div>Subdomain</div>
            <div>IP Address</div>
            <div>Status</div>
        </div>
        ${subdomainsList}
    `;
    
    // DNS Records
    document.getElementById('dnsRecords').innerHTML = `
        <div class="dns-records">
            <div class="dns-record">
                <strong>A Records:</strong> ${analysis.dns.A.join(', ')}
            </div>
            <div class="dns-record">
                <strong>AAAA Records:</strong> ${analysis.dns.AAAA.join(', ')}
            </div>
            <div class="dns-record">
                <strong>MX Records:</strong> ${analysis.dns.MX.join(', ')}
            </div>
            <div class="dns-record">
                <strong>NS Records:</strong> ${analysis.dns.NS.join(', ')}
            </div>
            <div class="dns-record">
                <strong>TXT Records:</strong> ${analysis.dns.TXT.join(', ')}
            </div>
        </div>
    `;
    
    // Security Info
    document.getElementById('securityInfo').innerHTML = `
        <div class="security-grid">
            <div class="security-item">
                <strong>SSL Certificate:</strong> <span class="status-active">${analysis.security.ssl_certificate}</span>
            </div>
            <div class="security-item">
                <strong>Security Headers:</strong> <span class="status-warning">${analysis.security.security_headers}</span>
            </div>
            <div class="security-item">
                <strong>Vulnerabilities:</strong> <span class="status-active">${analysis.security.vulnerabilities}</span>
            </div>
            <div class="security-item">
                <strong>Blacklist Status:</strong> <span class="status-active">${analysis.security.blacklist_status}</span>
            </div>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    showToast('Domain analysis completed', 'success');
}

// Social Media Scanner Functions
function scanSocialMedia() {
    const query = document.getElementById('socialQuery').value.trim();
    if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
    }

    const selectedPlatforms = Array.from(document.querySelectorAll('#social-scanner input[type="checkbox"]:checked'))
        .map(cb => cb.parentElement.textContent.trim());

    if (selectedPlatforms.length === 0) {
        showToast('Please select at least one platform', 'warning');
        return;
    }

    showToast('Scanning social media platforms...', 'info');
    
    setTimeout(() => {
        const results = generateSocialResults(query, selectedPlatforms);
        displaySocialResults(results);
    }, 2500);
}

function generateSocialResults(query, platforms) {
    const platformData = {
        'Facebook': { icon: 'fab fa-facebook', color: '#1877f2' },
        'Twitter': { icon: 'fab fa-twitter', color: '#1da1f2' },
        'Instagram': { icon: 'fab fa-instagram', color: '#e4405f' },
        'LinkedIn': { icon: 'fab fa-linkedin', color: '#0077b5' },
        'YouTube': { icon: 'fab fa-youtube', color: '#ff0000' },
        'TikTok': { icon: 'fab fa-tiktok', color: '#000000' }
    };

    return platforms.map(platform => {
        const cleanPlatform = platform.replace(/\s+/g, '').replace(/[^\w]/g, '');
        const data = platformData[cleanPlatform] || { icon: 'fas fa-user', color: '#666' };
        
        return {
            platform: cleanPlatform,
            icon: data.icon,
            color: data.color,
            profiles: [
                {
                    username: `${query.toLowerCase()}`,
                    url: `https://${cleanPlatform.toLowerCase()}.com/${query.toLowerCase()}`,
                    followers: Math.floor(Math.random() * 10000),
                    verified: Math.random() > 0.7,
                    lastActivity: '2 days ago'
                },
                {
                    username: `${query.toLowerCase()}_official`,
                    url: `https://${cleanPlatform.toLowerCase()}.com/${query.toLowerCase()}_official`,
                    followers: Math.floor(Math.random() * 50000),
                    verified: Math.random() > 0.5,
                    lastActivity: '1 week ago'
                }
            ].slice(0, Math.floor(Math.random() * 2) + 1)
        };
    });
}

function displaySocialResults(results) {
    const resultsContainer = document.getElementById('socialResults');
    const resultsList = document.getElementById('socialResultsList');
    
    resultsList.innerHTML = '';
    
    results.forEach(platform => {
        const platformElement = document.createElement('div');
        platformElement.className = 'social-platform';
        
        const profilesHtml = platform.profiles.map(profile => `
            <div class="social-profile">
                <div class="profile-info">
                    <h4>
                        <a href="${profile.url}" target="_blank">@${profile.username}</a>
                        ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                    </h4>
                    <p>${profile.followers.toLocaleString()} followers • Last active: ${profile.lastActivity}</p>
                </div>
                <div class="profile-actions">
                    <button onclick="copyToClipboard('${profile.url}')" class="action-btn">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="window.open('${profile.url}', '_blank')" class="action-btn">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        platformElement.innerHTML = `
            <div class="platform-header">
                <i class="${platform.icon}" style="color: ${platform.color}"></i>
                <h3>${platform.platform}</h3>
                <span class="profile-count">${platform.profiles.length} profile(s) found</span>
            </div>
            <div class="platform-profiles">
                ${profilesHtml}
            </div>
        `;
        
        resultsList.appendChild(platformElement);
    });
    
    resultsContainer.style.display = 'block';
    showToast(`Found profiles across ${results.length} platforms`, 'success');
}

// Image Analysis Functions
function analyzeImage() {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];
    
    if (!imageUrl && !imageFile) {
        showToast('Please provide an image URL or upload a file', 'warning');
        return;
    }

    showToast('Analyzing image...', 'info');
    
    setTimeout(() => {
        const analysis = generateImageAnalysis(imageUrl || imageFile.name);
        displayImageResults(analysis);
    }, 3000);
}

function generateImageAnalysis(source) {
    return {
        reverse: [
            {
                source: 'Google Images',
                matches: 15,
                url: 'https://images.google.com/search?tbs=sbi:...',
                similar: [
                    { url: 'https://example.com/image1.jpg', similarity: '95%' },
                    { url: 'https://example.com/image2.jpg', similarity: '87%' },
                    { url: 'https://example.com/image3.jpg', similarity: '82%' }
                ]
            },
            {
                source: 'TinEye',
                matches: 8,
                url: 'https://tineye.com/search/...',
                similar: [
                    { url: 'https://site1.com/photo.jpg', similarity: '92%' },
                    { url: 'https://site2.com/pic.jpg', similarity: '89%' }
                ]
            }
        ],
        metadata: {
            filename: source,
            filesize: '2.4 MB',
            dimensions: '1920x1080',
            format: 'JPEG',
            camera: 'Canon EOS 5D Mark IV',
            location: 'GPS coordinates removed',
            timestamp: '2024-01-15 14:30:22',
            software: 'Adobe Photoshop 2024'
        },
        similar: [
            { url: 'https://example.com/similar1.jpg', confidence: '94%' },
            { url: 'https://example.com/similar2.jpg', confidence: '91%' },
            { url: 'https://example.com/similar3.jpg', confidence: '88%' },
            { url: 'https://example.com/similar4.jpg', confidence: '85%' }
        ]
    };
}

function displayImageResults(analysis) {
    const resultsContainer = document.getElementById('imageResults');
    
    // Reverse Search Results
    const reverseHtml = analysis.reverse.map(engine => `
        <div class="reverse-engine">
            <h4>${engine.source} - ${engine.matches} matches found</h4>
            <a href="${engine.url}" target="_blank" class="engine-link">View full results</a>
            <div class="similar-images">
                ${engine.similar.map(img => `
                    <div class="similar-image">
                        <img src="https://via.placeholder.com/100x100/4285f4/ffffff?text=IMG" alt="Similar image">
                        <p>Similarity: ${img.similarity}</p>
                        <a href="${img.url}" target="_blank">View source</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    document.getElementById('reverseResults').innerHTML = reverseHtml;
    
    // Metadata
    document.getElementById('metadataInfo').innerHTML = `
        <div class="metadata-grid">
            ${Object.entries(analysis.metadata).map(([key, value]) => `
                <div class="metadata-item">
                    <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}
                </div>
            `).join('')}
        </div>
    `;
    
    // Similar Images
    const similarHtml = analysis.similar.map(img => `
        <div class="similar-image-large">
            <img src="https://via.placeholder.com/150x150/4285f4/ffffff?text=IMG" alt="Similar image">
            <p>Confidence: ${img.confidence}</p>
            <a href="${img.url}" target="_blank">View source</a>
        </div>
    `).join('');
    
    document.getElementById('similarImages').innerHTML = `
        <div class="similar-images-grid">
            ${similarHtml}
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    showToast('Image analysis completed', 'success');
}

// Tab Functions
function showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function showImageTab(tabName) {
    // Hide all image tab panels
    document.querySelectorAll('.image-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all image tab buttons
    document.querySelectorAll('.image-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard', 'success');
    });
}

function analyzeUrl(url) {
    showToast(`Analyzing ${url}...`, 'info');
    // This would integrate with other tools
}

function showToast(message, type = 'info') {
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
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// File Upload Handler
document.getElementById('imageFile').addEventListener('change', function(e) {
    if (e.target.files[0]) {
        const fileName = e.target.files[0].name;
        document.getElementById('uploadArea').innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>File Selected</h3>
            <p>${fileName}</p>
        `;
    }
});

// Drag and Drop for Image Upload
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('click', () => {
    document.getElementById('imageFile').click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#4285f4';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#333';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#333';
    
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
        document.getElementById('imageFile').files = files;
        const fileName = files[0].name;
        uploadArea.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>File Uploaded</h3>
            <p>${fileName}</p>
        `;
    }
});

// Initialize tools as collapsed
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tool-content').forEach(content => {
        content.style.display = 'none';
    });
});
