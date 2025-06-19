import { helper } from '@ember/component/helper';

export default helper(function generateQr([url]) {
  if (!url) return '';

  // Using a QR code API service
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return qrApiUrl;
});
