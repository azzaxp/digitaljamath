"""
Receipt PDF Generator for DigitalJamath.

Generates professional payment receipts with:
- Organization details
- 80G registration info (for tax exemption)
- Donor/Member details
- Payment breakdown
"""
import io
from decimal import Decimal
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


def generate_receipt_pdf(
    receipt_number: str,
    payment_date: datetime,
    donor_name: str,
    donor_address: str = "",
    donor_pan: str = "",
    amount: Decimal = Decimal("0"),
    membership_portion: Decimal = Decimal("0"),
    donation_portion: Decimal = Decimal("0"),
    payment_mode: str = "Online",
    org_name: str = "Digital Jamath",
    org_address: str = "",
    org_pan: str = "",
    reg_80g: str = "",
    masjid_name: str = "",
) -> bytes:
    """
    Generate a PDF receipt and return as bytes.
    
    Returns:
        PDF content as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        leftMargin=1.5*cm,
        rightMargin=1.5*cm,
        topMargin=1*cm,
        bottomMargin=1*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor('#1a5f7a')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=colors.HexColor('#333333')
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4
    )
    
    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey
    )
    
    elements = []
    
    # Header - Organization Name
    display_name = masjid_name or org_name
    elements.append(Paragraph(f"<b>{display_name}</b>", title_style))
    
    if org_address:
        elements.append(Paragraph(org_address, ParagraphStyle('Address', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER)))
    
    elements.append(Spacer(1, 6*mm))
    
    # Receipt Title
    elements.append(Paragraph("<b>OFFICIAL RECEIPT</b>", heading_style))
    
    # Receipt details box
    receipt_data = [
        ['Receipt No:', receipt_number, 'Date:', payment_date.strftime('%d-%b-%Y')],
    ]
    
    receipt_table = Table(receipt_data, colWidths=[3*cm, 5*cm, 2*cm, 4*cm])
    receipt_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('ALIGN', (3, 0), (3, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(receipt_table)
    elements.append(Spacer(1, 8*mm))
    
    # Donor Details
    elements.append(Paragraph("<b>Received From:</b>", normal_style))
    donor_info = [
        ['Name:', donor_name],
    ]
    if donor_address:
        donor_info.append(['Address:', donor_address])
    if donor_pan:
        donor_info.append(['PAN:', donor_pan])
    
    donor_table = Table(donor_info, colWidths=[3*cm, 12*cm])
    donor_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(donor_table)
    elements.append(Spacer(1, 8*mm))
    
    # Payment Details
    elements.append(Paragraph("<b>Payment Details:</b>", normal_style))
    
    payment_data = [
        ['Description', 'Amount (₹)'],
    ]
    
    if membership_portion > 0:
        payment_data.append(['Membership Contribution', f'{membership_portion:,.2f}'])
    
    if donation_portion > 0:
        payment_data.append(['Donation (Sadaqah)', f'{donation_portion:,.2f}'])
    
    if membership_portion == 0 and donation_portion == 0:
        payment_data.append(['Contribution', f'{amount:,.2f}'])
    
    payment_data.append(['', ''])
    payment_data.append(['Total', f'{amount:,.2f}'])
    
    payment_table = Table(payment_data, colWidths=[10*cm, 4*cm])
    payment_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0f0f0')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8f5e9')),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 4*mm))
    
    # Payment Mode
    elements.append(Paragraph(f"<b>Payment Mode:</b> {payment_mode}", normal_style))
    elements.append(Spacer(1, 10*mm))
    
    # Amount in words (simple version)
    amount_int = int(amount)
    elements.append(Paragraph(f"<b>Amount in Words:</b> Rupees {amount_int:,} Only", normal_style))
    elements.append(Spacer(1, 15*mm))
    
    # 80G Section (if applicable)
    if reg_80g:
        elements.append(Paragraph("<b>Tax Exemption Details (Section 80G)</b>", normal_style))
        tax_info = [
            ['Organization PAN:', org_pan or 'N/A'],
            ['80G Registration No:', reg_80g],
        ]
        tax_table = Table(tax_info, colWidths=[5*cm, 10*cm])
        tax_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fff8e1')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#ffc107')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(tax_table)
        elements.append(Spacer(1, 10*mm))
    
    # Signature area
    sig_data = [
        ['', ''],
        ['', '_____________________'],
        ['', 'Authorized Signatory'],
    ]
    sig_table = Table(sig_data, colWidths=[10*cm, 5*cm])
    sig_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
    ]))
    elements.append(sig_table)
    
    # Footer
    elements.append(Spacer(1, 15*mm))
    elements.append(Paragraph("This is a computer-generated receipt.", small_style))
    elements.append(Paragraph("Thank you for your contribution. Jazakallah Khair.", small_style))
    
    # Build PDF
    doc.build(elements)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def generate_receipt_number(household_id: int, payment_date: datetime) -> str:
    """Generate a unique receipt number."""
    date_part = payment_date.strftime('%Y%m%d')
    return f"RCP-{date_part}-{household_id:04d}"
