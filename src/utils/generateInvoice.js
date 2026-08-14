// Utility to generate a PDF printable CASIT Tax Invoice
export const generateInvoice = (order, userProfile) => {
  const invoiceNum = order.id || `CASIT-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = order.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const customerName = userProfile?.name || order.customerName || 'Valued Customer';
  const customerEmail = userProfile?.email || order.customerEmail || 'Customer Email';
  const customerPhone = userProfile?.phone || order.customerPhone || 'N/A';
  const customerAddress = userProfile?.address || order.shippingAddress || 'Standard Delivery Address';

  const invoiceWindow = window.open('', '_blank');
  
  const itemsHtml = (order.items || []).map((item, idx) => {
    const formatName = item.wantsPoster && item.wantsFrame ? 'Poster + Frame' : (item.wantsPoster ? 'Poster Print Only' : 'Frame Only');
    return `
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 12px; font-size: 13px; color: #111827; font-weight: 600;">
          ${idx + 1}. ${item.name}
          <div style="font-size: 11px; color: #6B7280; font-weight: normal; margin-top: 2px;">
            Format: ${formatName} | Size: ${item.size} ${item.frameStyle ? `| ${item.frameStyle}` : ''}
          </div>
        </td>
        <td style="padding: 12px; font-size: 13px; color: #374151; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; font-size: 13px; color: #374151; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; font-size: 13px; color: #111827; font-weight: bold; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `;
  }).join('');

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CASIT Invoice - ${invoiceNum}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111827; margin: 0; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #FFE600; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #000; }
        .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6B7280; font-weight: 700; margin-top: 2px; }
        .inv-badge { background: #FFFDF0; border: 1px solid #FFE600; color: #000; font-weight: 800; font-size: 14px; padding: 8px 16px; border-radius: 8px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; font-weight: 800; margin-bottom: 8px; }
        .info-text { font-size: 13px; line-height: 1.6; color: #374151; }
        .info-text strong { color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #F9FAFB; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4B5563; font-weight: 800; text-align: left; border-bottom: 1px solid #E5E7EB; }
        .total-box { width: 280px; margin-left: auto; background: #F9FAFB; padding: 16px; border-radius: 12px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4B5563; }
        .total-row.grand { font-size: 18px; font-weight: 900; color: #000; border-top: 2px solid #E5E7EB; padding-top: 10px; margin-top: 6px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 800px; margin: 0 auto 20px auto; text-align: right;">
        <button onclick="window.print()" style="background: #FFE600; color: #000; border: none; font-weight: bold; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="invoice-box">
        <div class="header">
          <div>
            <h1 class="logo-title">CASIT</h1>
            <div class="tagline">Elevate Your Walls • Premium Wall Art</div>
          </div>
          <div class="inv-badge">TAX INVOICE</div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Billed To</div>
            <div class="info-text">
              <strong>${customerName}</strong><br />
              Email: ${customerEmail}<br />
              Phone: ${customerPhone}<br />
              Address: ${customerAddress}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="section-title">Invoice Details</div>
            <div class="info-text">
              Invoice #: <strong>${invoiceNum}</strong><br />
              Date: <strong>${orderDate}</strong><br />
              Payment Status: <strong style="color: #059669;">PAID / SUCCESSFUL</strong><br />
              Seller: <strong>CASIT Official Store</strong> (casithelpline@gmail.com)
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Item & Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${order.totalAmount}</span>
          </div>
          <div class="total-row">
            <span>Delivery & Packaging</span>
            <span style="color: #059669; font-weight: bold;">FREE</span>
          </div>
          <div class="total-row grand">
            <span>Total Amount</span>
            <span>₹${order.totalAmount}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for choosing CASIT for your room decor! For helpline support, email us at <strong>casithelpline@gmail.com</strong>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  invoiceWindow.document.write(invoiceHtml);
  invoiceWindow.document.close();
};
