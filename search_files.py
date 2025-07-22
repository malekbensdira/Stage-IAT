import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Autorise les requêtes cross-origin

SEARCH_DIRECTORY = os.path.normpath('C:/Users/MALEK/Desktop/stage IAT')

def find_items(root_dir, query):
    """
    Recherche des fichiers et des dossiers de manière robuste.
    """
    results = []
    search_term = query.lower()

    if not search_term:
        return []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Combine les dossiers et les fichiers pour une vérification unifiée
        all_names = dirnames + filenames
        for name in all_names:
            if search_term in name.lower():
                # Construit le chemin complet pour vérifier le type
                full_path = os.path.join(dirpath, name)
                item_type = 'directory' if os.path.isdir(full_path) else 'file'
                results.append({'name': name, 'type': item_type})

    # Élimine les doublons potentiels en gardant la dernière occurrence trouvée
    unique_results = {item['name']: item for item in results}
    return list(unique_results.values())

@app.route('/search', methods=['GET'])
def search():
    filename = request.args.get('filename', '')
    
    if not os.path.isdir(SEARCH_DIRECTORY):
        return jsonify({"error": f"Le répertoire de recherche '{SEARCH_DIRECTORY}' n'existe pas."}), 500
        
    results = find_items(SEARCH_DIRECTORY, filename)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000) 