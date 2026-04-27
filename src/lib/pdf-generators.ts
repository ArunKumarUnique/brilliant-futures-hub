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
  monthLabel?: string; // e.g. "March 2026" or undefined for summer camp
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

export async function generateReceiptPdf(data: ReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(37, 99, 235); // primary blue
  doc.rect(0, 0, pageW, 90, 'F');

  // Logo
  if (data.logoUrl) {
    const img = await tryLoadImage(data.logoUrl);
    if (img) {
      try { doc.addImage(img, 'PNG', margin, 18, 54, 54); } catch {}
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(data.instituteName, margin + 70, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.instituteAddress, margin + 70, 58, { maxWidth: pageW - margin - 90 });
  doc.text(`Phone: ${data.institutePhone}  |  Email: ${data.instituteEmail}`, margin + 70, 78);

  // Title
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FEE RECEIPT', pageW / 2, 130, { align: 'center' });

  // Receipt info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${data.receiptNo}`, margin, 160);
  doc.text(`Date: ${data.paidDate}`, pageW - margin, 160, { align: 'right' });

  // Student details box
  let y = 190;
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageW - margin * 2, 100, 6, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Student Details', margin + 12, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Student Name: ${data.studentName}`, margin + 12, y + 44);
  doc.text(`Parent Name: ${data.parentName || '—'}`, margin + 12, y + 62);
  doc.text(`Mobile: ${data.mobile}`, margin + 12, y + 80);

  // Payment details box
  y += 120;
  doc.roundedRect(margin, y, pageW - margin * 2, 130, 6, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Payment Details', margin + 12, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Package: ${data.packageName}`, margin + 12, y + 44);
  if (data.monthLabel) {
    doc.text(`Month: ${data.monthLabel}`, margin + 12, y + 62);
  } else if (data.isSummerCamp) {
    doc.text(`Type: One-time (Summer Camp)`, margin + 12, y + 62);
  }
  doc.text(`Payment Method: ${(data.paymentMethod || 'cash').toUpperCase()}`, margin + 12, y + 80);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Amount Paid: ₹${data.amount.toLocaleString('en-IN')}`, margin + 12, y + 108);

  // PAID stamp
  doc.saveGraphicsState();
  doc.setTextColor(34, 197, 94);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2);
  const stampX = pageW - margin - 110;
  const stampY = y + 50;
  doc.roundedRect(stampX, stampY, 100, 50, 6, 6, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PAID', stampX + 50, stampY + 33, { align: 'center' });
  doc.restoreGraphicsState();

  // Footer
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(
    'This is a system-generated receipt. Thank you for your payment.',
    pageW / 2,
    doc.internal.pageSize.getHeight() - 40,
    { align: 'center' },
  );

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

  // Cream background
  doc.setFillColor(253, 250, 240);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Outer gold border
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(6);
  doc.rect(20, 20, pageW - 40, pageH - 40);

  // Inner thin border
  doc.setLineWidth(1);
  doc.rect(34, 34, pageW - 68, pageH - 68);

  // Top corner ribbons (decorative diamonds)
  doc.setFillColor(184, 134, 11);
  [[44, 44], [pageW - 56, 44], [44, pageH - 56], [pageW - 56, pageH - 56]].forEach(([x, y]) => {
    doc.triangle(x, y, x + 12, y, x, y + 12, 'F');
  });

  // Logo
  if (data.logoUrl) {
    const img = await tryLoadImage(data.logoUrl);
    if (img) {
      try { doc.addImage(img, 'PNG', pageW / 2 - 30, 60, 60, 60); } catch {}
    }
  }

  // Institute name
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(data.instituteName, pageW / 2, 140, { align: 'center' });

  // Big heading
  doc.setTextColor(184, 134, 11);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(40);
  doc.text('Certificate of Completion', pageW / 2, 200, { align: 'center' });

  // Decorative line
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(1.2);
  doc.line(pageW / 2 - 130, 215, pageW / 2 + 130, 215);

  // Body
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('This is to certify that', pageW / 2, 260, { align: 'center' });

  // Student name
  doc.setTextColor(17, 24, 39);
  doc.setFont('times', 'bold');
  doc.setFontSize(32);
  doc.text(data.studentName, pageW / 2, 305, { align: 'center' });

  // Underline under name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.8);
  doc.line(pageW / 2 - nameWidth / 2 - 20, 315, pageW / 2 + nameWidth / 2 + 20, 315);

  // Description
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text(
    `has successfully completed the Summer Camp Program at ${data.instituteName}.`,
    pageW / 2,
    350,
    { align: 'center', maxWidth: pageW - 160 },
  );
  doc.setFontSize(11);
  doc.text(
    'We appreciate the dedication, enthusiasm, and creativity shown throughout the program.',
    pageW / 2,
    372,
    { align: 'center', maxWidth: pageW - 160 },
  );

  // Gold badge (bottom-left)
  const badgeX = 130;
  const badgeY = pageH - 130;
  doc.setFillColor(184, 134, 11);
  doc.circle(badgeX, badgeY, 32, 'F');
  doc.setFillColor(253, 250, 240);
  doc.circle(badgeX, badgeY, 24, 'F');
  doc.setTextColor(184, 134, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SUMMER', badgeX, badgeY - 4, { align: 'center' });
  doc.text('CAMP', badgeX, badgeY + 8, { align: 'center' });
  // ribbon tails
  doc.setFillColor(184, 134, 11);
  doc.triangle(badgeX - 14, badgeY + 28, badgeX - 4, badgeY + 28, badgeX - 14, badgeY + 50, 'F');
  doc.triangle(badgeX + 14, badgeY + 28, badgeX + 4, badgeY + 28, badgeX + 14, badgeY + 50, 'F');

  // Date and Signature
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Date
  doc.text('Date', 260, pageH - 90);
  doc.setLineWidth(0.6);
  doc.setDrawColor(120);
  doc.line(260, pageH - 80, 380, pageH - 80);
  doc.setFont('helvetica', 'bold');
  doc.text(data.date, 260, pageH - 65);

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.text('Signature', pageW - 280, pageH - 90);
  doc.line(pageW - 280, pageH - 80, pageW - 160, pageH - 80);
  doc.setFont('helvetica', 'bold');
  doc.text(data.signatoryName || 'Authorized Signatory', pageW - 280, pageH - 65);
  if (data.signatoryRole) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(data.signatoryRole, pageW - 280, pageH - 52);
  }

  return doc;
}
