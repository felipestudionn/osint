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
                <h2><i class="fas fa-search"></i> Herramientas de Búsqueda</h2>
                <p>Búsquedas avanzadas en múltiples motores</p>
            </div>
            
            <div class="search-tools-container">
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
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
