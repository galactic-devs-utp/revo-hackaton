import os
import sys
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

# Load environment variables relative to this file
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
# Enable CORS so frontend (usually running on port 5173 for Vite) can connect
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure Gemini Client
gemini_key = os.environ.get("GEMINI_API_KEY")
client = None
if gemini_key:
    try:
        client = genai.Client(api_key=gemini_key)
        print("Gemini GenAI client configured successfully.")
    except Exception as e:
        print(f"Error configuring Gemini client: {e}")
else:
    print("Warning: GEMINI_API_KEY not found. Operating in local fallback mode.")

# Static Fallback database (in case PDF is missing or fails to load)
STATIC_REGULATIONS = [
    {
        "id": "ds-024-2021",
        "title": "D.S. 024-2021-MINAM",
        "name": "Régimen Especial de Gestión de Neumáticos Fuera de Uso (NFU)",
        "summary": "Establece la obligatoriedad para productores e importadores de neumáticos de garantizar la recolección, transporte y valorización de los neumáticos fuera de uso (NFU) en porcentajes anuales crecientes. Promueve la valorización material (como asfalto modificado, mulch, pisos deportivos) y energética.",
        "snippet": "Los productores de neumáticos están obligados a garantizar la recolección y valorización de los NFU en los porcentajes anuales establecidos. El uso de material granulado reciclado en procesos productivos es reconocido como valorización material."
    },
    {
        "id": "ley-1278",
        "title": "D.L. 1278",
        "name": "Ley de Gestión Integral de Residuos Sólidos",
        "summary": "Establece derechos, obligaciones y atribuciones para la gestión integral de residuos sólidos en Perú, priorizando la minimización en la fuente, la valorización material y energética frente a la disposición final. Fomenta la transición hacia una economía circular.",
        "snippet": "La gestión de residuos sólidos en el Perú prioriza la valorización de los mismos (reutilización, reciclaje, compostaje, recuperación energética) sobre su disposición final, fomentando la economía circular y la inversión privada."
    },
    {
        "id": "certificacion-verde",
        "title": "Ecoetiquetado y Compras Verdes",
        "name": "Lineamientos de Ecoeficiencia del Sector Público",
        "summary": "Establece incentivos y criterios de sostenibilidad para compras públicas y privadas, promoviendo el uso de insumos reciclados o de bajo impacto ambiental.",
        "snippet": "Las empresas que incorporen materiales de caucho reciclado u otros insumos provenientes de procesos de economía circular obtienen puntajes adicionales en licitaciones del Estado y auditorías de certificación verde."
    }
]

def load_regulations_from_pdf():
    """Reads regulations dynamically from the PDF knowledge base in data/regulations.pdf."""
    pdf_path = os.path.join(current_dir, 'data', 'regulations.pdf')
    
    if not os.path.exists(pdf_path):
        print(f"Warning: PDF knowledge base not found at {pdf_path}. Using static fallback.")
        return STATIC_REGULATIONS

    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Find index boundaries of sections
        ds_idx = text.find("1. D.S. 024-2021-MINAM")
        dl_idx = text.find("2. D.L. 1278")
        eco_idx = text.find("3. Ecoetiquetado y Compras Verdes")
        
        parsed_regs = []
        if ds_idx != -1 and dl_idx != -1 and eco_idx != -1:
            ds_text = text[ds_idx:dl_idx].strip()
            dl_text = text[dl_idx:eco_idx].strip()
            eco_text = text[eco_idx:].strip()
            
            def parse_section(sec_text, default_name):
                lines = sec_text.split("\n")
                title = default_name
                summary = ""
                snippet = ""
                
                for line in lines:
                    if line.startswith("1. ") or line.startswith("2. ") or line.startswith("3. "):
                        # Extract title (e.g. "D.S. 024-2021-MINAM")
                        title = line.split(" - ")[0].replace("1. ", "").replace("2. ", "").replace("3. ", "").strip()
                    elif "**Descripción General:**" in line or "Descripción General:" in line:
                        summary = line.replace("**Descripción General:**", "").replace("Descripción General:", "").strip()
                    elif "**Extracto de Ley:**" in line or "Extracto de Ley:" in line:
                        snippet = line.replace("**Extracto de Ley:**", "").replace("Extracto de Ley:", "").strip()
                
                # Clean markdown bold highlights
                summary = summary.replace("**", "").strip()
                snippet = snippet.replace("**", "").strip()
                
                return {
                    "id": title.lower().replace(".", "").replace(" ", "-"),
                    "title": title,
                    "name": default_name,
                    "summary": summary,
                    "snippet": snippet
                }

            parsed_regs.append(parse_section(ds_text, "Régimen Especial de Gestión de Neumáticos Fuera de Uso (NFU)"))
            parsed_regs.append(parse_section(dl_text, "Ley de Gestión Integral de Residuos Sólidos"))
            parsed_regs.append(parse_section(eco_text, "Lineamientos de Ecoeficiencia del Sector Público"))
            
            print(f"Loaded {len(parsed_regs)} regulations dynamically from PDF: {[r['title'] for r in parsed_regs]}")
            return parsed_regs
    except Exception as e:
        print(f"Error parsing regulations PDF: {e}. Falling back to static data.")
        
    return STATIC_REGULATIONS

# Dynamic load of regulations
REGULATIONS = load_regulations_from_pdf()

def fetch_products():
    """Fetch products from Supabase table."""
    try:
        response = supabase.table("products").select("*").execute()
        return response.data or []
    except Exception as e:
        print(f"Error fetching products from Supabase: {e}")
        return []

def normalize_text(text):
    if not text:
        return ""
    # Normalize to NFD and strip diacritics
    text = "".join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    return text.lower()

def retrieve_context(query, products):
    """
    Perform simple TF-IDF similarity to find the most relevant product
    and environmental regulation.
    """
    documents = []
    doc_mapping = []

    # Add products to search pool
    for p in products:
        text = f"{p['name']}. {p.get('description', '')}. Uso: {p.get('usage', '')}. Características: {', '.join(p.get('characteristics', []) or [])}"
        documents.append(text)
        doc_mapping.append({"type": "product", "data": p})

    # Add regulations to search pool
    for r in REGULATIONS:
        text = f"{r['title']} {r['name']}. {r['summary']} {r['snippet']}"
        documents.append(text)
        doc_mapping.append({"type": "regulation", "data": r})

    if not documents:
        return None, None

    # Compute TF-IDF similarities on normalized text
    normalized_documents = [normalize_text(doc) for doc in documents]
    normalized_query = normalize_text(query)

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(normalized_documents)
    query_vector = vectorizer.transform([normalized_query])
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()

    best_product = None
    best_product_score = -1
    best_regulation = None
    best_regulation_score = -1

    for idx, score in enumerate(similarities):
        doc_type = doc_mapping[idx]["type"]
        data = doc_mapping[idx]["data"]
        if doc_type == "product":
            if score > best_product_score and score > 0.05:
                best_product_score = score
                best_product = data
        elif doc_type == "regulation":
            if score > best_regulation_score and score > 0.05:
                best_regulation_score = score
                best_regulation = data

    return best_product, best_regulation

def generate_local_response(query, best_product, best_regulation):
    """Fallback template generator when Gemini API key is not present."""
    query_lower = query.lower()
    
    # 1. Product specific query
    product_keywords = ["precio", "costo", "cuánto", "cuanto", "cuesta", "stock", "inventario", "comprar", "cotizar", "vender", "adquirir", "ficha", "aceite", "pirolisis", "tpo", "caucho", "mulch", "granulo", "chip"]
    is_product_query = any(kw in query_lower for kw in product_keywords)
    
    if best_product and (is_product_query or best_product["name"].lower() in query_lower):
        characteristics_str = ", ".join(best_product.get("characteristics", []) or [])
        content = f"El producto **{best_product['name']}** está disponible en inventario con un stock de {best_product.get('stock', 0)} {best_product['unit']}(s) a un precio de **${best_product['price']}** por {best_product['unit']}.\n\n"
        content += f"**Características:** {characteristics_str}.\n"
        content += f"**Uso principal:** {best_product.get('usage', '')}."
        
        # Action button logic
        action = None
        if any(kw in query_lower for kw in ["comprar", "adquirir", "cotizar", "precio", "cuesta", "cuanto", "cuánto"]):
            action = {
                "label": f"Cotizar {best_product['name']}",
                "icon": "shopping-cart",
                "actionType": f"quote_product_{best_product['id']}"
            }
        
        law_snippet = None
        if best_regulation:
            law_snippet = {
                "title": best_regulation["title"],
                "text": best_regulation["snippet"]
            }
        elif "aceite" in best_product["name"].lower():
            law_snippet = {
                "title": REGULATIONS[1]["title"],
                "text": REGULATIONS[1]["snippet"]
            }
        else:
            law_snippet = {
                "title": REGULATIONS[0]["title"],
                "text": REGULATIONS[0]["snippet"]
            }

        return content, law_snippet, action

    # 2. General regulation query
    if best_regulation:
        content = f"Con respecto a tu consulta sobre normativas ambientales, el **{best_regulation['title']} ({best_regulation['name']})** es de gran relevancia.\n\n"
        content += f"{best_regulation['summary']}\n\n"
        if best_product:
            content += f"Nuestros productos, como el **{best_product['name']}**, son ideales para cumplir con esta normativa mediante procesos de valorización autorizados."
        else:
            content += "Nuestros productos de caucho granulado y subproductos de pirólisis apoyan directamente al cumplimiento de estas metas."
        
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
    content = "Hola, soy **SofiA**, asistente virtual de **RevoLink**. Puedo ayudarte a responder consultas sobre neumáticos fuera de uso (NFU) y productos ecológicos de Caucho bajo la normativa peruana D.S. 024-2021-MINAM."
    return content, None, None

def generate_gemini_response(query, best_product, best_regulation):
    """Generate response using Gemini 1.5 Flash via google-genai SDK."""
    context = ""
    if best_product:
        context += f"Producto RevoLink Encontrado:\n- Nombre: {best_product['name']}\n- Descripción: {best_product.get('description', '')}\n- Uso: {best_product.get('usage', '')}\n- Características: {best_product.get('characteristics', [])}\n- Precio: ${best_product['price']} por {best_product['unit']}\n- Stock: {best_product.get('stock', 0)}\n\n"
    if best_regulation:
        context += f"Regulación Ambiental Peruana Relevante:\n- Título: {best_regulation['title']}\n- Nombre: {best_regulation['name']}\n- Resumen: {best_regulation['summary']}\n- Extracto: {best_regulation['snippet']}\n\n"

    system_prompt = (
        "Eres SofiA, el asistente virtual experto en economía circular y gestión de neumáticos fuera de uso (NFU) de la plataforma RevoLink.\n"
        "Debes responder de manera profesional, clara y concisa en español, utilizando formato markdown.\n"
        "Bajo ninguna circunstancia inventes información técnica o de precios. Si no encuentras la información en el contexto provisto, indícalo educadamente.\n"
        "Si el usuario pregunta sobre cómo comprar, cotizar o descargar certificados, incluye una indicación clara en tu respuesta de que hay un botón disponible.\n"
        "Usa etiquetas HTML fuertes (strong) para destacar términos clave de manera estética."
    )

    prompt = f"Contexto:\n{context}\n\nPregunta del usuario:\n{query}\n\nRespuesta de SofiA:"

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt
            )
        )
        text = response.text.strip()
        
        # Post-process response to extract/determine actionButton and lawSnippet
        action = None
        query_lower = query.lower()
        if "certificado" in query_lower or "descargar" in query_lower:
            action = {
                "label": "Descargar Certificado PDF",
                "icon": "download",
                "actionType": "download_certificate"
            }
        elif best_product and any(kw in query_lower for kw in ["comprar", "cotizar", "precio", "cuesta", "cuanto", "cuánto"]):
            action = {
                "label": f"Cotizar {best_product['name']}",
                "icon": "shopping-cart",
                "actionType": f"quote_product_{best_product['id']}"
            }

        law_snippet = None
        if best_regulation:
            law_snippet = {
                "title": best_regulation["title"],
                "text": best_regulation["snippet"]
            }

        return text, law_snippet, action
    except Exception as e:
        print(f"Error in Gemini response generation: {e}. Falling back to local generation.")
        return generate_local_response(query, best_product, best_regulation)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    query = data.get("message", "").strip()
    
    if not query:
        return jsonify({"error": "Message is required"}), 400

    products = fetch_products()
    best_product, best_regulation = retrieve_context(query, products)

    if client:
        content, law_snippet, action_button = generate_gemini_response(query, best_product, best_regulation)
    else:
        content, law_snippet, action_button = generate_local_response(query, best_product, best_regulation)

    response_data = {
        "content": content,
        "lawSnippet": law_snippet,
        "actionButton": action_button
    }
    return jsonify(response_data)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "mode": "gemini" if client else "local"})

@app.route("/api/opportunities", methods=["GET"])
def get_opportunities():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, "data", "seace_opportunities.json")
        if os.path.exists(json_path):
            import json
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/scrape", methods=["POST"])
def trigger_scrape():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Import and execute the scraper script
        import seace_scraper
        seace_scraper.main()
        
        # Read the fresh json
        json_path = os.path.join(current_dir, "data", "seace_opportunities.json")
        if os.path.exists(json_path):
            import json
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify({"success": True, "opportunities": data})
        return jsonify({"success": False, "error": "Scraping failed to create output"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/corporate-quotes", methods=["GET"])
def get_corporate_quotes():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, "data", "corporate_quotes.json")
        if os.path.exists(json_path):
            import json
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/corporate-quotes", methods=["POST"])
def add_corporate_quote():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, "data", "corporate_quotes.json")
        
        import json
        quotes = []
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                quotes = json.load(f)
                
        new_quote = request.json or {}
        quotes.insert(0, new_quote)
        
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(quotes, f, indent=2, ensure_ascii=False)
            
        return jsonify({"success": True, "quotes": quotes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/corporate-quotes/update", methods=["POST"])
def update_corporate_quote():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, "data", "corporate_quotes.json")
        
        data = request.json or {}
        quote_id = data.get("id")
        new_status = data.get("estado")
        
        import json
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                quotes = json.load(f)
                
            for q in quotes:
                if q["id"] == quote_id:
                    q["estado"] = new_status
                    break
                    
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(quotes, f, indent=2, ensure_ascii=False)
                
            return jsonify({"success": True, "quotes": quotes}), 200
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
