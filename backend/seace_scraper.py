import os
import json
import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# 20 highly realistic road paving and industrial circular economy opportunities in Peru
MOCK_OPPORTUNITIES = [
    {
        "id": 1,
        "entidad": "Municipalidad Metropolitana de Lima",
        "objeto": "Adquisición de mezcla asfáltica modificada con caucho granulado para mantenimiento vial de la Av. Javier Prado",
        "monto": 345000.00,
        "fecha_publicacion": "2026-07-10",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 2,
        "entidad": "Gobierno Regional de Piura",
        "objeto": "Ejecución de la obra: Mejoramiento del servicio de transitabilidad vial interurbana en la provincia de Talara usando polímeros reciclados",
        "monto": 1250000.00,
        "fecha_publicacion": "2026-07-09",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 8,
        "viabilidad": "Alta"
    },
    {
        "id": 3,
        "entidad": "Ministerio de Transportes y Comunicaciones (MTC)",
        "objeto": "Servicio de mantenimiento periódico de la Carretera Panamericana Norte tramo Chiclayo - Piura con aditivos elastómeros (NFU)",
        "monto": 5800000.00,
        "fecha_publicacion": "2026-07-11",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 15,
        "viabilidad": "Alta"
    },
    {
        "id": 4,
        "entidad": "Municipalidad Distrital de Miraflores",
        "objeto": "Instalación de pisos amortiguantes de caucho reciclado en parques infantiles del distrito",
        "monto": 85000.00,
        "fecha_publicacion": "2026-07-08",
        "estado": "Adjudicado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 5,
        "viabilidad": "Media"
    },
    {
        "id": 5,
        "entidad": "SIDERPERU S.A.",
        "objeto": "Suministro continuo de acero siderúrgico recuperado de llantas para procesos de fundición y aleación estructural",
        "monto": 420000.00,
        "fecha_publicacion": "2026-07-07",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 6,
        "entidad": "Municipalidad Provincial de Arequipa",
        "objeto": "Adquisición de asfalto ecológico con incorporación de polvo de caucho de llantas fuera de uso para vías metropolitanas",
        "monto": 670000.00,
        "fecha_publicacion": "2026-07-06",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 12,
        "viabilidad": "Alta"
    },
    {
        "id": 7,
        "entidad": "Cálidda - Gas Natural de Lima y Callao",
        "objeto": "Servicio de pavimentación de zanjas en calzadas con mezcla asfáltica en frío usando ligante de asfalto caucho",
        "monto": 180000.00,
        "fecha_publicacion": "2026-07-05",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 7,
        "viabilidad": "Alta"
    },
    {
        "id": 8,
        "entidad": "Municipalidad Distrital de San Isidro",
        "objeto": "Renovación de ciclovías del distrito incorporando aditivo elástico de caucho reciclado para reducción de ruido y mejor tracción",
        "monto": 250000.00,
        "fecha_publicacion": "2026-07-04",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 9,
        "entidad": "Ladrillera Rex S.A.",
        "objeto": "Adquisición de combustible pirolítico alternativo de alta densidad energética para horno de cocción continuo",
        "monto": 150000.00,
        "fecha_publicacion": "2026-07-03",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 8,
        "viabilidad": "Alta"
    },
    {
        "id": 10,
        "entidad": "UNACEM - Unión Andina de Cementos",
        "objeto": "Suministro de aceite pirolítico derivado de llantas para co-procesamiento en hornos de cemento clinker",
        "monto": 980000.00,
        "fecha_publicacion": "2026-07-02",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 12,
        "viabilidad": "Alta"
    },
    {
        "id": 11,
        "entidad": "Municipalidad Provincial del Cusco",
        "objeto": "Adquisición de baldosas de caucho reciclado para el mejoramiento de áreas recreativas en el Centro Histórico",
        "monto": 95000.00,
        "fecha_publicacion": "2026-07-01",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 6,
        "viabilidad": "Media"
    },
    {
        "id": 12,
        "entidad": "Gobierno Regional de La Libertad",
        "objeto": "Mantenimiento rutinario de la Carretera de Penetración a la Sierra Liberteña usando mezcla asfáltica elastomérica",
        "monto": 2300000.00,
        "fecha_publicacion": "2026-06-30",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 13,
        "entidad": "Municipalidad Provincial de Trujillo",
        "objeto": "Parchado y recapeo de pavimentos urbanos dañados con asfalto modificado con polímero NFU",
        "monto": 410000.00,
        "fecha_publicacion": "2026-06-29",
        "estado": "Adjudicado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 14,
        "entidad": "Aceros Arequipa S.A.",
        "objeto": "Compra de alambre de acero reciclado derivado de NFU para fundición y refuerzo de perfiles",
        "monto": 550000.00,
        "fecha_publicacion": "2026-06-28",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 8,
        "viabilidad": "Alta"
    },
    {
        "id": 15,
        "entidad": "Municipalidad de San Borja",
        "objeto": "Implementación de pistas deportivas de grass sintético sobre base elástica de caucho granulado fino",
        "monto": 175000.00,
        "fecha_publicacion": "2026-06-27",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 7,
        "viabilidad": "Media"
    },
    {
        "id": 16,
        "entidad": "Gobierno Regional del Callao",
        "objeto": "Pavimentación y bacheo en la Av. Néstor Gambetta utilizando mezclas asfálticas de alta durabilidad con caucho",
        "monto": 1450000.00,
        "fecha_publicacion": "2026-06-26",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 12,
        "viabilidad": "Alta"
    },
    {
        "id": 17,
        "entidad": "Industrias del Envase S.A.C.",
        "objeto": "Suministro de negro de humo recuperado (rCB) para aditivo colorante negro de alta densidad de inyección plástica",
        "monto": 120000.00,
        "fecha_publicacion": "2026-06-25",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 8,
        "viabilidad": "Alta"
    },
    {
        "id": 18,
        "entidad": "Municipalidad Provincial de Chiclayo",
        "objeto": "Adquisición de emulsión asfáltica modificada con caucho para recapeo de pavimentos rígidos y flexibles",
        "monto": 310000.00,
        "fecha_publicacion": "2026-06-24",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 19,
        "entidad": "Cementos Pacasmayo S.A.A.",
        "objeto": "Suministro continuo de aceite pirolítico de llantas trituradas como combustible de apoyo en hornos de clínker",
        "monto": 720000.00,
        "fecha_publicacion": "2026-06-23",
        "estado": "Convocado",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 10,
        "viabilidad": "Alta"
    },
    {
        "id": 20,
        "entidad": "Municipalidad de Santiago de Surco",
        "objeto": "Mantenimiento y mejoramiento de calzadas incorporando sello asfáltico con ligante asfalto-caucho",
        "monto": 220000.00,
        "fecha_publicacion": "2026-06-22",
        "estado": "Vigente",
        "enlace_seace": "https://prod2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorConvocatorias.xhtml",
        "puntaje_sostenible": 8,
        "viabilidad": "Alta"
    }
]

def main():
    print("Iniciando carga de oportunidades del SEACE...")
    
    # Cap the opportunities to 40 max to protect Supabase free tier limits
    capped_opportunities = MOCK_OPPORTUNITIES[:40]
    
    # Ensure directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)
    local_path = os.path.join(os.path.dirname(__file__), "data", "seace_opportunities.json")
    
    # Always save to local JSON file as a reliable source of truth
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(capped_opportunities, f, ensure_ascii=False, indent=2)
    print(f"Oportunidades guardadas exitosamente en local: {local_path}")

    # Try to push to Supabase if credentials are valid
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            print("Intentando conectar con Supabase...")
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Insert or update each opportunity
            for opp in capped_opportunities:
                # Check if it already exists
                res = supabase.table("seace_opportunities").select("id").eq("id", opp["id"]).execute()
                if res.data and len(res.data) > 0:
                    supabase.table("seace_opportunities").update(opp).eq("id", opp["id"]).execute()
                else:
                    supabase.table("seace_opportunities").insert(opp).execute()
            print("Oportunidades sincronizadas exitosamente con Supabase PostgreSQL.")
        except Exception as e:
            print(f"No se pudo sincronizar con Supabase (fallback activo a JSON local). Detalle: {e}")
    else:
        print("Credenciales de Supabase ausentes. Usando únicamente base de datos local JSON.")

if __name__ == "__main__":
    main()
