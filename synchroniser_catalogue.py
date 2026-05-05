import pandas as pd
import json
import os

# Configuration des chemins
EXCEL_FILE = 'Table RADFichierB.xlsx'
DATA_JS_FILE = 'js/data.js'
PHOTO_DIR = 'assets/produits/'

def update_catalog():
    print(f"--- Mise à jour du catalogue ORCA ---")
    
    if not os.path.exists(EXCEL_FILE):
        print(f"Erreur : Le fichier {EXCEL_FILE} est introuvable.")
        return

    print(f"Lecture de l'Excel...")
    # Charger l'Excel
    try:
        # On lit toutes les colonnes selon la structure confirmée
        df = pd.read_excel(EXCEL_FILE)
    except Exception as e:
        print(f"Erreur lors de la lecture de l'Excel : {e}")
        return

    # Nettoyage basique
    df = df.fillna('')
    
    products = []
    
    print(f"Traitement de {len(df)} articles...")
    
    for _, row in df.iterrows():
        # Calcul du stock total
        try:
            stock_mag = float(row['STOCK MAG']) if row['STOCK MAG'] != '' else 0
            stock_depot = float(row['STOCK DEPOT']) if row['STOCK DEPOT'] != '' else 0
        except:
            stock_mag = 0
            stock_depot = 0
            
        stock_total = stock_mag + stock_depot
        
        # Préparation de l'objet produit
        product = {
            "cb": str(row['CB']).strip(),
            "nom": str(row['Désignation']).strip(),
            "categorie": str(row['Catégorie']).strip(),
            "secteur": str(row['Secteurs']).strip(),
            "famille": str(row['Famille ']).strip(), # Note : Espace dans le nom de la colonne détecté
            "sous_famille": str(row['Sous famille']).strip(),
            "prix": float(row['PV DETAIL']) if row['PV DETAIL'] != '' else 0,
            "prix_promo": float(row['Prix promo']) if row['Prix promo'] != '' else 0,
            "stock_mag": int(stock_mag),
            "stock_depot": int(stock_depot),
            "en_stock": stock_total > 0
        }
        products.append(product)

    # Écriture dans js/data.js
    print(f"Génération de {DATA_JS_FILE}...")
    try:
        with open(DATA_JS_FILE, 'w', encoding='utf-8') as f:
            f.write(f"window.ORCA_PRODUCTS = {json.dumps(products, indent=2, ensure_ascii=False)};")
        print(f"Succès ! {len(products)} produits synchronisés.")
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier JS : {e}")

    print("\n--- Terminé ---")
    print("N'oubliez pas de faire un PUSH sur GitHub Desktop pour mettre le site à jour en ligne.")

if __name__ == "__main__":
    update_catalog()
