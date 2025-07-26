#!/usr/bin/env python3
"""
Working OSINT Platform API - bypass container issues
"""

import sys
import os
import asyncio
import hashlib
import secrets
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import json

# =============================================================================
# API CONFIGURATION - CONFIGURE YOUR API KEYS HERE
# =============================================================================

API_CONFIG = {
    # HaveIBeenPwned API (para verificar breaches)
    # Obtener en: https://haveibeenpwned.com/API/Key
    "HIBP_API_KEY": "YOUR_HIBP_API_KEY_HERE",
    
    # Shodan API (para análisis de dominios e IPs)
    # Obtener en: https://account.shodan.io/
    "SHODAN_API_KEY": "YOUR_SHODAN_API_KEY_HERE",
    
    # Hunter.io API (para búsqueda de emails)
    # Obtener en: https://hunter.io/api_keys
    "HUNTER_API_KEY": "YOUR_HUNTER_API_KEY_HERE",
    
    # VirusTotal API (para análisis de dominios)
    # Obtener en: https://www.virustotal.com/gui/my-apikey
    "VIRUSTOTAL_API_KEY": "YOUR_VIRUSTOTAL_API_KEY_HERE",
    
    # Configuración general
    "DEMO_MODE": True,  # Cambiar a False para usar APIs reales
    "RATE_LIMIT_ENABLED": True,
    "MAX_REQUESTS_PER_HOUR": 100
}

# Función para verificar si las APIs están configuradas
def check_api_config():
    """Verifica si las APIs están configuradas correctamente"""
    missing_keys = []
    for key, value in API_CONFIG.items():
        if key.endswith('_API_KEY') and (value == f"YOUR_{key}_HERE" or not value):
            missing_keys.append(key)
    
    if missing_keys and not API_CONFIG.get('DEMO_MODE', True):
        print("⚠️  ADVERTENCIA: Las siguientes API keys no están configuradas:")
        for key in missing_keys:
            print(f"   - {key}")
        print("   Configurar en la sección API_CONFIG del archivo Python")
        print("   O activar DEMO_MODE = True para usar datos simulados")
    
    return len(missing_keys) == 0

try:
    from fastapi import FastAPI, HTTPException, Depends, status
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from pydantic import BaseModel, EmailStr
    import uvicorn
    import httpx
    import requests
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("Try: pip install fastapi uvicorn httpx requests pydantic[email]")
    sys.exit(1)

# Simple in-memory storage (replace with database in production)
users_db: Dict[str, Dict] = {}
investigations_db: Dict[str, Dict] = {}
auth_tokens: Dict[str, str] = {}

# Security
security = HTTPBearer()
SECRET_KEY = "osint-platform-secret-key-change-in-production"

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailInvestigation(BaseModel):
    email: EmailStr
    check_breaches: bool = True
    check_social: bool = True

class Investigation(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "email"

# Create FastAPI app
app = FastAPI(
    title="OSINT Intelligence Platform",
    description="Professional OSINT platform for email, social media, and domain intelligence",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Verificar configuración de APIs al iniciar
print("🚀 Iniciando OSINT Platform...")
api_status = check_api_config()
if API_CONFIG.get('DEMO_MODE', True):
    print("📋 Modo DEMO activado - usando datos simulados")
else:
    print(f"🔑 APIs configuradas: {'✅' if api_status else '❌'}")

# Utility functions
def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{pwd_hash.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    try:
        salt, pwd_hash = hashed.split(':')
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() == pwd_hash
    except:
        return False

def create_token(user_id: str) -> str:
    """Create simple auth token"""
    token = secrets.token_urlsafe(32)
    auth_tokens[token] = user_id
    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Get current user from token"""
    token = credentials.credentials
    user_id = auth_tokens.get(token)
    if not user_id or user_id not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    return users_db[user_id]

# API Endpoints
@app.get("/")
async def root():
    """Serve the main web interface"""
    return FileResponse('static/index.html')

# ===== INVESTIGATIONS MANAGEMENT ENDPOINTS =====

@app.get("/api/v1/investigations")
async def get_investigations(current_user: dict = Depends(get_current_user)):
    """Get all investigations for the current user"""
    # In a real implementation, this would query a database
    # For now, return simulated data
    
    sample_investigations = [
        {
            "id": "inv_001",
            "name": "Email Compromise Investigation",
            "type": "email",
            "target": "john.doe@company.com",
            "description": "Investigating potential email account compromise and data breach indicators.",
            "priority": "high",
            "status": "active",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T14:45:00Z",
            "deadline": "2024-02-01",
            "tags": ["cybercrime", "data-breach", "email-security"],
            "progress": 65,
            "findings": [
                "Email found in 3 data breaches",
                "Suspicious login activity detected",
                "Password reuse across multiple platforms"
            ],
            "assigned_to": current_user["email"],
            "estimated_hours": 20,
            "actual_hours": 13
        },
        {
            "id": "inv_002",
            "name": "Social Media Profile Analysis",
            "type": "social",
            "target": "@suspicious_user",
            "description": "Comprehensive analysis of social media presence for background verification.",
            "priority": "medium",
            "status": "completed",
            "created_at": "2024-01-10T09:15:00Z",
            "updated_at": "2024-01-18T16:20:00Z",
            "deadline": "2024-01-25",
            "tags": ["background-check", "social-media", "verification"],
            "progress": 100,
            "findings": [
                "Multiple fake profiles identified",
                "Inconsistent personal information",
                "Suspicious network connections"
            ],
            "assigned_to": current_user["email"],
            "estimated_hours": 15,
            "actual_hours": 18
        },
        {
            "id": "inv_003",
            "name": "Domain Infrastructure Mapping",
            "type": "domain",
            "target": "suspicious-site.com",
            "description": "Mapping domain infrastructure and identifying potential malicious activities.",
            "priority": "high",
            "status": "active",
            "created_at": "2024-01-20T11:00:00Z",
            "updated_at": "2024-01-22T13:30:00Z",
            "deadline": "2024-02-05",
            "tags": ["malware", "infrastructure", "threat-intel"],
            "progress": 30,
            "findings": [
                "Domain registered with privacy protection",
                "Multiple subdomains identified",
                "Hosting provider traced to offshore location"
            ],
            "assigned_to": current_user["email"],
            "estimated_hours": 25,
            "actual_hours": 8
        }
    ]
    
    return {
        "status": "success",
        "data": {
            "investigations": sample_investigations,
            "total": len(sample_investigations),
            "statistics": {
                "total": len(sample_investigations),
                "active": len([inv for inv in sample_investigations if inv["status"] == "active"]),
                "completed": len([inv for inv in sample_investigations if inv["status"] == "completed"]),
                "high_priority": len([inv for inv in sample_investigations if inv["priority"] == "high"])
            }
        }
    }

@app.post("/api/v1/investigations")
async def create_investigation(investigation_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new investigation"""
    # Validate required fields
    required_fields = ["name", "type"]
    for field in required_fields:
        if field not in investigation_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Create new investigation
    new_investigation = {
        "id": f"inv_{int(time.time())}",
        "name": investigation_data["name"],
        "type": investigation_data["type"],
        "target": investigation_data.get("target", ""),
        "description": investigation_data.get("description", ""),
        "priority": investigation_data.get("priority", "medium"),
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "deadline": investigation_data.get("deadline"),
        "tags": investigation_data.get("tags", []),
        "progress": 0,
        "findings": [],
        "assigned_to": current_user["email"],
        "estimated_hours": investigation_data.get("estimated_hours", 0),
        "actual_hours": 0
    }
    
    # In a real implementation, save to database
    # For demo, just return the created investigation
    
    return {
        "status": "success",
        "message": "Investigation created successfully",
        "data": new_investigation
    }

@app.get("/api/v1/investigations/{investigation_id}")
async def get_investigation(investigation_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific investigation by ID"""
    # In a real implementation, query database by ID
    # For demo, return sample data
    
    sample_investigation = {
        "id": investigation_id,
        "name": "Sample Investigation",
        "type": "email",
        "target": "sample@example.com",
        "description": "This is a sample investigation for demonstration purposes.",
        "priority": "medium",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:45:00Z",
        "deadline": "2024-02-01",
        "tags": ["sample", "demo"],
        "progress": 45,
        "findings": [
            "Sample finding 1",
            "Sample finding 2"
        ],
        "assigned_to": current_user["email"],
        "estimated_hours": 10,
        "actual_hours": 4
    }
    
    return {
        "status": "success",
        "data": sample_investigation
    }

@app.put("/api/v1/investigations/{investigation_id}")
async def update_investigation(investigation_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update an existing investigation"""
    # In a real implementation, update database record
    # For demo, return success message
    
    return {
        "status": "success",
        "message": "Investigation updated successfully",
        "data": {
            "id": investigation_id,
            "updated_at": datetime.now().isoformat(),
            **update_data
        }
    }

@app.delete("/api/v1/investigations/{investigation_id}")
async def delete_investigation(investigation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an investigation"""
    # In a real implementation, delete from database
    # For demo, return success message
    
    return {
        "status": "success",
        "message": "Investigation deleted successfully"
    }

@app.post("/api/v1/investigations/{investigation_id}/findings")
async def add_finding(investigation_id: str, finding_data: dict, current_user: dict = Depends(get_current_user)):
    """Add a new finding to an investigation"""
    if "content" not in finding_data:
        raise HTTPException(status_code=400, detail="Finding content is required")
    
    new_finding = {
        "id": f"finding_{int(time.time())}",
        "content": finding_data["content"],
        "type": finding_data.get("type", "general"),
        "severity": finding_data.get("severity", "medium"),
        "created_at": datetime.now().isoformat(),
        "created_by": current_user["email"]
    }
    
    return {
        "status": "success",
        "message": "Finding added successfully",
        "data": new_finding
    }

# === DOMAIN INTELLIGENCE ENDPOINTS ===

@app.get("/api/v1/domain/basic-info/{domain}")
async def get_domain_basic_info(domain: str, current_user: dict = Depends(get_current_user)):
    """Get basic domain information"""
    try:
        # Simulate domain analysis
        await asyncio.sleep(1)
        
        mock_data = {
            "domain": domain,
            "ip": "192.168.1.1",
            "ssl_status": "Valid (TLS 1.3)",
            "registration_date": "2020-01-15",
            "expiration_date": "2025-01-15",
            "registrar": "GoDaddy",
            "status": "active",
            "country": "US",
            "organization": "Example Corp"
        }
        
        return {"success": True, "data": mock_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/whois/{domain}")
async def get_domain_whois(domain: str, current_user: dict = Depends(get_current_user)):
    """Get WHOIS information for domain"""
    try:
        await asyncio.sleep(2)
        
        mock_whois = {
            "registrant": {
                "name": "John Doe",
                "organization": "Example Corp",
                "email": f"admin@{domain}",
                "phone": "+1.5551234567",
                "address": "123 Main St, Anytown, ST 12345, US"
            },
            "admin": {
                "name": "Admin Contact",
                "email": f"admin@{domain}",
                "phone": "+1.5551234567"
            },
            "technical": {
                "name": "Tech Contact",
                "email": f"tech@{domain}",
                "phone": "+1.5551234567"
            },
            "name_servers": [
                f"ns1.{domain}",
                f"ns2.{domain}",
                f"ns3.{domain}"
            ],
            "creation_date": "2020-01-15T00:00:00Z",
            "expiration_date": "2025-01-15T00:00:00Z",
            "updated_date": "2023-01-15T00:00:00Z"
        }
        
        return {"success": True, "data": mock_whois}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/dns/{domain}")
async def get_domain_dns(domain: str, current_user: dict = Depends(get_current_user)):
    """Get DNS records for domain"""
    try:
        await asyncio.sleep(1.5)
        
        mock_dns = {
            "a": [{"value": "192.168.1.1", "ttl": 300}, {"value": "192.168.1.2", "ttl": 300}],
            "aaaa": [{"value": "2001:db8::1", "ttl": 300}],
            "mx": [{"value": f"mail.{domain}", "priority": 10, "ttl": 3600}],
            "ns": [{"value": f"ns1.{domain}", "ttl": 86400}, {"value": f"ns2.{domain}", "ttl": 86400}],
            "txt": [{"value": "v=spf1 include:_spf.google.com ~all", "ttl": 300}],
            "cname": [{"value": f"www.{domain} -> {domain}", "ttl": 300}]
        }
        
        return {"success": True, "data": mock_dns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/subdomains/{domain}")
async def get_domain_subdomains(domain: str, current_user: dict = Depends(get_current_user)):
    """Get subdomains for domain"""
    try:
        await asyncio.sleep(3)
        
        common_subdomains = ['www', 'mail', 'ftp', 'admin', 'api', 'blog', 'shop', 'dev']
        subdomains = []
        
        for i, sub in enumerate(common_subdomains[:6]):
            subdomains.append({
                "name": f"{sub}.{domain}",
                "ip": f"192.168.1.{i+10}",
                "active": random.choice([True, False]),
                "interesting": random.choice([True, False]),
                "ports": random.sample([80, 443, 22, 21, 25], k=random.randint(1, 3)),
                "technology": random.choice(['Apache', 'Nginx', 'IIS', 'Node.js'])
            })
        
        stats = {
            "total": len(subdomains),
            "active": len([s for s in subdomains if s['active']]),
            "inactive": len([s for s in subdomains if not s['active']]),
            "interesting": len([s for s in subdomains if s['interesting']])
        }
        
        return {"success": True, "data": {"subdomains": subdomains, "stats": stats}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/technology/{domain}")
async def get_domain_technology(domain: str, current_user: dict = Depends(get_current_user)):
    """Get technology stack for domain"""
    try:
        await asyncio.sleep(2)
        
        technologies = {
            "webServer": random.sample(['Apache', 'Nginx', 'IIS', 'LiteSpeed'], k=random.randint(0, 2)),
            "programming": random.sample(['PHP', 'Python', 'Node.js', 'Ruby', 'Java'], k=random.randint(0, 2)),
            "database": random.sample(['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'], k=random.randint(0, 2)),
            "analytics": random.sample(['Google Analytics', 'Adobe Analytics', 'Hotjar'], k=random.randint(0, 2)),
            "security": random.sample(['Cloudflare', 'Let\'s Encrypt', 'reCAPTCHA'], k=random.randint(0, 2)),
            "hosting": random.sample(['AWS', 'Google Cloud', 'Azure', 'DigitalOcean'], k=random.randint(0, 2))
        }
        
        return {"success": True, "data": technologies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/security/{domain}")
async def get_domain_security(domain: str, current_user: dict = Depends(get_current_user)):
    """Get security assessment for domain"""
    try:
        await asyncio.sleep(3)
        
        score = random.randint(60, 95)
        
        checks = [
            {
                "name": "SSL/TLS Configuration",
                "description": "SSL certificate is valid and properly configured",
                "status": random.choice(['pass', 'fail', 'warn'])
            },
            {
                "name": "HTTP Security Headers",
                "description": "Security headers are properly implemented",
                "status": random.choice(['pass', 'warn'])
            },
            {
                "name": "DNS Security",
                "description": "DNS configuration follows security best practices",
                "status": random.choice(['pass', 'warn'])
            },
            {
                "name": "Open Ports Scan",
                "description": "No unnecessary ports are exposed",
                "status": random.choice(['pass', 'warn'])
            },
            {
                "name": "Vulnerability Scan",
                "description": "No known vulnerabilities detected",
                "status": random.choice(['pass', 'fail'])
            }
        ]
        
        security_data = {
            "score": score,
            "score_class": "good" if score >= 80 else "medium" if score >= 60 else "poor",
            "risk_level": "low" if score >= 80 else "medium" if score >= 60 else "high",
            "summary": "Domain has good security posture" if score >= 80 else "Domain has moderate security issues" if score >= 60 else "Domain has significant security concerns",
            "checks": checks
        }
        
        return {"success": True, "data": security_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/geolocation/{domain}")
async def get_domain_geolocation(domain: str, current_user: dict = Depends(get_current_user)):
    """Get geolocation data for domain"""
    try:
        await asyncio.sleep(1.5)
        
        locations = [
            {"country": "United States", "region": "California", "city": "San Francisco"},
            {"country": "Germany", "region": "Hesse", "city": "Frankfurt"},
            {"country": "United Kingdom", "region": "England", "city": "London"},
            {"country": "Singapore", "region": "Central Singapore", "city": "Singapore"}
        ]
        
        location = random.choice(locations)
        
        geo_data = {
            **location,
            "isp": "Example ISP Inc.",
            "asn": f"AS{random.randint(10000, 99999)}",
            "organization": "Example Hosting Organization",
            "ip_range": "192.168.0.0/24",
            "hosting_provider": "Cloud Provider Inc."
        }
        
        return {"success": True, "data": geo_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/domain/related/{domain}")
async def get_related_domains(domain: str, current_user: dict = Depends(get_current_user)):
    """Get related domains"""
    try:
        await asyncio.sleep(2)
        
        base_domain = domain.split('.')[0]
        tld = '.'.join(domain.split('.')[1:])
        
        related_types = {
            "similar": [f"{base_domain}{i}.{tld}" for i in range(1, 4)],
            "same_ip": [f"example{i}.com" for i in range(1, 3)],
            "same_owner": [f"{base_domain}-{suffix}.{tld}" for suffix in ['shop', 'blog', 'api']],
            "historical": [f"old-{base_domain}.{tld}", f"archive-{base_domain}.{tld}"]
        }
        
        related_domains = {}
        for rel_type, domains in related_types.items():
            related_domains[rel_type] = [
                {
                    "domain": d,
                    "relationship": rel_type,
                    "last_seen": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d'),
                    "status": random.choice(['active', 'inactive'])
                } for d in domains
            ]
        
        return {"success": True, "data": related_domains}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/domain/bulk-analyze")
async def bulk_analyze_domains(request: dict, current_user: dict = Depends(get_current_user)):
    """Bulk analyze multiple domains"""
    try:
        domains = request.get('domains', [])
        if not domains:
            raise HTTPException(status_code=400, detail="No domains provided")
        
        results = []
        for domain in domains:
            await asyncio.sleep(1)  # Simulate analysis time
            
            analysis = {
                "domain": domain,
                "ip": f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                "status": random.choice(['online', 'offline']),
                "ssl": random.choice(['valid', 'invalid']),
                "registrar": random.choice(['GoDaddy', 'Namecheap', 'CloudFlare']),
                "country": random.choice(['US', 'DE', 'UK', 'SG']),
                "security_score": random.randint(60, 95),
                "subdomains": random.randint(5, 25)
            }
            results.append(analysis)
        
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === IMAGE ANALYSIS ENDPOINTS ===

@app.post("/api/v1/image/analyze")
async def analyze_image(request: dict, current_user: dict = Depends(get_current_user)):
    """Analyze uploaded image with multiple techniques"""
    try:
        image_data = request.get('image_data')
        options = request.get('options', {})
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        results = {
            "analysis_id": f"img_analysis_{random.randint(100000, 999999)}",
            "timestamp": datetime.now().isoformat(),
            "options": options,
            "data": {}
        }
        
        # Reverse image search
        if options.get('reverseSearch', True):
            await asyncio.sleep(2)
            results["data"]["reverseSearch"] = {
                "engines": [
                    {"engine": "Google Images", "matches": random.randint(10, 50), "url": "https://images.google.com/search"},
                    {"engine": "TinEye", "matches": random.randint(5, 25), "url": "https://tineye.com/search"},
                    {"engine": "Yandex Images", "matches": random.randint(8, 30), "url": "https://yandex.com/images"},
                    {"engine": "Bing Images", "matches": random.randint(12, 40), "url": "https://bing.com/images"}
                ],
                "similarImages": [
                    {"url": f"https://example{i}.com/image.jpg", "similarity": f"{random.randint(70, 95)}%", "source": f"website{i}.com"}
                    for i in range(1, 9)
                ],
                "totalMatches": random.randint(50, 200)
            }
        
        # Metadata extraction
        if options.get('metadataExtraction', True):
            await asyncio.sleep(1)
            results["data"]["metadata"] = {
                "basic": {
                    "filename": "uploaded_image.jpg",
                    "filesize": "2.4 MB",
                    "format": "JPEG",
                    "dimensions": "1920x1080",
                    "colorSpace": "sRGB",
                    "compression": "JPEG (Quality: 85%)"
                },
                "camera": {
                    "make": random.choice(["Canon", "Nikon", "Sony", "Apple"]),
                    "model": random.choice(["EOS 5D Mark IV", "D850", "A7R III", "iPhone 13 Pro"]),
                    "lens": "EF 24-70mm f/2.8L II USM",
                    "focalLength": f"{random.randint(24, 200)}mm",
                    "aperture": f"f/{random.choice(['2.8', '4.0', '5.6', '8.0'])}",
                    "shutterSpeed": f"1/{random.randint(60, 500)}s",
                    "iso": str(random.choice([100, 200, 400, 800, 1600])),
                    "flash": random.choice(["No Flash", "Flash Fired", "Auto Flash"])
                },
                "location": {
                    "gpsCoordinates": "40.7128° N, 74.0060° W" if random.random() > 0.5 else "Not available",
                    "location": "New York, NY, USA" if random.random() > 0.5 else "Location data removed",
                    "altitude": f"{random.randint(1, 100)}m above sea level" if random.random() > 0.5 else "Not available"
                },
                "timestamp": {
                    "created": "2024-01-15 14:30:22",
                    "modified": "2024-01-15 14:35:10"
                }
            }
        
        # Facial recognition
        if options.get('facialRecognition', False):
            await asyncio.sleep(3)
            num_faces = random.randint(0, 3)
            faces = []
            for i in range(num_faces):
                faces.append({
                    "id": f"face_{i+1}",
                    "confidence": random.randint(70, 95),
                    "age": random.randint(20, 60),
                    "gender": random.choice(["Male", "Female"]),
                    "emotion": random.choice(["Happy", "Neutral", "Surprised", "Sad"]),
                    "position": {
                        "x": random.randint(100, 800),
                        "y": random.randint(100, 600),
                        "width": random.randint(100, 200),
                        "height": random.randint(100, 200)
                    },
                    "features": {
                        "eyeColor": random.choice(["Brown", "Blue", "Green", "Hazel"]),
                        "hairColor": random.choice(["Black", "Brown", "Blonde", "Red"]),
                        "glasses": random.random() > 0.7,
                        "beard": random.random() > 0.6
                    }
                })
            
            results["data"]["faces"] = {
                "totalFaces": num_faces,
                "faces": faces,
                "processingTime": f"{random.randint(1000, 4000)}ms"
            }
        
        # Object detection
        if options.get('objectDetection', False):
            await asyncio.sleep(2)
            objects = []
            object_types = ["Person", "Car", "Building", "Tree", "Dog", "Cat", "Phone", "Laptop"]
            num_objects = random.randint(3, 8)
            
            for i in range(num_objects):
                objects.append({
                    "id": f"object_{i+1}",
                    "type": random.choice(object_types),
                    "confidence": random.randint(60, 95),
                    "position": {
                        "x": random.randint(50, 800),
                        "y": random.randint(50, 600),
                        "width": random.randint(100, 300),
                        "height": random.randint(100, 300)
                    },
                    "color": random.choice(["Red", "Blue", "Green", "Yellow", "Black", "White"])
                })
            
            results["data"]["objects"] = {
                "totalObjects": num_objects,
                "objects": objects,
                "categories": list(set([obj["type"] for obj in objects])),
                "processingTime": f"{random.randint(500, 2500)}ms"
            }
        
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/image/reverse-search")
async def reverse_image_search(request: dict, current_user: dict = Depends(get_current_user)):
    """Perform reverse image search"""
    try:
        image_url = request.get('image_url')
        if not image_url:
            raise HTTPException(status_code=400, detail="No image URL provided")
        
        await asyncio.sleep(2)
        
        engines_results = [
            {"engine": "Google Images", "matches": random.randint(20, 80), "url": f"https://images.google.com/search?tbs=sbi:url={image_url}"},
            {"engine": "TinEye", "matches": random.randint(5, 30), "url": f"https://tineye.com/search?url={image_url}"},
            {"engine": "Yandex Images", "matches": random.randint(10, 50), "url": f"https://yandex.com/images/search?rpt=imageview&url={image_url}"}
        ]
        
        return {"success": True, "data": {"engines": engines_results, "totalMatches": sum(r["matches"] for r in engines_results)}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/image/extract-metadata")
async def extract_image_metadata(request: dict, current_user: dict = Depends(get_current_user)):
    """Extract metadata from image"""
    try:
        await asyncio.sleep(1)
        
        metadata = {
            "basic": {
                "filename": request.get('filename', 'unknown.jpg'),
                "filesize": "2.4 MB",
                "format": "JPEG",
                "dimensions": "1920x1080",
                "created": "2024-01-15 14:30:22"
            },
            "camera": {
                "make": "Canon",
                "model": "EOS 5D Mark IV",
                "software": "Adobe Photoshop 2024"
            },
            "location": {
                "gps": "40.7128° N, 74.0060° W" if random.random() > 0.5 else None,
                "location": "New York, NY" if random.random() > 0.5 else None
            }
        }
        
        return {"success": True, "data": metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/image/bulk-analyze")
async def bulk_analyze_images(request: dict, current_user: dict = Depends(get_current_user)):
    """Bulk analyze multiple images"""
    try:
        images = request.get('images', [])
        if not images:
            raise HTTPException(status_code=400, detail="No images provided")
        
        results = []
        for i, image in enumerate(images):
            await asyncio.sleep(1)  # Simulate processing time
            
            result = {
                "filename": image.get('filename', f'image_{i+1}.jpg'),
                "size": image.get('size', '1.2 MB'),
                "reverseSearchMatches": random.randint(10, 50),
                "facesDetected": random.randint(0, 3),
                "objectsDetected": random.randint(2, 8),
                "hasMetadata": random.random() > 0.3,
                "processingTime": f"{random.randint(1000, 3000)}ms",
                "timestamp": datetime.now().isoformat()
            }
            results.append(result)
        
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === REPORTS & ANALYTICS ENDPOINTS =====

@app.get("/api/v1/reports/metrics")
async def get_reports_metrics(current_user: dict = Depends(get_current_user)):
    """Get key metrics for reports dashboard"""
    # In a real implementation, this would query the database
    # For demo, return simulated metrics
    
    metrics = {
        "total_investigations": 147,
        "total_findings": 892,
        "success_rate": 87.3,
        "avg_investigation_time": 14.2,
        "monthly_growth": {
            "investigations": 12,
            "findings": 8,
            "success_rate": 5,
            "avg_time": -3
        }
    }
    
    return {
        "status": "success",
        "data": metrics
    }

@app.get("/api/v1/reports/activity")
async def get_activity_data(period: str = "30d", current_user: dict = Depends(get_current_user)):
    """Get investigation activity data for charts"""
    import random
    from datetime import datetime, timedelta
    
    # Generate sample activity data based on period
    days = 30 if period == "30d" else 7 if period == "7d" else 90
    
    data = []
    labels = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-1-i)
        labels.append(date.strftime("%m/%d"))
        data.append(random.randint(3, 18))
    
    return {
        "status": "success",
        "data": {
            "labels": labels,
            "datasets": [{
                "label": "Investigations",
                "data": data,
                "borderColor": "#4285f4",
                "backgroundColor": "rgba(66, 133, 244, 0.1)"
            }]
        }
    }

@app.get("/api/v1/reports/investigation-types")
async def get_investigation_types_data(current_user: dict = Depends(get_current_user)):
    """Get investigation types distribution"""
    
    data = {
        "email": 45,
        "domain": 32,
        "social": 28,
        "phone": 24,
        "image": 18
    }
    
    return {
        "status": "success",
        "data": {
            "labels": ["Email", "Domain", "Social Media", "Phone", "Image"],
            "datasets": [{
                "data": list(data.values()),
                "backgroundColor": [
                    "#4285f4",
                    "#34a853",
                    "#fbbc04",
                    "#ea4335",
                    "#9aa0a6"
                ]
            }]
        }
    }

@app.get("/api/v1/reports/success-trends")
async def get_success_trends(period: str = "monthly", current_user: dict = Depends(get_current_user)):
    """Get success rate trends over time"""
    import random
    from datetime import datetime, timedelta
    
    # Generate sample success rate data
    if period == "weekly":
        periods = 12
        labels = []
        for i in range(periods):
            date = datetime.now() - timedelta(weeks=periods-1-i)
            labels.append(f"Week {date.strftime('%U')}")
    elif period == "quarterly":
        periods = 8
        labels = [f"Q{((i % 4) + 1)} {datetime.now().year - (i // 4)}" for i in range(periods-1, -1, -1)]
    else:  # monthly
        periods = 12
        labels = []
        for i in range(periods):
            date = datetime.now() - timedelta(days=30*(periods-1-i))
            labels.append(date.strftime("%b %y"))
    
    data = [random.randint(75, 95) for _ in range(periods)]
    
    return {
        "status": "success",
        "data": {
            "labels": labels,
            "datasets": [{
                "label": "Success Rate (%)",
                "data": data,
                "borderColor": "#34a853",
                "backgroundColor": "rgba(52, 168, 83, 0.1)"
            }]
        }
    }

@app.get("/api/v1/reports/priority-distribution")
async def get_priority_distribution(current_user: dict = Depends(get_current_user)):
    """Get investigation priority distribution"""
    
    data = {
        "high": 23,
        "medium": 78,
        "low": 46
    }
    
    return {
        "status": "success",
        "data": {
            "labels": ["High", "Medium", "Low"],
            "datasets": [{
                "data": list(data.values()),
                "backgroundColor": [
                    "#ea4335",
                    "#fbbc04",
                    "#34a853"
                ]
            }]
        }
    }

@app.get("/api/v1/reports/top-investigations")
async def get_top_investigations(sort_by: str = "findings", current_user: dict = Depends(get_current_user)):
    """Get top performing investigations"""
    
    investigations = [
        {
            "name": "Email Compromise Analysis",
            "type": "email",
            "findings": 23,
            "duration": "12.5h",
            "success_rate": 95,
            "status": "completed",
            "created_at": "2024-01-15T10:30:00Z"
        },
        {
            "name": "Social Media Profile Investigation",
            "type": "social",
            "findings": 18,
            "duration": "8.2h",
            "success_rate": 89,
            "status": "completed",
            "created_at": "2024-01-12T14:20:00Z"
        },
        {
            "name": "Domain Infrastructure Mapping",
            "type": "domain",
            "findings": 31,
            "duration": "16.7h",
            "success_rate": 92,
            "status": "active",
            "created_at": "2024-01-18T09:15:00Z"
        },
        {
            "name": "Phone Number Trace",
            "type": "phone",
            "findings": 14,
            "duration": "6.3h",
            "success_rate": 78,
            "status": "completed",
            "created_at": "2024-01-10T16:45:00Z"
        },
        {
            "name": "Image Forensics Analysis",
            "type": "image",
            "findings": 9,
            "duration": "4.1h",
            "success_rate": 83,
            "status": "completed",
            "created_at": "2024-01-08T11:30:00Z"
        }
    ]
    
    # Sort based on criteria
    if sort_by == "findings":
        investigations.sort(key=lambda x: x["findings"], reverse=True)
    elif sort_by == "time":
        investigations.sort(key=lambda x: float(x["duration"].replace("h", "")))
    elif sort_by == "recent":
        investigations.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "status": "success",
        "data": investigations
    }

@app.get("/api/v1/reports/activity-log")
async def get_activity_log(filter_type: str = "all", current_user: dict = Depends(get_current_user)):
    """Get recent activity log"""
    
    activities = [
        {
            "id": "act_001",
            "timestamp": "2024-01-22T14:30:00Z",
            "action": "Investigation Completed",
            "investigation": "Email Compromise Analysis",
            "user": current_user["email"],
            "details": "Investigation marked as completed with 23 findings",
            "type": "completed"
        },
        {
            "id": "act_002",
            "timestamp": "2024-01-22T14:15:00Z",
            "action": "New Finding Added",
            "investigation": "Domain Infrastructure Mapping",
            "user": current_user["email"],
            "details": "Added finding: 'Suspicious subdomain identified'",
            "type": "updated"
        },
        {
            "id": "act_003",
            "timestamp": "2024-01-22T13:45:00Z",
            "action": "Investigation Created",
            "investigation": "Social Media Background Check",
            "user": current_user["email"],
            "details": "New investigation created with high priority",
            "type": "created"
        },
        {
            "id": "act_004",
            "timestamp": "2024-01-22T12:30:00Z",
            "action": "Investigation Updated",
            "investigation": "Phone Number Trace",
            "user": current_user["email"],
            "details": "Progress updated to 75%",
            "type": "updated"
        },
        {
            "id": "act_005",
            "timestamp": "2024-01-22T11:20:00Z",
            "action": "Report Exported",
            "investigation": "Multiple Investigations",
            "user": current_user["email"],
            "details": "PDF report exported for date range",
            "type": "exported"
        }
    ]
    
    # Filter activities if needed
    if filter_type != "all":
        activities = [act for act in activities if act["type"] == filter_type]
    
    return {
        "status": "success",
        "data": activities
    }

@app.post("/api/v1/reports/export")
async def export_report(export_data: dict, current_user: dict = Depends(get_current_user)):
    """Export report in specified format"""
    
    format_type = export_data.get("format", "pdf")
    date_range = export_data.get("date_range", {})
    
    # In a real implementation, this would generate actual files
    # For demo, simulate the export process
    
    export_id = f"export_{int(time.time())}"
    
    return {
        "status": "success",
        "message": f"Report export initiated in {format_type.upper()} format",
        "data": {
            "export_id": export_id,
            "format": format_type,
            "estimated_completion": "2-3 minutes",
            "download_url": f"/api/v1/reports/download/{export_id}"
        }
    }

@app.get("/api/v1/reports/download/{export_id}")
async def download_report(export_id: str, current_user: dict = Depends(get_current_user)):
    """Download exported report"""
    
    # In a real implementation, this would serve the actual file
    # For demo, return file info
    
    return {
        "status": "success",
        "message": "Report ready for download",
        "data": {
            "export_id": export_id,
            "filename": f"osint_report_{export_id}.pdf",
            "size": "2.4 MB",
            "created_at": datetime.now().isoformat()
        }
    }

@app.post("/api/v1/reports/custom")
async def generate_custom_report(report_config: dict, current_user: dict = Depends(get_current_user)):
    """Generate custom report based on configuration"""
    
    required_fields = ["name", "type"]
    for field in required_fields:
        if field not in report_config:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    custom_report = {
        "id": f"custom_{int(time.time())}",
        "name": report_config["name"],
        "type": report_config["type"],
        "metrics": report_config.get("metrics", []),
        "filters": report_config.get("filters", {}),
        "created_at": datetime.now().isoformat(),
        "created_by": current_user["email"],
        "status": "generating"
    }
    
    return {
        "status": "success",
        "message": "Custom report generation started",
        "data": custom_report
    }

@app.get("/docs-info")
async def api_info():
    return {
        "message": "OSINT Intelligence Platform API",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth/login",
            "health": "/health", 
            "email": "/api/v1/email/investigate",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "osint-platform",
        "timestamp": datetime.now().isoformat(),
        "users": len(users_db),
        "investigations": len(investigations_db)
    }

@app.post("/auth/register")
async def register(user_data: UserCreate):
    """Register new user"""
    email = str(user_data.email).lower()
    
    if email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = secrets.token_hex(16)
    users_db[email] = {
        "id": user_id,
        "email": email,
        "hashed_password": hash_password(user_data.password),
        "role": user_data.role,
        "is_active": True,
        "created_at": datetime.now().isoformat(),
        "permissions": [
            "investigation:read", "investigation:create", 
            "email:investigate", "social:investigate"
        ]
    }
    
    return {"message": "User created successfully", "user_id": user_id}

@app.post("/auth/login")
async def login(login_data: UserLogin):
    """User login"""
    email = str(login_data.email).lower()
    user = users_db.get(email)
    
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(email)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "permissions": user["permissions"]
        }
    }

@app.get("/auth/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """Get user profile"""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "is_active": current_user["is_active"],
        "created_at": current_user["created_at"],
        "permissions": current_user.get("permissions", [])
    }

@app.post("/api/v1/investigations")
async def create_investigation(
    investigation: Investigation,
    current_user: Dict = Depends(get_current_user)
):
    """Create new investigation"""
    inv_id = secrets.token_hex(16)
    investigations_db[inv_id] = {
        "id": inv_id,
        "name": investigation.name,
        "description": investigation.description,
        "type": investigation.type,
        "user_id": current_user["id"],
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "entities": [],
        "findings": []
    }
    
    return {"investigation_id": inv_id, "message": "Investigation created"}

@app.get("/api/v1/investigations")
async def list_investigations(current_user: Dict = Depends(get_current_user)):
    """List user investigations"""
    user_investigations = [
        inv for inv in investigations_db.values() 
        if inv["user_id"] == current_user["id"]
    ]
    return {"investigations": user_investigations}

@app.post("/api/v1/email/investigate")
async def investigate_email(
    email_data: EmailInvestigation
):
    """Investigate email address"""
    email = str(email_data.email).lower()
    results = {
        "email": email,
        "timestamp": datetime.now().isoformat(),
        "analyst": "demo-user",
        "findings": {}
    }
    
    # Basic email validation
    if "@" not in email or "." not in email.split("@")[1]:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Extract domain
    domain = email.split("@")[1]
    results["domain"] = domain
    
    # Breach check (HaveIBeenPwned API)
    if email_data.check_breaches:
        if API_CONFIG.get('DEMO_MODE', True) or API_CONFIG.get('HIBP_API_KEY') == 'YOUR_HIBP_API_KEY_HERE':
            # Datos simulados para modo demo
            breach_results = {
                "breaches_found": 2,
                "breaches": [
                    {
                        "name": "ExampleBreach2021",
                        "date": "2021-05-15",
                        "verified": True,
                        "data_classes": ["Email addresses", "Passwords"]
                    },
                    {
                        "name": "TestLeak2020", 
                        "date": "2020-11-03",
                        "verified": False,
                        "data_classes": ["Email addresses", "Usernames"]
                    }
                ],
                "last_checked": datetime.now().isoformat(),
                "source": "demo_data"
            }
        else:
            # TODO: Implementar llamada real a HaveIBeenPwned API
            # headers = {'hibp-api-key': API_CONFIG['HIBP_API_KEY']}
            # response = requests.get(f'https://haveibeenpwned.com/api/v3/breachedaccount/{email}', headers=headers)
            breach_results = {
                "breaches_found": 0,
                "breaches": [],
                "last_checked": datetime.now().isoformat(),
                "source": "hibp_api",
                "note": "API real no implementada aún - configure DEMO_MODE = True"
            }
        
        results["findings"]["breaches"] = breach_results
    
    # Social media check (Hunter.io y búsquedas públicas)
    if email_data.check_social:
        if API_CONFIG.get('DEMO_MODE', True) or API_CONFIG.get('HUNTER_API_KEY') == 'YOUR_HUNTER_API_KEY_HERE':
            # Datos simulados para modo demo
            social_results = {
                "platforms_found": ["twitter", "linkedin"],
                "platforms": ["Twitter", "LinkedIn", "GitHub"],
                "profiles": [
                    {
                        "platform": "twitter",
                        "username": email.split("@")[0],
                        "url": f"https://twitter.com/{email.split('@')[0]}",
                        "verified": False
                    },
                    {
                        "platform": "linkedin", 
                        "profile_found": True,
                        "public_info": "Limited profile visible"
                    }
                ],
                "source": "demo_data"
            }
        else:
            # TODO: Implementar búsquedas reales en redes sociales
            # Usar Hunter.io API para encontrar perfiles asociados
            social_results = {
                "platforms_found": [],
                "platforms": [],
                "profiles": [],
                "source": "hunter_api",
                "note": "API real no implementada aún - configure DEMO_MODE = True"
            }
        
        results["findings"]["social_media"] = social_results
    
    # Domain intelligence
    domain_results = {
        "whois": {
            "registrar": "Example Registrar",
            "creation_date": "2015-03-20",
            "expiry_date": "2025-03-20"
        },
        "mx_records": [f"mail.{domain}", f"mail2.{domain}"],
        "reputation": "clean"
    }
    results["findings"]["domain_intelligence"] = domain_results
    
    # Risk assessment
    risk_score = 3  # Low risk
    if results["findings"].get("breaches", {}).get("breaches_found", 0) > 0:
        risk_score += 2
    
    results["risk_assessment"] = {
        "score": risk_score,
        "level": "low" if risk_score < 4 else "medium" if risk_score < 7 else "high",
        "factors": ["email_in_breaches"] if email_data.check_breaches else []
    }
    
    return results

@app.get("/api/v1/search/engines")
async def search_engines(
    query: str,
    engines: str = "google,bing",
    current_user: Dict = Depends(get_current_user)
):
    """Multi-engine search"""
    return {
        "query": query,
        "engines": engines.split(","),
        "results": {
            "google": [
                {"title": f"Google Result for: {query}", "url": "https://example.com/1"},
                {"title": f"Another Google Result: {query}", "url": "https://example.com/2"}
            ],
            "bing": [
                {"title": f"Bing Result for: {query}", "url": "https://example.com/3"}
            ]
        },
        "total_results": 3,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/phone/investigate")
async def investigate_phone(
    phone: str,
    current_user: Dict = Depends(get_current_user)
):
    """Investigate phone number"""
    return {
        "phone": phone,
        "country": "US",
        "carrier": "Example Carrier",
        "type": "mobile",
        "valid": True,
        "risk_level": "low",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/tools/google-dork")
async def google_dork_search(
    query: str,
    current_user: Dict = Depends(get_current_user)
):
    """Execute Google dork search"""
    # Simulate Google dork results
    sample_results = [
        {
            "title": f"Advanced result for: {query}",
            "url": "https://example.com/result1",
            "snippet": "This is a sample result that would be found using the Google dork query. Contains relevant information...",
            "domain": "example.com"
        },
        {
            "title": f"Security finding: {query[:30]}...",
            "url": "https://target-site.com/admin/login",
            "snippet": "Potential security exposure found through advanced search techniques. This demonstrates the power of Google dorking...",
            "domain": "target-site.com"
        },
        {
            "title": f"Document discovery: {query}",
            "url": "https://company.com/documents/sensitive.pdf",
            "snippet": "PDF document containing information related to the search query. Found through file type targeting...",
            "domain": "company.com"
        }
    ]
    
    return {
        "query": query,
        "results": sample_results[:3],
        "total_results": len(sample_results),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/tools/domain-analysis")
async def analyze_domain(
    domain: str,
    current_user: Dict = Depends(get_current_user)
):
    """Analyze domain and subdomains"""
    return {
        "domain": domain,
        "whois": {
            "registrar": "Example Registrar Inc.",
            "creation_date": "2020-01-15",
            "expiration_date": "2025-01-15",
            "registrant": "Privacy Protected",
            "nameservers": ["ns1.example.com", "ns2.example.com"],
            "status": "Active"
        },
        "subdomains": [
            {"name": f"www.{domain}", "ip": "192.168.1.1", "status": "Active"},
            {"name": f"mail.{domain}", "ip": "192.168.1.2", "status": "Active"},
            {"name": f"ftp.{domain}", "ip": "192.168.1.3", "status": "Active"},
            {"name": f"admin.{domain}", "ip": "192.168.1.4", "status": "Potential Risk"},
            {"name": f"api.{domain}", "ip": "192.168.1.5", "status": "Active"}
        ],
        "dns": {
            "A": ["192.168.1.1"],
            "AAAA": ["2001:db8::1"],
            "MX": [f"mail.{domain}", f"mail2.{domain}"],
            "NS": ["ns1.example.com", "ns2.example.com"],
            "TXT": ["v=spf1 include:_spf.google.com ~all"]
        },
        "security": {
            "ssl_certificate": "Valid (Let's Encrypt)",
            "security_headers": "Partial Implementation",
            "vulnerabilities": "Low Risk",
            "blacklist_status": "Clean"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/tools/social-scan")
async def social_media_scan(
    query: str,
    platforms: str = "facebook,twitter,instagram,linkedin",
    current_user: Dict = Depends(get_current_user)
):
    """Scan social media platforms"""
    platform_list = platforms.split(",")
    platform_data = {
        "facebook": {"icon": "fab fa-facebook", "color": "#1877f2"},
        "twitter": {"icon": "fab fa-twitter", "color": "#1da1f2"},
        "instagram": {"icon": "fab fa-instagram", "color": "#e4405f"},
        "linkedin": {"icon": "fab fa-linkedin", "color": "#0077b5"},
        "youtube": {"icon": "fab fa-youtube", "color": "#ff0000"},
        "tiktok": {"icon": "fab fa-tiktok", "color": "#000000"}
    }
    
    results = []
    for platform in platform_list:
        platform = platform.strip().lower()
        if platform in platform_data:
            data = platform_data[platform]
            results.append({
                "platform": platform.capitalize(),
                "icon": data["icon"],
                "color": data["color"],
                "profiles": [
                    {
                        "username": f"{query.lower()}",
                        "url": f"https://{platform}.com/{query.lower()}",
                        "followers": secrets.randbelow(10000),
                        "verified": secrets.randbelow(10) > 7,
                        "lastActivity": "2 days ago"
                    },
                    {
                        "username": f"{query.lower()}_official",
                        "url": f"https://{platform}.com/{query.lower()}_official",
                        "followers": secrets.randbelow(50000),
                        "verified": secrets.randbelow(10) > 5,
                        "lastActivity": "1 week ago"
                    }
                ][:secrets.randbelow(2) + 1]
            })
    
    return {
        "query": query,
        "platforms": platform_list,
        "results": results,
        "total_profiles": sum(len(r["profiles"]) for r in results),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/tools/image-analysis")
async def analyze_image(
    image_url: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Analyze image for reverse search and metadata"""
    source = image_url or "uploaded_image.jpg"
    
    return {
        "source": source,
        "reverse_search": [
            {
                "engine": "Google Images",
                "matches": 15,
                "url": "https://images.google.com/search?tbs=sbi:...",
                "similar": [
                    {"url": "https://example.com/image1.jpg", "similarity": "95%"},
                    {"url": "https://example.com/image2.jpg", "similarity": "87%"},
                    {"url": "https://example.com/image3.jpg", "similarity": "82%"}
                ]
            },
            {
                "engine": "TinEye",
                "matches": 8,
                "url": "https://tineye.com/search/...",
                "similar": [
                    {"url": "https://site1.com/photo.jpg", "similarity": "92%"},
                    {"url": "https://site2.com/pic.jpg", "similarity": "89%"}
                ]
            }
        ],
        "metadata": {
            "filename": source,
            "filesize": "2.4 MB",
            "dimensions": "1920x1080",
            "format": "JPEG",
            "camera": "Canon EOS 5D Mark IV",
            "location": "GPS coordinates removed",
            "timestamp": "2024-01-15 14:30:22",
            "software": "Adobe Photoshop 2024"
        },
        "similar_images": [
            {"url": "https://example.com/similar1.jpg", "confidence": "94%"},
            {"url": "https://example.com/similar2.jpg", "confidence": "91%"},
            {"url": "https://example.com/similar3.jpg", "confidence": "88%"},
            {"url": "https://example.com/similar4.jpg", "confidence": "85%"}
        ],
        "analysis_timestamp": datetime.now().isoformat()
    }

@app.get("/docs-info")
async def docs_info():
    """Information about API documentation"""
    return {
        "documentation": "Available at /docs",
        "openapi": "Available at /openapi.json",
        "endpoints": {
            "authentication": ["/auth/register", "/auth/login"],
            "investigations": ["/api/v1/investigations"],
            "reports": ["/api/v1/reports/metrics", "/api/v1/reports/activity", "/api/v1/reports/export"],
            "email_intel": ["/api/v1/email/investigate"],
            "search": ["/api/v1/search/engines"],
            "phone_intel": ["/api/v1/phone/investigate"],
            "domain_intel": ["/api/v1/domain/basic-info", "/api/v1/domain/whois", "/api/v1/domain/dns", "/api/v1/domain/subdomains", "/api/v1/domain/technology", "/api/v1/domain/security", "/api/v1/domain/geolocation", "/api/v1/domain/related", "/api/v1/domain/bulk-analyze"],
            "image_analysis": ["/api/v1/image/analyze", "/api/v1/image/reverse-search", "/api/v1/image/extract-metadata", "/api/v1/image/bulk-analyze"]
        }
    }

def create_admin_user():
    """Create default admin user"""
    admin_email = "admin@example.com"
    if admin_email not in users_db:
        users_db[admin_email] = {
            "id": "admin-001",
            "email": admin_email,
            "hashed_password": hash_password("admin123"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "permissions": [
                "investigation:read", "investigation:create", "investigation:update", "investigation:delete",
                "email:investigate", "social:investigate", "domain:investigate",
                "search:query", "phone:investigate", "image:analyze", "export:create",
                "admin:users", "admin:audit", "admin:metrics"
            ]
        }
        print("✅ Admin user created:")
        print(f"   📧 Email: {admin_email}")
        print(f"   🔑 Password: admin123")

if __name__ == "__main__":
    print("🚀 Starting OSINT Intelligence Platform")
    print("=" * 50)
    
    # Create admin user
    create_admin_user()
    
    print("📋 Platform Information:")
    print("  🌐 API Base: http://localhost:8002")
    print("  📚 API Documentation: http://localhost:8002/docs")
    print("  📊 Health Check: http://localhost:8002/health")
    print("  🔧 Admin Login: admin@osint.local / admin123")
    print("")
    print("🧪 Quick Test Commands:")
    print("  curl http://localhost:8002/health")
    print("  curl http://localhost:8002/docs-info")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8002, 
        log_level="info",
        access_log=True
    )