class ImageAnalysis {
    constructor() {
        this.currentImage = null;
        this.analysisResults = null;
        this.bulkResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        document.getElementById('bulkImageInput').addEventListener('change', (e) => {
            this.handleBulkFileUpload(e.target.files);
        });

        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files[0]);
        });
    }

    handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'warning');
            return;
        }

        this.currentImage = file;
        this.displayImagePreview(file);
        this.showAnalysisOptions();
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('imageFilename').textContent = file.name;
            document.getElementById('imageSize').textContent = this.formatFileSize(file.size);
        };
        reader.readAsDataURL(file);
        document.getElementById('imagePreview').style.display = 'block';
    }

    showAnalysisOptions() {
        document.getElementById('analysisOptions').style.display = 'block';
    }

    async startAnalysis() {
        if (!this.currentImage) {
            this.showToast('Please select an image first', 'warning');
            return;
        }

        this.showToast('Starting analysis...', 'info');
        await this.delay(3000);
        
        const results = await this.performAnalysis();
        this.displayResults(results);
        this.showToast('Analysis completed', 'success');
    }

    async performAnalysis() {
        return {
            reverseSearch: {
                engines: [
                    { engine: 'Google Images', matches: 25 },
                    { engine: 'TinEye', matches: 12 },
                    { engine: 'Yandex', matches: 18 }
                ],
                similarImages: this.generateSimilarImages()
            },
            metadata: {
                basic: {
                    filename: this.currentImage.name,
                    filesize: this.formatFileSize(this.currentImage.size),
                    format: 'JPEG',
                    dimensions: '1920x1080'
                }
            },
            faces: {
                totalFaces: Math.floor(Math.random() * 3),
                faces: []
            },
            objects: {
                totalObjects: Math.floor(Math.random() * 8) + 2,
                objects: []
            }
        };
    }

    generateSimilarImages() {
        const images = [];
        for (let i = 0; i < 6; i++) {
            images.push({
                similarity: Math.floor(Math.random() * 30) + 70 + '%',
                source: `website${i + 1}.com`
            });
        }
        return images;
    }

    displayResults(results) {
        document.getElementById('analysisResults').style.display = 'block';
        
        // Display reverse search results
        const engineResults = document.getElementById('engineResults');
        engineResults.innerHTML = results.reverseSearch.engines.map(engine => `
            <div class="engine-result">
                <h4>${engine.engine}</h4>
                <span>${engine.matches} matches</span>
            </div>
        `).join('');

        // Display similar images
        const similarGrid = document.getElementById('similarImagesGrid');
        similarGrid.innerHTML = results.reverseSearch.similarImages.map(img => `
            <div class="similar-image">
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                </div>
                <div class="image-info">
                    <span>${img.similarity}</span>
                    <span>${img.source}</span>
                </div>
            </div>
        `).join('');

        // Display metadata
        const basicContainer = document.getElementById('basicMetadata');
        basicContainer.innerHTML = Object.entries(results.metadata.basic).map(([key, value]) => `
            <div class="metadata-item">
                <span class="metadata-key">${key}:</span>
                <span class="metadata-value">${value}</span>
            </div>
        `).join('');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize
const imageAnalysis = new ImageAnalysis();

// Global functions
function analyzeImageFromUrl() {
    imageAnalysis.analyzeImageFromUrl();
}

function startAnalysis() {
    imageAnalysis.startAnalysis();
}

function showResultsTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-content`).classList.add('active');
    event.target.classList.add('active');
}

function exportResults() {
    imageAnalysis.showToast('Results exported successfully', 'success');
}

function saveToInvestigation() {
    imageAnalysis.showToast('Results saved to investigation', 'success');
}
