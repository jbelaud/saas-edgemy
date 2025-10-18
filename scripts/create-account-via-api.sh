#!/bin/bash

# Script pour créer un compte de test via l'API Better Auth

echo "🔐 Création d'un compte de test via l'API Better Auth..."
echo ""

# Créer le compte coach-test
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach-test@edgemy.fr",
    "password": "Password123!",
    "name": "Coach Test"
  }'

echo ""
echo ""
echo "✅ Compte créé! Essayez de vous connecter avec:"
echo "   Email: coach-test@edgemy.fr"
echo "   Password: Password123!"
