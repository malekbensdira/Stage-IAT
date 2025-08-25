import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from flask import Response

# Configure Flask to serve Angular built files
ANGULAR_DIST_DIR = os.path.join(os.path.dirname(__file__), 'dist', 'chatbot-personnel')
app = Flask(__name__, static_folder=ANGULAR_DIST_DIR, static_url_path='')
CORS(app)  # Autorise les requêtes cross-origin (sans effet si même origine)

SEARCH_DIRECTORY = os.path.normpath('C:/Users/MALEK/Desktop/stage IAT')
TARGET_API = 'http://127.0.0.1:3000'

HOP_BY_HOP_HEADERS = {
	'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
	'te', 'trailer', 'transfer-encoding', 'upgrade'
}

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
				results.append({'name': name, 'type': item_type, 'full_path': full_path})

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

@app.route('/open', methods=['POST'])
def open_path():
	data = request.get_json()
	path = data.get('path')
	if not path or not os.path.exists(path):
		return jsonify({'error': 'Chemin invalide'}), 400
	try:
		os.startfile(path)
		return jsonify({'success': True})
	except Exception as e:
		return jsonify({'error': str(e)}), 500

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path: str):
	url = f"{TARGET_API}/api/{path}"
	# Copie des en-têtes en supprimant ceux qui ne doivent pas être transférés
	forward_headers = {}
	for k, v in request.headers.items():
		kl = k.lower()
		if kl == 'host' or kl in HOP_BY_HOP_HEADERS:
			continue
		forward_headers[k] = v

	resp = requests.request(
		method=request.method,
		url=url,
		params=request.args,
		data=request.get_data(),
		headers=forward_headers,
		cookies=request.cookies,
		allow_redirects=False,
	)

	# Construire une réponse minimale sans en-têtes hop-by-hop
	response = Response(resp.content, resp.status_code)
	content_type = resp.headers.get('Content-Type')
	if content_type:
		response.headers['Content-Type'] = content_type
	set_cookie = resp.headers.get('Set-Cookie')
	if set_cookie:
		response.headers['Set-Cookie'] = set_cookie
	return response

# Routes pour servir l'application Angular (fichiers statiques + fallback index.html)
@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path: str = ''):
	# Si le fichier demandé existe dans le dossier dist, on le sert directement
	requested_path = os.path.join(app.static_folder, path)
	if path and os.path.exists(requested_path) and os.path.isfile(requested_path):
		return send_from_directory(app.static_folder, path)
	# Sinon on renvoie index.html (Angular gère le routing côté client)
	return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
	# En dev local uniquement; en prod utiliser waitress-serve
	app.run(host='0.0.0.0', debug=False, port=5000) 