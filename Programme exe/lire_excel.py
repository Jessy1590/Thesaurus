import pandas as pd
import json
from datetime import datetime
import os
import sys

# Dossier où se trouve l'exécutable ou le script
if getattr(sys, 'frozen', False):
    # Cas .exe : on prend le dossier parent du dossier contenant le .exe
    BASE_DIR = os.path.dirname(os.path.dirname(sys.executable))
else:
    # Cas .py : on prend le dossier parent du script
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

fichier_excel = os.path.join(BASE_DIR, 'Paramètre.xlsx')

# Charger toutes les feuilles du fichier Excel
feuilles = pd.read_excel(fichier_excel, sheet_name=None)

df_molecule = feuilles['Molécule']
df_surveillance = feuilles['Surveillance']
df_indications = feuilles['Indications']
df_posologie = feuilles['Posologie']

# Normalisation des clés pour la fusion (minuscule, strip)
df_molecule['DCI_KEY'] = df_molecule['l'].astype(str).str.lower().str.strip()
df_indications['DCI_KEY'] = df_indications['DCI'].astype(str).str.lower().str.strip()
df_surveillance['DCI_KEY'] = df_surveillance['DCI'].astype(str).str.lower().str.strip()
df_posologie['DCI_KEY'] = df_posologie['DCI'].astype(str).str.lower().str.strip()

rows = []
for dci_key, group in df_molecule.groupby('DCI_KEY'):
    dci_display = group['l'].iloc[0]
    # Rassembler tous les produits de la DCI
    details = []
    nb_produits = len(group)
    for i, (_, prod) in enumerate(group.iterrows(), 1):
        produit_points = []
        for col in df_molecule.columns:
            if col not in ['DCI_KEY', 'l']:
                val = prod[col]
                if not (pd.isna(val) or val == ''):
                    produit_points.append(f"{col.strip()} : {val}")
        if produit_points:
            if nb_produits > 1:
                details.append(f"\tProduit {i} :\n" + '\n'.join([f"• {pt}" for pt in produit_points]))
            else:
                details.append('\n'.join([f"• {pt}" for pt in produit_points]))
    details_str = '\n\n'.join(details)
    # Surveillances
    surveillances = df_surveillance[df_surveillance['DCI_KEY'] == dci_key]['Surveillance'].tolist()
    surveillances_str = '\n'.join([f"• {s}" for s in surveillances]) if surveillances else ''
    # Indications + remboursement
    indications_df = df_indications[df_indications['DCI_KEY'] == dci_key]
    if 'Remboursement' in indications_df.columns:
        indications_list = [[d['Indications'], d['Remboursement']] for d in indications_df[['Indications', 'Remboursement']].to_dict('records')]
    else:
        indications_list = [[d['Indications']] for d in indications_df[['Indications']].to_dict('records')]
    if indications_list and len(indications_list[0]) == 2:
        indications_str = '\n'.join([f"• {indication} ({remboursement})" for indication, remboursement in indications_list])
    else:
        indications_str = '\n'.join([f"• {indication[0]}" for indication in indications_list])
    # Posologies
    posologies = df_posologie[df_posologie['DCI_KEY'] == dci_key]['Posologie'].tolist()
    posologies_str = '\n'.join([f"• {p}" for p in posologies]) if posologies else ''
    # Ligne finale
    row = {
        'DCI': dci_display,
        'Détails produit': details_str,
        'Surveillance': surveillances_str,
        'Indications': indications_str,
        'Posologie': posologies_str
    }
    rows.append(row)

# Export Excel
fusion = pd.DataFrame(rows)
excel_path = os.path.join(BASE_DIR, 'Tableau_Fusionné.xlsx')
fusion.to_excel(excel_path, index=False)
print(f"\nLe tableau fusionné a été exporté dans '{excel_path}'.")

# Date et heure de génération
now = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

# Export JS pour la page web (avec \n pour les retours à la ligne et la date de mise à jour)
data_js = {
    'tableData': rows,
    'lastUpdate': now
}
datajs_path = os.path.join(BASE_DIR, 'data.js')
with open(datajs_path, 'w', encoding='utf-8') as f:
    f.write('window.dataFromPython = ')
    json.dump(data_js, f, ensure_ascii=False)
    f.write(';')
print(f"Les données ont aussi été exportées dans '{datajs_path}' pour la page web (mise à jour : {now}).") 