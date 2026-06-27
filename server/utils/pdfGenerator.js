import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const generatePDFAndHash = async (templateType, formData, isSigned = false, signatureData = null, buyerWallet = null) => {
  try {
    let htmalContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { text-align: center; color: #1a365d; }
          .contract-body { margin-top: 30px; line-height: 1.6; font-size: 16px; }
          .signature-section { margin-top: 50px; padding: 20px; border-top: 1px solid #ccc; }
          .highlight { font-weight: bold; color: #2b6cb0; }
        </style>
      </head>
      <body>
        <h1>${templateType} Contract</h1>
        <div class="contract-body">
          <p>This agreement is made between <span class="highlight">${formData.buyerName}</span> (Buyer) and <span class="highlight">${formData.sellerName}</span> (Seller).</p>
          <p>Details:</p>
          <ul>
            ${Object.entries(formData).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}
          </ul>
        </div>
        ${isSigned && signatureData ? `
        <div class="signature-section">
          <h3>Signatures:</h3>
          <p><strong>Buyer (${buyerWallet || formData.buyerWallet}):</strong> Completed upon creation.</p>
          <p><strong>Seller (${signatureData.sellerWallet}):</strong></p>
          <p>Signature: <span style="font-family: monospace; font-size: 12px; word-break: break-all; display: inline-block;">${signatureData.signature}</span></p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmalContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    
    // Save locally for prototype
    const dir = path.resolve('uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    
    const fileName = `${hash}.pdf`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { hash, pdfUrl: `/uploads/${fileName}` };

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
