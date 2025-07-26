// OSINT Platform - Frontend Application
class OSINTPlatform {
    constructor() {
        this.apiBase = 'http://localhost:8002';
        this.token = localStorage.getItem('osint_token');
        this.currentUser = null;
        this.currentSection = 'dashboard';
        
        this.init();
    }

    async init() {
        this.showLoading();
        this.setupEventListeners();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoading();
            
            if (this.token) {
                this.checkAuthAndLoadDashboard();
            } else {
                this.showLogin();
            }
        }, 2000);
    }

    // Loading Screen
    showLoading() {
        document.getElementById('loadingScreen').style.display = 'flex';
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // Event Listeners
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Mobile menu toggle
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Show register/login
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Quick search
        document.getElementById('quickSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performQuickSearch(e.target.value);
            }
        });
    }

    // Navigation
    navigateToSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'investigations': 'Investigaciones',
            'email-intel': 'Email Intelligence',
            'phone-intel': 'Teléfono Intelligence',
            'search-tools': 'Herramientas de Búsqueda',
            'reports': 'Reportes',
            'settings': 'Configuración'
        };
        document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

        // Show appropriate section
        this.showSection(section);
        this.currentSection = section;
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // Create section if it doesn't exist
            this.createSection(section);
        }
    }

    createSection(section) {
        const contentWrapper = document.querySelector('.content-wrapper');
        const sectionElement = document.createElement('section');
        sectionElement.id = `${section}-section`;
        sectionElement.className = 'content-section active';
        
        switch(section) {
            case 'investigations':
                sectionElement.innerHTML = this.createInvestigationsSection();
                break;
            case 'email-intel':
                sectionElement.innerHTML = this.createEmailIntelSection();
                break;
            case 'phone-intel':
                sectionElement.innerHTML = this.createPhoneIntelSection();
                break;
            case 'search-tools':
                sectionElement.innerHTML = this.createSearchToolsSection();
                break;
            case 'reports':
                sectionElement.innerHTML = this.createReportsSection();
                break;
            case 'settings':
                sectionElement.innerHTML = this.createSettingsSection();
                break;
            default:
                sectionElement.innerHTML = '<div class="text-center mt-2"><h2>Sección en desarrollo</h2></div>';
        }
        
        contentWrapper.appendChild(sectionElement);
        this.setupSectionEventListeners(section);
    }

    // Section Templates
    createEmailIntelSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-envelope"></i> Email Intelligence</h2>
                <p>Análisis completo de direcciones de correo electrónico</p>
            </div>
            
            <div class="email-intel-container">
                <div class="intel-form-card">
                    <h3>Investigar Email</h3>
                    <form id="emailIntelForm">
                        <div class="form-group">
                            <label>Dirección de Email</label>
                            <input type="email" id="targetEmail" placeholder="ejemplo@dominio.com" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="checkBreaches" checked>
                                <span>Verificar Breaches</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="checkSocial" checked>
                                <span>Buscar Redes Sociales</span>
                            </label>
                        </div>
                        <button type="submit" class="intel-btn">
                            <i class="fas fa-search"></i> Iniciar Investigación
                        </button>
                    </form>
                </div>
                
                <div class="intel-results" id="emailResults" style="display: none;">
                    <h3>Resultados de la Investigación</h3>
                    <div id="emailResultsContent"></div>
                </div>
            </div>
        `;
    }

    createPhoneIntelSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-phone"></i> Teléfono Intelligence</h2>
                <p>Análisis de números telefónicos</p>
            </div>
            
            <div class="phone-intel-container">
                <div class="intel-form-card">
                    <h3>Investigar Teléfono</h3>
                    <form id="phoneIntelForm">
                        <div class="form-group">
                            <label>Número de Teléfono</label>
                            <input type="tel" id="targetPhone" placeholder="+1234567890" required>
                        </div>
                        <button type="submit" class="intel-btn">
                            <i class="fas fa-search"></i> Analizar Número
                        </button>
                    </form>
                </div>
                
                <div class="intel-results" id="phoneResults" style="display: none;">
                    <h3>Información del Número</h3>
                    <div id="phoneResultsContent"></div>
                </div>
            </div>
        `;
    }

    createSearchToolsSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-search"></i> Advanced Search Tools</h2>
                <p>Specialized OSINT tools for comprehensive investigations</p>
            </div>
            
            <div class="search-tools-grid">
                <!-- Google Dorking Tool -->
                <div class="tool-card">
                    <div class="tool-header">
                        <div class="tool-icon">
                            <i class="fab fa-google"></i>
                        </div>
                        <div class="tool-info">
                            <h3>Google Dorking</h3>
                            <p>Advanced Google search techniques</p>
                        </div>
                    </div>
                    <div class="tool-content">
                        <div class="quick-dorks">
                            <button class="dork-btn" onclick="platform.executeGoogleDork('site:linkedin.com')">LinkedIn Profiles</button>
                            <button class="dork-btn" onclick="platform.executeGoogleDork('filetype:pdf')">PDF Documents</button>
                            <button class="dork-btn" onclick="platform.executeGoogleDork('inurl:admin')">Admin Panels</button>
                        </div>
                        <div class="custom-dork-input">
                            <input type="text" id="customDorkQuery" placeholder="Enter custom Google dork...">
                            <button onclick="platform.executeCustomDork()" class="execute-btn">
                                <i class="fas fa-search"></i> Execute
                            </button>
                        </div>
                        <div id="dorkResults" class="results-container" style="display: none;"></div>
                    </div>
                </div>

                <!-- Domain Analysis Tool -->
                <div class="tool-card">
                    <div class="tool-header">
                        <div class="tool-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="tool-info">
                            <h3>Domain Analysis</h3>
                            <p>Comprehensive domain investigation</p>
                        </div>
                    </div>
                    <div class="tool-content">
                        <div class="domain-input-group">
                            <input type="text" id="domainInput" placeholder="Enter domain (e.g., example.com)">
                            <button onclick="platform.analyzeDomain()" class="analyze-btn">
                                <i class="fas fa-search"></i> Analyze
                            </button>
                        </div>
                        <div id="domainResults" class="results-container" style="display: none;"></div>
                    </div>
                </div>

                <!-- Social Media Scanner -->
                <div class="tool-card">
                    <div class="tool-header">
                        <div class="tool-icon">
                            <i class="fab fa-twitter"></i>
                        </div>
                        <div class="tool-info">
                            <h3>Social Media Scanner</h3>
                            <p>Search across multiple platforms</p>
                        </div>
                    </div>
                    <div class="tool-content">
                        <div class="social-input-group">
                            <input type="text" id="socialQuery" placeholder="Enter username or name to search">
                            <div class="platform-selection">
                                <label><input type="checkbox" value="facebook" checked> Facebook</label>
                                <label><input type="checkbox" value="twitter" checked> Twitter</label>
                                <label><input type="checkbox" value="instagram" checked> Instagram</label>
                                <label><input type="checkbox" value="linkedin" checked> LinkedIn</label>
                            </div>
                            <button onclick="platform.scanSocialMedia()" class="scan-btn">
                                <i class="fas fa-search"></i> Scan Platforms
                            </button>
                        </div>
                        <div id="socialResults" class="results-container" style="display: none;"></div>
                    </div>
                </div>

                <!-- Image Analysis Tool -->
                <div class="tool-card">
                    <div class="tool-header">
                        <div class="tool-icon">
                            <i class="fas fa-camera"></i>
                        </div>
                        <div class="tool-info">
                            <h3>Image Analysis</h3>
                            <p>Reverse search and metadata extraction</p>
                        </div>
                    </div>
                    <div class="tool-content">
                        <div class="image-input-group">
                            <input type="url" id="imageUrl" placeholder="Enter image URL...">
                            <button onclick="platform.analyzeImage()" class="analyze-btn">
                                <i class="fas fa-search"></i> Analyze
                            </button>
                        </div>
                        <div id="imageResults" class="results-container" style="display: none;"></div>
                    </div>
                </div>
            </div>
                <div class="intel-form-card">
                    <h3>Búsqueda Multi-Motor</h3>
                    <form id="searchToolsForm">
                        <div class="form-group">
                            <label>Término de Búsqueda</label>
                            <input type="text" id="searchQuery" placeholder="Ingresa tu búsqueda..." required>
                        </div>
                        <div class="form-group">
                            <label>Motores de Búsqueda</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="engines" value="google" checked>
                                    <span>Google</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="engines" value="bing" checked>
                                    <span>Bing</span>
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="intel-btn">
                            <i class="fas fa-search"></i> Buscar
                        </button>
                    </form>
                </div>
                
                <div class="intel-results" id="searchResults" style="display: none;">
                    <h3>Resultados de Búsqueda</h3>
                    <div id="searchResultsContent"></div>
                </div>
            </div>
        `;
    }

    createInvestigationsSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-folder-open"></i> Gestión de Investigaciones</h2>
                <p>Organiza y gestiona tus investigaciones OSINT</p>
            </div>
            
            <div class="investigations-container">
                <div class="investigations-toolbar">
                    <button class="action-btn" id="newInvestigationBtn">
                        <i class="fas fa-plus"></i> Nueva Investigación
                    </button>
                    <div class="search-filter">
                        <input type="text" placeholder="Buscar investigaciones..." id="investigationSearch">
                        <select id="investigationFilter">
                            <option value="all">Todas</option>
                            <option value="email">Email</option>
                            <option value="phone">Teléfono</option>
                            <option value="domain">Dominio</option>
                        </select>
                    </div>
                </div>
                
                <div class="investigations-grid" id="investigationsGrid">
                    <!-- Investigations will be loaded here -->
                </div>
            </div>
        `;
    }

    createReportsSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-chart-bar"></i> Reportes y Análisis</h2>
                <p>Visualización de datos y exportación de resultados</p>
            </div>
            
            <div class="reports-container">
                <div class="reports-grid">
                    <div class="report-card">
                        <h3>Resumen de Actividad</h3>
                        <canvas id="activityChart"></canvas>
                    </div>
                    <div class="report-card">
                        <h3>Tipos de Investigación</h3>
                        <canvas id="investigationTypesChart"></canvas>
                    </div>
                </div>
                
                <div class="export-section">
                    <h3>Exportar Datos</h3>
                    <div class="export-buttons">
                        <button class="export-btn" data-format="pdf">
                            <i class="fas fa-file-pdf"></i> Exportar PDF
                        </button>
                        <button class="export-btn" data-format="excel">
                            <i class="fas fa-file-excel"></i> Exportar Excel
                        </button>
                        <button class="export-btn" data-format="json">
                            <i class="fas fa-file-code"></i> Exportar JSON
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createSettingsSection() {
        return `
            <div class="section-header mb-2">
                <h2><i class="fas fa-cog"></i> Configuración</h2>
                <p>Personaliza tu experiencia en la plataforma</p>
            </div>
            
            <div class="settings-container">
                <div class="settings-card">
                    <h3>Perfil de Usuario</h3>
                    <form id="profileForm">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="profileEmail" readonly>
                        </div>
                        <div class="form-group">
                            <label>Rol</label>
                            <input type="text" id="profileRole" readonly>
                        </div>
                        <div class="form-group">
                            <label>Nueva Contraseña</label>
                            <input type="password" id="newPassword" placeholder="Dejar vacío para no cambiar">
                        </div>
                        <button type="submit" class="intel-btn">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </form>
                </div>
                
                <div class="settings-card">
                    <h3>Preferencias</h3>
                    <div class="preference-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="emailNotifications" checked>
                            <span>Notificaciones por Email</span>
                        </label>
                    </div>
                    <div class="preference-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoSave" checked>
                            <span>Guardado Automático</span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h3>API Token</h3>
                    <div class="token-display">
                        <input type="text" id="apiToken" readonly value="${this.token || 'No disponible'}">
                        <button class="copy-btn" onclick="this.previousElementSibling.select(); document.execCommand('copy');">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Authentication
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access_token;
                localStorage.setItem('osint_token', this.token);
                this.currentUser = data.user;
                this.showToast('Login exitoso', 'success');
                this.showDashboard();
            } else {
                this.showToast(data.detail || 'Error de login', 'error');
            }
        } catch (error) {
            this.showToast('Error de conexión', 'error');
            console.error('Login error:', error);
        }
    }

    async handleRegister() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        try {
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Registro exitoso. Por favor inicia sesión.', 'success');
                this.showLogin();
            } else {
                this.showToast(data.detail || 'Error de registro', 'error');
            }
        } catch (error) {
            this.showToast('Error de conexión', 'error');
            console.error('Register error:', error);
        }
    }

    async checkAuthAndLoadDashboard() {
        try {
            const response = await fetch(`${this.apiBase}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.showDashboard();
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('osint_token');
        this.showLogin();
    }

    // UI State Management
    showLogin() {
        document.getElementById('login-section').classList.add('active');
        document.getElementById('dashboard-section').classList.remove('active');
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('mainContent').style.marginLeft = '0';
        document.querySelector('.login-box').style.display = 'block';
        document.getElementById('registerBox').style.display = 'none';
    }

    showRegister() {
        document.querySelector('.login-box').style.display = 'none';
        document.getElementById('registerBox').style.display = 'block';
    }

    showDashboard() {
        document.getElementById('login-section').classList.remove('active');
        document.getElementById('dashboard-section').classList.add('active');
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('mainContent').style.marginLeft = '280px';
        
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser.email || 'Usuario';
        }
        
        this.loadDashboardData();
    }

    // Dashboard Data
    async loadDashboardData() {
        try {
            // Load investigations count
            const investigationsResponse = await fetch(`${this.apiBase}/api/v1/investigations`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (investigationsResponse.ok) {
                const investigations = await investigationsResponse.json();
                document.getElementById('totalInvestigations').textContent = investigations.length || 0;
            }

            // Simulate other stats
            document.getElementById('emailsAnalyzed').textContent = Math.floor(Math.random() * 50) + 10;
            document.getElementById('searchesPerformed').textContent = Math.floor(Math.random() * 100) + 25;
            document.getElementById('threatsDetected').textContent = Math.floor(Math.random() * 5);

            this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    loadRecentActivity() {
        const activities = [
            { time: '10:30 AM', description: 'Investigación de email completada: target@example.com' },
            { time: '09:15 AM', description: 'Nuevo usuario registrado en el sistema' },
            { time: '08:45 AM', description: 'Búsqueda multi-motor ejecutada: "osint tools"' },
            { time: 'Ayer 16:20', description: 'Reporte exportado en formato PDF' },
            { time: 'Ayer 14:10', description: 'Análisis de dominio completado: example.com' }
        ];

        const activityList = document.getElementById('activityList');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${activity.time}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
        `).join('');
    }

    // Quick Actions
    handleQuickAction(action) {
        switch(action) {
            case 'new-investigation':
                this.navigateToSection('investigations');
                break;
            case 'email-search':
                this.navigateToSection('email-intel');
                break;
            case 'phone-lookup':
                this.navigateToSection('phone-intel');
                break;
            case 'domain-analysis':
                this.showToast('Análisis de dominio - Próximamente', 'warning');
                break;
        }
    }

    performQuickSearch(query) {
        if (query.includes('@')) {
            this.navigateToSection('email-intel');
            setTimeout(() => {
                const emailInput = document.getElementById('targetEmail');
                if (emailInput) emailInput.value = query;
            }, 100);
        } else {
            this.navigateToSection('search-tools');
            setTimeout(() => {
                const searchInput = document.getElementById('searchQuery');
                if (searchInput) searchInput.value = query;
            }, 100);
        }
    }

    // Section Event Listeners
    setupSectionEventListeners(section) {
        switch(section) {
            case 'email-intel':
                document.getElementById('emailIntelForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.performEmailInvestigation();
                });
                break;
            case 'phone-intel':
                document.getElementById('phoneIntelForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.performPhoneInvestigation();
                });
                break;
            case 'search-tools':
                document.getElementById('searchToolsForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.performMultiEngineSearch();
                });
                break;
        }
    }

    // Investigation Methods
    async performEmailInvestigation() {
        const email = document.getElementById('targetEmail').value;
        const checkBreaches = document.getElementById('checkBreaches').checked;
        const checkSocial = document.getElementById('checkSocial').checked;

        try {
            const response = await fetch(`${this.apiBase}/api/v1/email/investigate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    email: email,
                    check_breaches: checkBreaches,
                    check_social: checkSocial
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.displayEmailResults(data);
                this.showToast('Investigación completada', 'success');
            } else {
                this.showToast(data.detail || 'Error en la investigación', 'error');
            }
        } catch (error) {
            this.showToast('Error de conexión', 'error');
            console.error('Email investigation error:', error);
        }
    }

    displayEmailResults(data) {
        const resultsContainer = document.getElementById('emailResults');
        const resultsContent = document.getElementById('emailResultsContent');
        
        resultsContent.innerHTML = `
            <div class="results-grid">
                <div class="result-card">
                    <h4><i class="fas fa-envelope"></i> Información Básica</h4>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Válido:</strong> ${data.findings.email_validation.valid ? 'Sí' : 'No'}</p>
                    <p><strong>Dominio:</strong> ${data.findings.email_validation.domain}</p>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-exclamation-triangle"></i> Breaches</h4>
                    <p><strong>Encontrados:</strong> ${data.findings.breaches.breaches_found}</p>
                    <p><strong>Último:</strong> ${data.findings.breaches.last_breach || 'N/A'}</p>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-share-alt"></i> Redes Sociales</h4>
                    <div class="social-platforms">
                        ${data.findings.social_media.platforms.map(platform => 
                            `<span class="platform-tag">${platform}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-shield-alt"></i> Evaluación de Riesgo</h4>
                    <p><strong>Nivel:</strong> <span class="risk-${data.risk_assessment.level}">${data.risk_assessment.level.toUpperCase()}</span></p>
                    <p><strong>Puntuación:</strong> ${data.risk_assessment.score}/10</p>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new OSINTPlatform();
});

// Add additional CSS for new components
const additionalCSS = `
.section-header {
    margin-bottom: 2rem;
}

.section-header h2 {
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.intel-form-card, .intel-results {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #2c3e50;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: #667eea;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    cursor: pointer;
}

.checkbox-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.intel-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
}

.intel-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.result-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.result-card h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.platform-tag {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
}

.risk-low { color: #27ae60; font-weight: bold; }
.risk-medium { color: #f39c12; font-weight: bold; }
.risk-high { color: #e74c3c; font-weight: bold; }

/* Search Tools Styles */
.search-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 2rem;
}

.tool-card {
    background: #1f1f1f;
    border: 1px solid #333;
    border-radius: 16px;
    overflow: hidden;
}

.tool-header {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #2a2a2a;
    border-bottom: 1px solid #333;
}

.tool-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.tool-icon i {
    font-size: 20px;
    color: white;
}

.tool-info h3 {
    color: #e8eaed;
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 4px;
}

.tool-info p {
    color: #9aa0a6;
    font-size: 14px;
    margin: 0;
}

.tool-content {
    padding: 20px;
}

.quick-dorks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.dork-btn {
    background: #333;
    border: 1px solid #555;
    color: #e8eaed;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dork-btn:hover {
    background: #4285f4;
    border-color: #4285f4;
}

.custom-dork-input, .domain-input-group, .social-input-group, .image-input-group {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.custom-dork-input input, .domain-input-group input, .social-input-group input, .image-input-group input {
    flex: 1;
    background: #2a2a2a;
    border: 1px solid #444;
    color: #e8eaed;
    padding: 10px 14px;
    border-radius: 20px;
    font-size: 14px;
}

.custom-dork-input input:focus, .domain-input-group input:focus, .social-input-group input:focus, .image-input-group input:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.execute-btn, .analyze-btn, .scan-btn {
    background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.execute-btn:hover, .analyze-btn:hover, .scan-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(66, 133, 244, 0.3);
}

.platform-selection {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
}

.platform-selection label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e8eaed;
    font-size: 13px;
    cursor: pointer;
}

.platform-selection input[type="checkbox"] {
    width: 14px;
    height: 14px;
}

.results-container {
    margin-top: 16px;
    padding: 16px;
    background: #2a2a2a;
    border-radius: 12px;
    border: 1px solid #444;
}

.results-container h3 {
    color: #e8eaed;
    font-size: 16px;
    margin-bottom: 16px;
}

.search-result {
    background: #333;
    border: 1px solid #555;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
}

.result-header h4 {
    color: #4285f4;
    font-size: 14px;
    margin: 0;
}

.result-header a {
    color: #4285f4;
    text-decoration: none;
}

.result-header a:hover {
    text-decoration: underline;
}

.result-domain {
    color: #34a853;
    font-size: 11px;
    background: rgba(52, 168, 83, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
}

.result-snippet {
    color: #9aa0a6;
    font-size: 13px;
    line-height: 1.3;
    margin-bottom: 8px;
}

.result-actions {
    display: flex;
    gap: 6px;
}

.action-btn {
    background: #444;
    border: 1px solid #666;
    color: #e8eaed;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 3px;
}

.action-btn:hover {
    background: #4285f4;
    border-color: #4285f4;
}

.domain-info {
    display: grid;
    gap: 16px;
}

.info-section h4 {
    color: #e8eaed;
    font-size: 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid #444;
    padding-bottom: 4px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
}

.info-grid > div {
    background: #333;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
}

.info-grid strong {
    color: #9aa0a6;
}

.subdomains-list {
    display: grid;
    gap: 4px;
}

.subdomain-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 12px;
    padding: 8px 12px;
    background: #333;
    border-radius: 6px;
    align-items: center;
    font-size: 12px;
}

.subdomain-name {
    color: #4285f4;
    font-family: monospace;
}

.subdomain-ip {
    color: #9aa0a6;
    font-family: monospace;
}

.subdomain-status {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
    text-align: center;
}

.status-active {
    color: #34a853;
    background: rgba(52, 168, 83, 0.1);
}

.status-risk {
    color: #ea4335;
    background: rgba(234, 67, 53, 0.1);
}

.security-info {
    display: grid;
    gap: 6px;
}

.security-info > div {
    background: #333;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
}

.social-platform {
    background: #333;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
}

.platform-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #444;
    border-bottom: 1px solid #555;
}

.platform-header i {
    font-size: 16px;
    margin-right: 10px;
}

.platform-header h4 {
    flex: 1;
    color: #e8eaed;
    font-size: 14px;
    margin: 0;
}

.profile-count {
    color: #9aa0a6;
    font-size: 11px;
    background: rgba(154, 160, 166, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
}

.platform-profiles {
    padding: 12px 16px;
}

.social-profile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #444;
}

.social-profile:last-child {
    border-bottom: none;
}

.profile-info h5 {
    color: #4285f4;
    font-size: 14px;
    margin: 0 0 2px 0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.profile-info a {
    color: #4285f4;
    text-decoration: none;
}

.profile-info a:hover {
    text-decoration: underline;
}

.verified {
    color: #4285f4;
    font-size: 12px;
}

.profile-info p {
    color: #9aa0a6;
    font-size: 11px;
    margin: 0;
}

.analysis-section {
    margin-bottom: 16px;
}

.analysis-section h4 {
    color: #e8eaed;
    font-size: 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid #444;
    padding-bottom: 4px;
}

.reverse-engine {
    background: #333;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
}

.reverse-engine h5 {
    color: #e8eaed;
    font-size: 13px;
    margin-bottom: 6px;
}

.reverse-engine a {
    color: #4285f4;
    text-decoration: none;
    font-size: 12px;
}

.similar-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-top: 8px;
}

.similar-image {
    text-align: center;
}

.image-placeholder {
    width: 100%;
    height: 60px;
    background: #4285f4;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    margin-bottom: 4px;
}

.similar-image p {
    color: #9aa0a6;
    font-size: 10px;
    margin: 2px 0;
}

.similar-image a {
    color: #4285f4;
    text-decoration: none;
    font-size: 9px;
}

.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
}

.metadata-item {
    background: #333;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    border-left: 3px solid #4285f4;
}

.metadata-item strong {
    color: #9aa0a6;
    display: block;
    margin-bottom: 2px;
}

@media (max-width: 768px) {
    .search-tools-grid {
        grid-template-columns: 1fr;
    }
    
    .custom-dork-input, .domain-input-group, .social-input-group, .image-input-group {
        flex-direction: column;
    }
    
    .platform-selection {
        flex-direction: column;
        gap: 8px;
    }
    
    .subdomain-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 4px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .metadata-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Add Search Tools functionality to OSINTPlatform prototype
OSINTPlatform.prototype.executeGoogleDork = async function(query) {
    this.showToast('Executing Google dork...', 'info');
    
    try {
        const response = await fetch(`${this.apiBase}/api/v1/tools/google-dork?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            this.displayDorkResults(data);
        } else {
            throw new Error('Failed to execute Google dork');
        }
    } catch (error) {
        this.showToast('Error executing Google dork', 'error');
        console.error(error);
    }
};

OSINTPlatform.prototype.executeCustomDork = async function() {
    const query = document.getElementById('customDorkQuery').value.trim();
    if (!query) {
        this.showToast('Please enter a search query', 'warning');
        return;
    }
    
    await this.executeGoogleDork(query);
};

OSINTPlatform.prototype.displayDorkResults = function(data) {
    const resultsContainer = document.getElementById('dorkResults');
    
    const resultsHtml = data.results.map(result => `
        <div class="search-result">
            <div class="result-header">
                <h4><a href="${result.url}" target="_blank">${result.title}</a></h4>
                <span class="result-domain">${result.domain}</span>
            </div>
            <p class="result-snippet">${result.snippet}</p>
            <div class="result-actions">
                <button onclick="navigator.clipboard.writeText('${result.url}')" class="action-btn">
                    <i class="fas fa-copy"></i> Copy URL
                </button>
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = `
        <h3>Search Results (${data.total_results} found)</h3>
        ${resultsHtml}
    `;
    resultsContainer.style.display = 'block';
    
    this.showToast(`Found ${data.total_results} results`, 'success');
};

OSINTPlatform.prototype.analyzeDomain = async function() {
    const domain = document.getElementById('domainInput').value.trim();
    if (!domain) {
        this.showToast('Please enter a domain name', 'warning');
        return;
    }
    
    this.showToast('Analyzing domain...', 'info');
    
    try {
        const response = await fetch(`${this.apiBase}/api/v1/tools/domain-analysis?domain=${encodeURIComponent(domain)}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            this.displayDomainResults(data);
        } else {
            throw new Error('Failed to analyze domain');
        }
    } catch (error) {
        this.showToast('Error analyzing domain', 'error');
        console.error(error);
    }
};

OSINTPlatform.prototype.displayDomainResults = function(data) {
    const resultsContainer = document.getElementById('domainResults');
    
    const subdomainsHtml = data.subdomains.map(sub => `
        <div class="subdomain-item">
            <span class="subdomain-name">${sub.name}</span>
            <span class="subdomain-ip">${sub.ip}</span>
            <span class="subdomain-status ${sub.status.includes('Risk') ? 'status-risk' : 'status-active'}">${sub.status}</span>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = `
        <h3>Domain Analysis: ${data.domain}</h3>
        <div class="domain-info">
            <div class="info-section">
                <h4>WHOIS Information</h4>
                <div class="info-grid">
                    <div><strong>Registrar:</strong> ${data.whois.registrar}</div>
                    <div><strong>Created:</strong> ${data.whois.creation_date}</div>
                    <div><strong>Expires:</strong> ${data.whois.expiration_date}</div>
                    <div><strong>Status:</strong> <span class="status-active">${data.whois.status}</span></div>
                </div>
            </div>
            <div class="info-section">
                <h4>Subdomains Found</h4>
                <div class="subdomains-list">
                    ${subdomainsHtml}
                </div>
            </div>
            <div class="info-section">
                <h4>Security Status</h4>
                <div class="security-info">
                    <div><strong>SSL:</strong> <span class="status-active">${data.security.ssl_certificate}</span></div>
                    <div><strong>Vulnerabilities:</strong> <span class="status-active">${data.security.vulnerabilities}</span></div>
                    <div><strong>Blacklist:</strong> <span class="status-active">${data.security.blacklist_status}</span></div>
                </div>
            </div>
        </div>
    `;
    resultsContainer.style.display = 'block';
    
    this.showToast('Domain analysis completed', 'success');
};

OSINTPlatform.prototype.scanSocialMedia = async function() {
    const query = document.getElementById('socialQuery').value.trim();
    if (!query) {
        this.showToast('Please enter a search term', 'warning');
        return;
    }
    
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-selection input:checked'))
        .map(cb => cb.value);
    
    if (selectedPlatforms.length === 0) {
        this.showToast('Please select at least one platform', 'warning');
        return;
    }
    
    this.showToast('Scanning social media platforms...', 'info');
    
    try {
        const platforms = selectedPlatforms.join(',');
        const response = await fetch(`${this.apiBase}/api/v1/tools/social-scan?query=${encodeURIComponent(query)}&platforms=${platforms}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            this.displaySocialResults(data);
        } else {
            throw new Error('Failed to scan social media');
        }
    } catch (error) {
        this.showToast('Error scanning social media', 'error');
        console.error(error);
    }
};

OSINTPlatform.prototype.displaySocialResults = function(data) {
    const resultsContainer = document.getElementById('socialResults');
    
    const platformsHtml = data.results.map(platform => {
        const profilesHtml = platform.profiles.map(profile => `
            <div class="social-profile">
                <div class="profile-info">
                    <h5>
                        <a href="${profile.url}" target="_blank">@${profile.username}</a>
                        ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                    </h5>
                    <p>${profile.followers.toLocaleString()} followers • ${profile.lastActivity}</p>
                </div>
                <button onclick="window.open('${profile.url}', '_blank')" class="action-btn">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        `).join('');
        
        return `
            <div class="social-platform">
                <div class="platform-header">
                    <i class="${platform.icon}" style="color: ${platform.color}"></i>
                    <h4>${platform.platform}</h4>
                    <span class="profile-count">${platform.profiles.length} profile(s)</span>
                </div>
                <div class="platform-profiles">
                    ${profilesHtml}
                </div>
            </div>
        `;
    }).join('');
    
    resultsContainer.innerHTML = `
        <h3>Social Media Results for "${data.query}"</h3>
        <div class="social-results">
            ${platformsHtml}
        </div>
    `;
    resultsContainer.style.display = 'block';
    
    this.showToast(`Found ${data.total_profiles} profiles across ${data.results.length} platforms`, 'success');
};

OSINTPlatform.prototype.analyzeImage = async function() {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    if (!imageUrl) {
        this.showToast('Please enter an image URL', 'warning');
        return;
    }
    
    this.showToast('Analyzing image...', 'info');
    
    try {
        const response = await fetch(`${this.apiBase}/api/v1/tools/image-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ image_url: imageUrl })
        });
        
        if (response.ok) {
            const data = await response.json();
            this.displayImageResults(data);
        } else {
            throw new Error('Failed to analyze image');
        }
    } catch (error) {
        this.showToast('Error analyzing image', 'error');
        console.error(error);
    }
};

OSINTPlatform.prototype.displayImageResults = function(data) {
    const resultsContainer = document.getElementById('imageResults');
    
    const reverseSearchHtml = data.reverse_search.map(engine => `
        <div class="reverse-engine">
            <h5>${engine.engine} - ${engine.matches} matches</h5>
            <a href="${engine.url}" target="_blank">View full results</a>
            <div class="similar-images">
                ${engine.similar.map(img => `
                    <div class="similar-image">
                        <div class="image-placeholder">IMG</div>
                        <p>Similarity: ${img.similarity}</p>
                        <a href="${img.url}" target="_blank">Source</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    const metadataHtml = Object.entries(data.metadata).map(([key, value]) => `
        <div class="metadata-item">
            <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}
        </div>
    `).join('');
    
    resultsContainer.innerHTML = `
        <h3>Image Analysis Results</h3>
        <div class="image-analysis">
            <div class="analysis-section">
                <h4>Reverse Search Results</h4>
                ${reverseSearchHtml}
            </div>
            <div class="analysis-section">
                <h4>Image Metadata</h4>
                <div class="metadata-grid">
                    ${metadataHtml}
                </div>
            </div>
        </div>
    `;
    resultsContainer.style.display = 'block';
    
    this.showToast('Image analysis completed', 'success');
};
