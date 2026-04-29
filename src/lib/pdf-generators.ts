import jsPDF from 'jspdf';

export interface ReceiptData {
  receiptNo: string;
  instituteName: string;
  instituteAddress: string;
  institutePhone: string;
  instituteEmail: string;
  logoUrl?: string;
  studentName: string;
  parentName: string;
  mobile: string;
  packageName: string;
  amount: number;
  paidDate: string; // YYYY-MM-DD
  paymentMethod?: string;
  monthLabel?: string;
  isSummerCamp?: boolean;
}

const tryLoadImage = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

// Brand palette — minimal, premium
const BRAND = {
  primary: [37, 99, 235] as [number, number, number],   // blue
  ink: [17, 24, 39] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  line: [229, 231, 235] as [number, number, number],
  paid: [34, 197, 94] as [number, number, number],
  gold: [184, 134, 11] as [number, number, number],
  cream: [253, 250, 244] as [number, number, number],
};

// Draw a faint centered watermark logo
function drawWatermark(doc: jsPDF, img: HTMLImageElement | null, size = 320) {
  if (!img) return;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const x = (pageW - size) / 2;
  const y = (pageH - size) / 2;
  // jsPDF supports GState for opacity
  // @ts-ignore
  const GState = (doc as any).GState;
  if (GState) {
    // @ts-ignore
    doc.setGState(new GState({ opacity: 0.06 }));
    try { doc.addImage(img, 'PNG', x, y, size, size); } catch {}
    // @ts-ignore
    doc.setGState(new GState({ opacity: 1 }));
  } else {
    try { doc.addImage(img, 'PNG', x, y, size, size); } catch {}
  }
}

export async function generateReceiptPdf(data: ReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;

  // Soft white background (default). Add subtle top accent bar (thin) for branding.
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 6, 'F');

  // Watermark
  const logoImg = data.logoUrl ? await tryLoadImage(data.logoUrl) : null;
  drawWatermark(doc, logoImg, 320);

  // Header — logo aligned left, institute info beside it
  let headerY = margin;
  if (logoImg) {
    // Maintain aspect ratio, max 56pt on the longest side
    const maxSide = 56;
    const ratio = logoImg.width / logoImg.height;
    const w = ratio >= 1 ? maxSide : maxSide * ratio;
    const h = ratio >= 1 ? maxSide / ratio : maxSide;
    try { doc.addImage(logoImg, 'PNG', margin, headerY, w, h); } catch {}
  }

  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(data.instituteName, margin + 70, headerY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(data.instituteAddress, margin + 70, headerY + 32, { maxWidth: pageW - margin - 90 });
  doc.text(`${data.institutePhone}  •  ${data.instituteEmail}`, margin + 70, headerY + 46);

  // Divider
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.6);
  doc.line(margin, headerY + 66, pageW - margin, headerY + 66);

  // Title row
  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FEE RECEIPT', margin, headerY + 92);

  // Receipt no + date right-aligned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Receipt No`, pageW - margin, headerY + 84, { align: 'right' });
  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.text(data.receiptNo, pageW - margin, headerY + 98, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.muted);
  doc.text(`Date: ${data.paidDate}`, pageW - margin, headerY + 112, { align: 'right' });

  // Student details section
  let y = headerY + 138;
  doc.setTextColor(...BRAND.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STUDENT DETAILS', margin, y);
  doc.setDrawColor(...BRAND.line);
  doc.line(margin, y + 4, pageW - margin, y + 4);

  const drawRow = (label: string, value: string, rowY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(label, margin, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.ink);
    doc.setFontSize(10.5);
    doc.text(value, margin + 130, rowY);
  };

  y += 22;
  drawRow('Student Name', data.studentName, y);
  y += 18;
  drawRow('Parent Name', data.parentName || '—', y);
  y += 18;
  drawRow('Mobile', data.mobile, y);

  // Payment details section
  y += 36;
  doc.setTextColor(...BRAND.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PAYMENT DETAILS', margin, y);
  doc.setDrawColor(...BRAND.line);
  doc.line(margin, y + 4, pageW - margin, y + 4);

  y += 22;
  drawRow('Package', data.packageName, y);
  y += 18;
  if (data.monthLabel) {
    drawRow('Month', data.monthLabel, y);
  } else if (data.isSummerCamp) {
    drawRow('Type', 'One-time (Summer Camp)', y);
  } else {
    drawRow('Type', 'One-time', y);
  }
  y += 18;
  drawRow('Payment Method', (data.paymentMethod || 'cash').toUpperCase(), y);

  // Amount paid — highlighted box
  y += 32;
  doc.setFillColor(245, 247, 251);
  doc.setDrawColor(...BRAND.line);
  doc.roundedRect(margin, y, pageW - margin * 2, 56, 6, 6, 'FD');
  doc.setTextColor(...BRAND.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Amount Paid', margin + 16, y + 22);
  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, margin + 16, y + 44);

  // Minimal PAID stamp on the right of the amount box
  const stampX = pageW - margin - 96;
  const stampY = y + 12;
  doc.setDrawColor(...BRAND.paid);
  doc.setLineWidth(1.4);
  doc.roundedRect(stampX, stampY, 80, 32, 4, 4, 'S');
  doc.setTextColor(...BRAND.paid);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PAID', stampX + 40, stampY + 21, { align: 'center' });

  // Footer
  doc.setTextColor(...BRAND.muted);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text(
    'This is a system-generated receipt. Thank you for your payment.',
    pageW / 2,
    pageH - 36,
    { align: 'center' },
  );
  doc.setFont('helvetica', 'normal');
  doc.text(data.instituteName, pageW / 2, pageH - 22, { align: 'center' });

  return doc;
}

export interface CertificateData {
  studentName: string;
  instituteName: string;
  logoUrl?: string;
  date: string;
  signatoryName?: string;
  signatoryRole?: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Off-white background
  doc.setFillColor(...BRAND.cream);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Watermark (centered, very faint)
  const logoImg = data.logoUrl ? await tryLoadImage(data.logoUrl) : null;
  drawWatermark(doc, logoImg, 360);

  // Outer thin gold border
  doc.setDrawColor(...BRAND.gold);
  doc.setLineWidth(3);
  doc.rect(24, 24, pageW - 48, pageH - 48);

  // Inner hairline border
  doc.setLineWidth(0.6);
  doc.rect(36, 36, pageW - 72, pageH - 72);

  // Small logo at top center
  if (logoImg) {
    const maxSide = 54;
    const ratio = logoImg.width / logoImg.height;
    const w = ratio >= 1 ? maxSide : maxSide * ratio;
    const h = ratio >= 1 ? maxSide / ratio : maxSide;
    try { doc.addImage(logoImg, 'PNG', (pageW - w) / 2, 56, w, h); } catch {}
  }

  // Institute name
  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(data.instituteName, pageW / 2, 132, { align: 'center' });

  // Heading — prominent
  doc.setTextColor(...BRAND.gold);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(46);
  doc.text('Certificate of Completion', pageW / 2, 200, { align: 'center' });

  // Decorative double line
  doc.setDrawColor(...BRAND.gold);
  doc.setLineWidth(1.2);
  doc.line(pageW / 2 - 150, 218, pageW / 2 + 150, 218);
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - 130, 224, pageW / 2 + 130, 224);

  // Body
  doc.setTextColor(...BRAND.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('This certificate is proudly presented to', pageW / 2, 268, { align: 'center' });

  // Student name
  doc.setTextColor(...BRAND.ink);
  doc.setFont('times', 'bold');
  doc.setFontSize(34);
  doc.text(data.studentName, pageW / 2, 318, { align: 'center' });

  // Underline under name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(...BRAND.gold);
  doc.setLineWidth(0.8);
  doc.line(pageW / 2 - nameWidth / 2 - 24, 328, pageW / 2 + nameWidth / 2 + 24, 328);

  // Description
  doc.setTextColor(...BRAND.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12.5);
  doc.text(
    `for successfully completing the Summer Camp Program at ${data.instituteName}.`,
    pageW / 2,
    362,
    { align: 'center', maxWidth: pageW - 180 },
  );
  doc.setFontSize(11);
  doc.text(
    'In recognition of dedication, enthusiasm, and creative spirit shown throughout the program.',
    pageW / 2,
    384,
    { align: 'center', maxWidth: pageW - 180 },
  );

  // Date and Signature blocks
  doc.setTextColor(...BRAND.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  // Date (left)
  doc.text(data.date, 240, pageH - 90);
  doc.setDrawColor(160);
  doc.setLineWidth(0.6);
  doc.line(220, pageH - 80, 380, pageH - 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  doc.text('Date', 300, pageH - 66, { align: 'center' });

  // Signature (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);
  doc.text(data.signatoryName || 'Authorized Signatory', pageW - 300, pageH - 90, { align: 'center' });
  doc.line(pageW - 380, pageH - 80, pageW - 220, pageH - 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(data.signatoryRole || 'Director', pageW - 300, pageH - 66, { align: 'center' });

  return doc;
}
