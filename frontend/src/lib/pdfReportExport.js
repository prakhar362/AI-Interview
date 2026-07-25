import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the report to a multi-page PDF.
 *
 * Approach:
 * - Looks for .pdf-page elements inside the container (A4 page divs from ReportSummary)
 * - If none found, falls back to capturing the whole container as one page
 * - Temporarily removes overflow constraints so html2canvas can see the full content
 */
export async function exportReportToPDF(elementId, candidateName = 'Candidate') {
  const container = document.getElementById(elementId);
  if (!container) {
    alert('Report not found. Please wait for the page to fully load and try again.');
    return;
  }

  // Collect pages — use .pdf-page divs if available, otherwise the whole container
  const pages = Array.from(container.querySelectorAll('.pdf-page'));
  const targets = pages.length > 0 ? pages : [container];

  // Temporarily unlock overflow on all ancestor elements so html2canvas
  // can capture content that may be clipped by overflow-x-auto/hidden
  const overflowPatch = [];
  let el = container;
  while (el && el !== document.body) {
    const computed = window.getComputedStyle(el);
    if (computed.overflow !== 'visible' || computed.overflowX !== 'visible') {
      overflowPatch.push({ el, overflow: el.style.overflow, overflowX: el.style.overflowX });
      el.style.overflow  = 'visible';
      el.style.overflowX = 'visible';
    }
    el = el.parentElement;
  }

  try {
    const pdf      = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm

    for (let i = 0; i < targets.length; i++) {
      const pageEl = targets[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Ensure the full element is captured regardless of viewport
        scrollX: 0,
        scrollY: 0,
        windowWidth:  pageEl.scrollWidth,
        windowHeight: pageEl.scrollHeight,
      });

      const imgData  = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    const date = new Date().toISOString().split('T')[0];
    pdf.save(`AI_Interview_Report_${candidateName.replace(/\s+/g, '_')}_${date}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('PDF generation failed. Please try again.');
  } finally {
    // Always restore overflow styles
    overflowPatch.forEach(({ el: e, overflow, overflowX }) => {
      e.style.overflow  = overflow;
      e.style.overflowX = overflowX;
    });
  }
}
