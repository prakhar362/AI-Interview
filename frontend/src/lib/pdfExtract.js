import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to unpkg/cdnjs CDN matching pdfjs version for clean client-side parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tokenized = await page.getTextContent();
      const pageText = tokenized.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('pdfjs-dist text extraction error:', error);
    throw new Error('Failed to parse PDF document. Please check file format.');
  }
}
