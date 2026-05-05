#!/bin/bash
cd "$(dirname "$0")"
echo "------------------------------------------------"
echo "MISE À JOUR DU CATALOGUE ORCA CONGO"
echo "------------------------------------------------"
echo ""

# Vérification/Installation des outils nécessaires
if ! python3 -c "import pandas, openpyxl" &> /dev/null; then
    echo "Installation des outils nécessaires (une seule fois)..."
    python3 -m pip install pandas openpyxl
fi

# Exécution du script de synchronisation
python3 synchroniser_catalogue.py

echo ""
echo "------------------------------------------------"
echo "Terminé ! Vous pouvez maintenant ouvrir"
echo "GitHub Desktop pour envoyer les changements."
echo "------------------------------------------------"
read -p "Appuyez sur Entrée pour fermer cette fenêtre..."
