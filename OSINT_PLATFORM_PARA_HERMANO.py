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

@app.get("/api")
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

@app.get("/docs-info")
async def docs_info():
    """Information about API documentation"""
    return {
        "documentation": "Available at /docs",
        "openapi": "Available at /openapi.json",
        "endpoints": {
            "authentication": ["/auth/register", "/auth/login"],
            "investigations": ["/api/v1/investigations"],
            "email_intel": ["/api/v1/email/investigate"],
            "search": ["/api/v1/search/engines"],
            "phone_intel": ["/api/v1/phone/investigate"]
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