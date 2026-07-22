# -*- coding: utf-8 -*-
"""Genera el Manual de usuario del GeoVisor (PDF) con pantallazos y pasos."""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image,
    Table, TableStyle, ListFlowable, ListItem, PageBreak, KeepTogether,
)
from reportlab.platypus.flowables import HRFlowable

BASE = r"D:\AMAZONIA EMPRENDE\GeoAE"
IMG  = os.path.join(BASE, "manual", "img")
OUT  = os.path.join(BASE, "manual", "Manual_Usuario_GeoVisor.pdf")

TEAL   = colors.HexColor("#0d7377")
TEAL_D = colors.HexColor("#0a5c5f")
DARK   = colors.HexColor("#1f2937")
GREY   = colors.HexColor("#6b7280")
LINE   = colors.HexColor("#d1d5db")

PAGE_W, PAGE_H = letter
MARGIN = 0.85 * inch
CONTENT_W = PAGE_W - 2 * MARGIN

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                    fontSize=18, textColor=TEAL_D, spaceAfter=6, spaceBefore=2, leading=22)
INTRO = ParagraphStyle("Intro", parent=ss["BodyText"], fontName="Helvetica",
                       fontSize=11, textColor=DARK, leading=16, spaceAfter=10)
STEP = ParagraphStyle("Step", parent=ss["BodyText"], fontName="Helvetica",
                      fontSize=11, textColor=DARK, leading=16)
CAP = ParagraphStyle("Cap", parent=ss["BodyText"], fontName="Helvetica-Oblique",
                     fontSize=9, textColor=GREY, alignment=TA_CENTER, spaceBefore=5)
TIP = ParagraphStyle("Tip", parent=ss["BodyText"], fontName="Helvetica",
                     fontSize=10, textColor=TEAL_D, leading=15)

# Cover styles
COVER_T = ParagraphStyle("CoverT", parent=ss["Title"], fontName="Helvetica-Bold",
                         fontSize=34, textColor=TEAL_D, alignment=TA_CENTER, leading=40)
COVER_S = ParagraphStyle("CoverS", parent=ss["Title"], fontName="Helvetica",
                         fontSize=16, textColor=DARK, alignment=TA_CENTER, leading=22)
COVER_M = ParagraphStyle("CoverM", parent=ss["BodyText"], fontName="Helvetica",
                         fontSize=11, textColor=GREY, alignment=TA_CENTER, leading=16)


def framed_image(filename, max_w=CONTENT_W, max_h=4.5 * inch):
    path = os.path.join(IMG, filename)
    iw, ih = ImageReader(path).getSize()
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    img = Image(path, width=w, height=h)
    t = Table([[img]], colWidths=[w])
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.75, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    t.hAlign = "CENTER"
    return t


def steps(items):
    return ListFlowable(
        [ListItem(Paragraph(t, STEP), value=i + 1, leftIndent=6) for i, t in enumerate(items)],
        bulletType="1", bulletFontName="Helvetica-Bold", bulletColor=TEAL,
        leftIndent=20, bulletFormat="%s.", spaceBefore=2, spaceAfter=2,
    )


def section(num, title, intro, step_items, images, caption=None, tip=None):
    flow = [Paragraph(f"{num}. {title}", H1),
            HRFlowable(width="100%", thickness=1.2, color=TEAL, spaceBefore=2, spaceAfter=2),
            Spacer(1, 8)]
    if intro:
        flow.append(Paragraph(intro, INTRO))
    if step_items:
        flow.append(steps(step_items))
        flow.append(Spacer(1, 8))
    if tip:
        flow.append(Spacer(1, 2))
        flow.append(Paragraph(f"✅ <b>Tip:</b> {tip}", TIP))
        flow.append(Spacer(1, 8))
    for im in images:
        flow.append(framed_image(im))
        flow.append(Spacer(1, 4))
    if caption:
        flow.append(Paragraph(caption, CAP))
    return flow


# ── Header / footer ──────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # footer line + text
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 0.65 * inch, PAGE_W - MARGIN, 0.65 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(MARGIN, 0.5 * inch, "GeoVisor · Amazonia Emprende — Manual de usuario")
    canvas.drawRightString(PAGE_W - MARGIN, 0.5 * inch, "Pág. %d" % doc.page)
    canvas.restoreState()


def on_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TEAL_D)
    canvas.rect(0, PAGE_H - 0.32 * inch, PAGE_W, 0.32 * inch, fill=1, stroke=0)
    canvas.rect(0, 0, PAGE_W, 0.32 * inch, fill=1, stroke=0)
    canvas.restoreState()


# ── Documento ──────────────────────────────────────────────────────────────
doc = BaseDocTemplate(OUT, pagesize=letter,
                      leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=MARGIN, bottomMargin=0.95 * inch,
                      title="Manual de usuario - GeoVisor Amazonia Emprende",
                      author="Amazonia Emprende")
frame = Frame(MARGIN, 0.85 * inch, CONTENT_W, PAGE_H - MARGIN - 0.85 * inch, id="body")
cover_frame = Frame(MARGIN, MARGIN, CONTENT_W, PAGE_H - 2 * MARGIN, id="cover")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[cover_frame], onPage=on_cover),
    PageTemplate(id="body", frames=[frame], onPage=on_page),
])

story = []

# ── Portada ──────────────────────────────────────────────────────────────
logo = os.path.join(BASE, "public", "logo-ae.png")
story.append(Spacer(1, 1.4 * inch))
if os.path.exists(logo):
    lw, lh = ImageReader(logo).getSize()
    s = (1.5 * inch) / lw
    li = Image(logo, width=lw * s, height=lh * s)
    li.hAlign = "CENTER"
    story.append(li)
    story.append(Spacer(1, 0.4 * inch))
story.append(Paragraph("GeoVisor", COVER_T))
story.append(Paragraph("Amazonia Emprende", COVER_T))
story.append(Spacer(1, 0.25 * inch))
story.append(Paragraph("Manual de usuario", COVER_S))
story.append(Spacer(1, 0.12 * inch))
story.append(Paragraph("Guía rápida, paso a paso", COVER_M))
story.append(Spacer(1, 1.6 * inch))
story.append(Paragraph("Portal privado de aliados · acceso con usuario y contraseña", COVER_M))
story.append(PageBreak())

# A partir de aquí, plantilla "body"
story.append(NextPageNote := Spacer(0, 0))

# ── 1. Iniciar sesión ──────────────────────────────────────────────────────
story += section(
    1, "Iniciar sesión",
    "El GeoVisor es un portal privado: cada aliado ingresa con su propio usuario y contraseña. "
    "Al abrir el enlace verás la pantalla de bienvenida.",
    [
        "Abre el enlace del GeoVisor en tu navegador (Chrome, Edge o similar).",
        "Escribe tu <b>Usuario</b> y tu <b>Contraseña</b> en los campos correspondientes.",
        "Haz clic en el botón <b>INGRESAR</b>.",
        "Marca <b>Recuérdame</b> si quieres que el navegador recuerde tu usuario la próxima vez.",
    ],
    ["01-login.png"],
    caption="Pantalla de inicio de sesión.",
    tip="La contraseña distingue mayúsculas y minúsculas. Usa el ícono del ojo para verla mientras la escribes.",
)
story.append(PageBreak())

# ── 2. La pantalla principal ────────────────────────────────────────────────
story += section(
    2, "Conoce la pantalla principal",
    "Después de ingresar verás el mapa y, a la izquierda, el menú con las secciones disponibles.",
    [
        "<b>Menú izquierdo:</b> abre las capas y secciones — Restauración, Conservación, Conectividad y Metas.",
        "<b>Mapa:</b> arrástralo para moverte; usa la rueda del ratón o los botones <b>+ / −</b> (abajo a la derecha) para acercar y alejar.",
        "<b>Mapa base:</b> el botón de capas (abajo a la derecha) cambia el fondo entre Satélite, Satélite con referencias y Mapa.",
        "<b>Tu sesión:</b> tu usuario aparece en la parte inferior del menú; desde ahí puedes cerrar sesión.",
    ],
    ["02-interfaz.png"],
    caption="Vista general: menú a la izquierda y mapa.",
)
story.append(PageBreak())

# ── 3. La guía de Ayuda ─────────────────────────────────────────────────────
story += section(
    3, "La guía de Ayuda (recorrido guiado)",
    "La primera vez que entras aparece un aviso que te ofrece un recorrido guiado. El recorrido "
    "oscurece la pantalla e ilumina cada control explicándote para qué sirve, paso a paso.",
    [
        "En el aviso <b>¿Te mostramos cómo funciona?</b> elige una opción: <b>Sí, ver la guía</b>, <b>Ahora no</b>, o <b>No volver a mostrar</b>.",
        "Si eliges <b>Sí</b>, ve avanzando con <b>Siguiente</b> / <b>Anterior</b> (o las flechas del teclado). Arriba ves el progreso (por ejemplo 4 / 9).",
        "Para salir en cualquier momento usa <b>Saltar guía</b> o la tecla <b>Esc</b>.",
        "Puedes volver a abrir el recorrido cuando quieras con el botón <b>Ayuda</b> del menú izquierdo.",
    ],
    ["03-aviso-ayuda.png", "04b-guia-metas.png"],
    caption="El aviso inicial (arriba) y un paso del recorrido iluminando el control “Metas”.",
)
story.append(PageBreak())

# ── 4. Demo / métricas ───────────────────────────────────────────────────────
story += section(
    4, "Consulta tu información (Demo y Métricas)",
    "En la sección <b>Metas</b> encontrarás el botón <b>Demo</b>, que abre la vista de tu proyecto: "
    "la imagen aérea del predio y un panel con tus cifras.",
    [
        "En el menú izquierdo entra en <b>Metas</b>.",
        "Haz clic en el botón <b>Demo</b>.",
        "A la derecha se abre el panel con tus métricas: árboles del predio, tu aporte y el porcentaje de participación.",
        "Usa las pestañas <b>Métricas</b>, <b>Monitoreo</b> y <b>Reportes</b> para cambiar de vista.",
    ],
    ["05-demo-metricas.png"],
    caption="Panel de métricas del aliado (ejemplo: Citibank — 3.000 árboles, 37,5 % de participación).",
    tip="Las cifras de esta vista son de demostración, salvo el dato propio del aliado.",
)
story.append(PageBreak())

# ── 5. Reportes ──────────────────────────────────────────────────────────────
story += section(
    5, "Descarga y visualiza tus reportes",
    "En el mismo panel, la pestaña <b>Reportes</b> reúne los documentos del proyecto para consultarlos o guardarlos.",
    [
        "Abre el panel del Demo (paso anterior) y entra en la pestaña <b>Reportes</b>.",
        "Pulsa <b>Visualizar</b> para abrir el informe en el navegador (se abre en una pestaña nueva, en PDF).",
        "Pulsa <b>Descargar</b> para guardar el documento original (Word) en tu equipo.",
    ],
    ["06-reportes.png"],
    caption="Pestaña Reportes con el informe disponible para visualizar o descargar.",
    tip="Los documentos mostrados son de ejemplo (demostración).",
)

doc.build(story)
print("PDF generado:", OUT)
print("tamaño:", os.path.getsize(OUT), "bytes")
