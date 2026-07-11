import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    # Define folder and file path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, 'data')
    
    # Create the directory if it doesn't exist
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created directory: {data_dir}")

    pdf_path = os.path.join(data_dir, 'regulations.pdf')
    
    # Setup document
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        spaceAfter=15
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'SectionBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        spaceAfter=10
    )

    story = []
    
    # Title
    story.append(Paragraph("RevoLink: Base de Conocimiento - Normas Ambientales Peruanas", title_style))
    story.append(Spacer(1, 10))
    
    # Introduction
    story.append(Paragraph(
        "Este documento contiene las principales regulaciones ambientales vigentes en el Perú "
        "con respecto a la valorización de residuos sólidos y neumáticos fuera de uso (NFU), que "
        "sirve como base de conocimiento oficial para el asistente inteligente Terra AI.",
        body_style
    ))
    story.append(Spacer(1, 10))
    
    # Section 1: D.S. 024-2021-MINAM
    story.append(Paragraph("1. D.S. 024-2021-MINAM - Régimen Especial de Gestión de Neumáticos Fuera de Uso (NFU)", heading_style))
    story.append(Paragraph(
        "**Descripción General:** Esta norma establece la obligatoriedad para productores e importadores "
        "de neumáticos de garantizar la recolección, transporte y valorización de los neumáticos fuera de uso (NFU) "
        "en porcentajes anuales crecientes. Promueve la valorización material (como asfalto modificado, mulch, pisos deportivos) "
        "y energética.",
        body_style
    ))
    story.append(Paragraph(
        "**Extracto de Ley:** Los productores de neumáticos están obligados a garantizar la recolección y "
        "valorización de los NFU en los porcentajes anuales establecidos. El uso de material granulado reciclado en "
        "procesos productivos es reconocido como valorización material.",
        body_style
    ))
    
    # Section 2: D.L. 1278
    story.append(Paragraph("2. D.L. 1278 - Ley de Gestión Integral de Residuos Sólidos", heading_style))
    story.append(Paragraph(
        "**Descripción General:** Establece derechos, obligaciones y atribuciones para la gestión integral de "
        "residuos sólidos en el Perú, priorizando la minimización en la fuente, la valorización material y energética "
        "frente a la disposición final. Fomenta la transición hacia una economía circular.",
        body_style
    ))
    story.append(Paragraph(
        "**Extracto de Ley:** La gestión de residuos sólidos en el Perú prioriza la valorización de los mismos "
        "(reutilización, reciclaje, compostaje, recuperación energética) sobre su disposición final, fomentando "
        "la economía circular y la inversión privada.",
        body_style
    ))

    # Section 3: Ecoetiquetado y Compras Verdes
    story.append(Paragraph("3. Ecoetiquetado y Compras Verdes - Lineamientos de Ecoeficiencia del Sector Público", heading_style))
    story.append(Paragraph(
        "**Descripción General:** Establece incentivos y criterios de sostenibilidad para compras públicas y "
        "privadas, promoviendo el uso de insumos reciclados o de bajo impacto ambiental.",
        body_style
    ))
    story.append(Paragraph(
        "**Extracto de Ley:** Las empresas que incorporen materiales de caucho reciclado u otros insumos "
        "provenientes de procesos de economía circular obtienen puntajes adicionales en licitaciones del Estado "
        "y auditorías de certificación verde.",
        body_style
    ))

    # Build PDF
    doc.build(story)
    print(f"Generated PDF successfully at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
