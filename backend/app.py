import os
import sys
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase_client import supabase
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pypdf import PdfReader
from google import genai
from google.genai import types
import unicodedata

current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

gemini_key = os.environ.get('GEMINI_API_KEY')
client = None
if gemini_key:
    try:
        client = genai.Client(api_key=gemini_key)
        print('Gemini GenAI client configured successfully.')
    except Exception as e:
        print(f'Error configuring Gemini client: {e}')
else:
    print('Warning: GEMINI_API_KEY not found. Operating in local fallback mode.')

# ===== MOCK DATA =====

MOCK_TENDERS = [
    {'id': 'tender-001', 'proyecto': 'Via Expresa Sur', 'contratista': 'Constructora A', 'demanda': 450, 'match': 98, 'estado': 'cotizar', 'ubicacion': 'Lima Sur', 'fecha_limite': '2026-07-25', 'materiales_requeridos': ['Asfalto modificado con caucho', 'Mulch de caucho'], 'presupuesto_estimado': 125000},
    {'id': 'tender-002', 'proyecto': 'Hospital Regional Ate', 'contratista': 'Consorcio Salud Integral', 'demanda': 120, 'match': 85, 'estado': 'cotizar', 'ubicacion': 'Ate', 'fecha_limite': '2026-07-30', 'materiales_requeridos': ['Pisos deportivos de caucho', 'Granulo grueso'], 'presupuesto_estimado': 45000},
    {'id': 'tender-003', 'proyecto': 'Ampliacion Puerto Callao', 'contratista': 'Logistica Portuaria S.A.', 'demanda': 800, 'match': 62, 'estado': 'cerrado', 'ubicacion': 'Callao', 'fecha_limite': '2026-07-15', 'materiales_requeridos': ['Aceite de pirolisis', 'Combustible industrial'], 'presupuesto_estimado': 280000},
    {'id': 'tender-004', 'proyecto': 'Renovacion Acueducto Centro', 'contratista': 'Aguas Claras E.I.R.L.', 'demanda': 300, 'match': 91, 'estado': 'cotizar', 'ubicacion': 'Lima Centro', 'fecha_limite': '2026-08-05', 'materiales_requeridos': ['Tubos con caucho reciclado', 'Sellantes'], 'presupuesto_estimado': 98000},
    {'id': 'tender-005', 'proyecto': 'Pista Deportiva Villa El Salvador', 'contratista': 'Municipalidad VES', 'demanda': 85, 'match': 95, 'estado': 'cotizar', 'ubicacion': 'Villa El Salvador', 'fecha_limite': '2026-08-10', 'materiales_requeridos': ['Pisos de caucho', 'Granulo fino'], 'presupuesto_estimado': 32000}
]

MOCK_KPIS = {
    'ordenes_recientes': 15,
    'ordenes_trend': 4,
    'stock_almacen': 854,
    'stock_ubicacion': 'Lurin / Huachipa',
    'ventas_mes': '$1.22M',
    'ventas_trend': 12,
    'impacto_co2': 100,
    'empresas_aliadas': 15,
    'objetivo_q': 'Q3'
}

MOCK_LOGISTICS_ROUTES = {
    ('Almacen Lurin', 'Obra Ate'): {'distancia_km': 28, 'ahorro_flete': 14, 'reduccion_co2': 18, 'tiempo_estimado': '45 min', 'ruta_optimizada': ['Lurin', 'Villa Maria', 'San Juan', 'Ate']},
    ('Almacen Lurin', 'Obra Callao'): {'distancia_km': 35, 'ahorro_flete': 22, 'reduccion_co2': 25, 'tiempo_estimado': '55 min', 'ruta_optimizada': ['Lurin', 'San Miguel', 'Callao']},
    ('Almacen Lurin', 'Obra Surco'): {'distancia_km': 18, 'ahorro_flete': 8, 'reduccion_co2': 12, 'tiempo_estimado': '30 min', 'ruta_optimizada': ['Lurin', 'Chorrillos', 'Surco']},
    ('Almacen Lurin', 'Obra San Miguel'): {'distancia_km': 22, 'ahorro_flete': 11, 'reduccion_co2': 15, 'tiempo_estimado': '38 min', 'ruta_optimizada': ['Lurin', 'Barranco', 'San Miguel']},
    ('Almacen Huachipa', 'Obra Ate'): {'distancia_km': 12, 'ahorro_flete': 5, 'reduccion_co2': 8, 'tiempo_estimado': '20 min', 'ruta_optimizada': ['Huachipa', 'Ate']},
    ('Planta Callao', 'Obra Callao'): {'distancia_km': 8, 'ahorro_flete': 3, 'reduccion_co2': 5, 'tiempo_estimado': '15 min', 'ruta_optimizada': ['Planta Callao', 'Callao Centro']}
}

STATIC_REGULATIONS = [
    {'id': 'ds-024-2021', 'title': 'D.S. 024-2021-MINAM', 'name': 'Regimen Especial de Gestion de Neumaticos Fuera de Uso (NFU)', 'summary': 'Establece la obligatoriedad para productores e importadores de neumaticos de garantizar la recoleccion, transporte y valorizacion de los NFU en porcentajes anuales crecientes. Promueve la valorizacion material y energetica.', 'snippet': 'Los productores de neumaticos estan obligados a garantizar la recoleccion y valorizacion de los NFU en los porcentajes anuales establecidos. El uso de material granulado reciclado en procesos productivos es reconocido como valorizacion material.'},
    {'id': 'ley-1278', 'title': 'D.L. 1278', 'name': 'Ley de Gestion Integral de Residuos Solidos', 'summary': 'Establece derechos, obligaciones y atribuciones para la gestion integral de residuos solidos en Peru, priorizando la minimizacion en la fuente, la valorizacion material y energetica frente a la disposicion final. Fomenta la transicion hacia una economia circular.', 'snippet': 'La gestion de residuos solidos en el Peru prioriza la valorizacion de los mismos (reutilizacion, reciclaje, compostaje, recuperacion energetica) sobre su disposicion final, fomentando la economia circular y la inversion privada.'},
    {'id': 'certificacion-verde', 'title': 'Ecoetiquetado y Compras Verdes', 'name': 'Lineamientos de Ecoeficiencia del Sector Publico', 'summary': 'Establece incentivos y criterios de sostenibilidad para compras publicas y privadas, promoviendo el uso de insumos reciclados o de bajo impacto ambiental.', 'snippet': 'Las empresas que incorporen materiales de caucho reciclado u otros insumos provenientes de procesos de economia circular obtienen puntajes adicionales en licitaciones del Estado y auditorias de certificacion verde.'}
]

def load_regulations_from_pdf():
    pdf_path = os.path.join(current_dir, 'data', 'regulations.pdf')
    if not os.path.exists(pdf_path):
        print(f'Warning: PDF not found at {pdf_path}. Using static fallback.')
        return STATIC_REGULATIONS
    try:
        reader = PdfReader(pdf_path)
        text = ''
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + '\n'
        ds_idx = text.find('1. D.S. 024-2021-MINAM')
        dl_idx = text.find('2. D.L. 1278')
        eco_idx = text.find('3. Ecoetiquetado y Compras Verdes')
        parsed_regs = []
        if ds_idx != -1 and dl_idx != -1 and eco_idx != -1:
            ds_text = text[ds_idx:dl_idx].strip()
            dl_text = text[dl_idx:eco_idx].strip()
            eco_text = text[eco_idx:].strip()
            def parse_section(sec_text, default_name):
                lines_local = sec_text.split('\n')
                title = default_name
                summary = ''
                snippet = ''
                for line_local in lines_local:
                    if line_local.startswith('1. ') or line_local.startswith('2. ') or line_local.startswith('3. '):
                        title = line_local.split(' - ')[0].replace('1. ', '').replace('2. ', '').replace('3. ', '').strip()
                    elif 'Descripcion General:' in line_local:
                        summary = line_local.replace('**Descripcion General:**', '').replace('Descripcion General:', '').strip()
                    elif 'Extracto de Ley:' in line_local:
                        snippet = line_local.replace('**Extracto de Ley:**', '').replace('Extracto de Ley:', '').strip()
                summary = summary.replace('**', '').strip()
                snippet = snippet.replace('**', '').strip()
                return {'id': title.lower().replace('.', '').replace(' ', '-'), 'title': title, 'name': default_name, 'summary': summary, 'snippet': snippet}
            parsed_regs.append(parse_section(ds_text, 'Regimen Especial de Gestion de Neumaticos Fuera de Uso (NFU)'))
            parsed_regs.append(parse_section(dl_text, 'Ley de Gestion Integral de Residuos Solidos'))
            parsed_regs.append(parse_section(eco_text, 'Lineamientos de Ecoeficiencia del Sector Publico'))
            print(f'Loaded {len(parsed_regs)} regulations from PDF')
            return parsed_regs
    except Exception as e:
        print(f'Error parsing PDF: {e}. Using static data.')
    return STATIC_REGULATIONS

REGULATIONS = load_regulations_from_pdf()

def fetch_products():
    try:
        response = supabase.table('products').select('*').execute()
        return response.data or []
    except Exception as e:
        print(f'Error fetching products: {e}')
        return []

def normalize_text(text):
    if not text:
        return ''
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    return text.lower()

def retrieve_context(query, products):
    documents = []
    doc_mapping = []
    for p in products:
        chars = ', '.join(p.get('characteristics', []) or [])
        text = f"{p['name']}. {p.get('description', '')}. Uso: {p.get('usage', '')}. Caracteristicas: {chars}"
        documents.append(text)
        doc_mapping.append({'type': 'product', 'data': p})
    for r in REGULATIONS:
        text = f"{r['title']} {r['name']}. {r['summary']} {r['snippet']}"
        documents.append(text)
        doc_mapping.append({'type': 'regulation', 'data': r})
    if not documents:
        return None, None
    normalized_docs = [normalize_text(d) for d in documents]
    normalized_query = normalize_text(query)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(normalized_docs)
    query_vec = vectorizer.transform([normalized_query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    best_product = None
    best_product_score = -1
    best_regulation = None
    best_regulation_score = -1
    for idx, score in enumerate(similarities):
        doc_type = doc_mapping[idx]['type']
        data = doc_mapping[idx]['data']
        if doc_type == 'product':
            if score > best_product_score and score > 0.05:
                best_product_score = score
                best_product = data
        elif doc_type == 'regulation':
            if score > best_regulation_score and score > 0.05:
                best_regulation_score = score
                best_regulation = data
    return best_product, best_regulation

def generate_local_response(query, best_product, best_regulation):
    query_lower = query.lower()
    product_keywords = ['precio', 'costo', 'cuanto', 'cuesta', 'stock', 'inventario', 'comprar', 'cotizar', 'vender', 'adquirir', 'ficha', 'aceite', 'pirolisis', 'tpo', 'caucho', 'mulch', 'granulo', 'chip']
    is_product_query = any(kw in query_lower for kw in product_keywords)
    if best_product and (is_product_query or best_product['name'].lower() in query_lower):
        chars = ', '.join(best_product.get('characteristics', []) or [])
        content = f"El producto **{best_product['name']}** esta disponible con stock de {best_product.get('stock', 0)} {best_product['unit']}(s) a **${best_product['price']}** por {best_product['unit']}.\n\n**Caracteristicas:** {chars}.\n**Uso principal:** {best_product.get('usage', '')}."
        action = None
        if any(kw in query_lower for kw in ['comprar', 'adquirir', 'cotizar', 'precio', 'cuesta', 'cuanto']):
            action = {'label': f"Cotizar {best_product['name']}", 'icon': 'shopping-cart', 'actionType': f"quote_product_{best_product['id']}"}
        law_snippet = None
        if best_regulation:
            law_snippet = {'title': best_regulation['title'], 'text': best_regulation['snippet']}
        elif 'aceite' in best_product['name'].lower():
            law_snippet = {'title': REGULATIONS[1]['title'], 'text': REGULATIONS[1]['snippet']}
        else:
            law_snippet = {'title': REGULATIONS[0]['title'], 'text': REGULATIONS[0]['snippet']}
        return content, law_snippet, action
    if best_regulation:
        content = f"El **{best_regulation['title']}** ({best_regulation['name']}) es de gran relevancia.\n\n{best_regulation['summary']}\n\n"
        if best_product:
            content += f"Nuestros productos como el **{best_product['name']}** cumplen esta normativa."
        else:
            content += 'Nuestros productos de caucho granulado y pirolisis apoyan el cumplimiento.'
        action = None
        if "certificado" in query_lower or "descargar" in query_lower or "cumplimiento" in query_lower:
            action = {
                "label": "Descargar Ficha de Cumplimiento",
                "icon": "download",
                "actionType": "download_certificate"
            }

        return content, {
            "title": best_regulation["title"],
            "text": best_regulation["snippet"]
        }, action

    # 3. Default fallback
    content = "Hola, soy **Terra AI**, asistente virtual de **RevoLink**. Puedo ayudarte a responder consultas técnicas sobre economía circular, neumáticos fuera de uso (NFU) y nuestros productos ecológicos (Mulch de Caucho y Aceite de Pirólisis) bajo la normativa peruana D.S. 024-2021-MINAM."
    return content, None, None

def generate_gemini_response(query, best_product, best_regulation):
    context = ''
    if best_product:
        context += f"Producto: {best_product['name']}\nDesc: {best_product.get('description', '')}\nUso: {best_product.get('usage', '')}\nPrecio: ${best_product['price']} por {best_product['unit']}\nStock: {best_product.get('stock', 0)}\n\n"
    if best_regulation:
        context += f"Regulación Ambiental Peruana Relevante:\n- Título: {best_regulation['title']}\n- Nombre: {best_regulation['name']}\n- Resumen: {best_regulation['summary']}\n- Extracto: {best_regulation['snippet']}\n\n"

    system_prompt = (
        "Eres Terra AI, el asistente virtual experto en economía circular y gestión de neumáticos fuera de uso (NFU) de la plataforma RevoLink.\n"
        "Debes responder de manera profesional, clara y concisa en español, utilizando formato markdown.\n"
        "Bajo ninguna circunstancia inventes información técnica o de precios. Si no encuentras la información en el contexto provisto, indícalo educadamente.\n"
        "Si el usuario pregunta sobre cómo comprar, cotizar o descargar certificados, incluye una indicación clara en tu respuesta de que hay un botón disponible.\n"
        "Usa etiquetas HTML fuertes (strong) para destacar términos clave de manera estética."
    )

    prompt = f"Contexto:\n{context}\n\nPregunta del usuario:\n{query}\n\nRespuesta de Terra AI:"

    try:
        response = client.models.generate_content(model='gemini-1.5-flash', contents=prompt, config=types.GenerateContentConfig(system_instruction=system_prompt))
        text = response.text.strip()
        action = None
        query_lower = query.lower()
        if 'certificado' in query_lower or 'descargar' in query_lower:
            action = {'label': 'Descargar Certificado PDF', 'icon': 'download', 'actionType': 'download_certificate'}
        elif best_product and any(kw in query_lower for kw in ['comprar', 'cotizar', 'precio', 'cuesta', 'cuanto']):
            action = {'label': f"Cotizar {best_product['name']}", 'icon': 'shopping-cart', 'actionType': f"quote_product_{best_product['id']}"}
        law_snippet = None
        if best_regulation:
            law_snippet = {'title': best_regulation['title'], 'text': best_regulation['snippet']}
        return text, law_snippet, action
    except Exception as e:
        print(f'Error Gemini: {e}. Fallback local.')
        return generate_local_response(query, best_product, best_regulation)

# ===== ENDPOINTS =====

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    query = data.get('message', '').strip()
    if not query:
        return jsonify({'error': 'Message is required'}), 400
    products = fetch_products()
    best_product, best_regulation = retrieve_context(query, products)
    if client:
        content, law_snippet, action_button = generate_gemini_response(query, best_product, best_regulation)
    else:
        content, law_snippet, action_button = generate_local_response(query, best_product, best_regulation)
    return jsonify({'content': content, 'lawSnippet': law_snippet, 'actionButton': action_button})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "mode": "gemini" if client else "local"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
