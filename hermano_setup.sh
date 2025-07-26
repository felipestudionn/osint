#!/bin/bash

echo "🚀 PLATAFORMA OSINT - SETUP AUTOMÁTICO"
echo "======================================"

# Ir al directorio
cd /home/ciberboot

# Iniciar plataforma
echo "🔥 Iniciando plataforma OSINT..."
nohup python3 working_osint_api.py > osint_platform.log 2>&1 &

# Esperar un poco
sleep 5

# Verificar
echo "✅ Verificando..."
curl -s http://localhost:8002/health

echo ""
echo "🎉 ¡LISTO!"
echo ""
echo "🌐 Ve a: http://localhost:8002/docs"
echo "🔑 Login: admin@example.com / admin123"
echo ""
echo "📋 Para comandos avanzados:"
echo "cat QUICK_START_HERMANO.txt"
echo ""
echo "🛠️ Para parar:"
echo "pkill -f working_osint_api.py"