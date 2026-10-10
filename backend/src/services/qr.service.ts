import QRCode from 'qrcode';

export class QrService {
  /**
   * Demirbaş etiketi (assetTag) için yüksek kaliteli Base64 DataURL formatında QR kod üretir.
   * @param assetTag Demirbaş benzersiz kodu (örn: TOGU-2026-001)
   */
  static async generateQrDataUrl(assetTag: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(assetTag, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#1e3a8a', // TOGU Kurumsal Mavi
          light: '#ffffff',
        },
      });
      return dataUrl;
    } catch (error) {
      console.error('QR Kod üretim hatası:', error);
      throw new Error('QR kod üretimi başarısız oldu.');
    }
  }

  /**
   * SVG formatında QR Kod üretir (yazdırma / vektörel gereksinimler için).
   */
  static async generateQrSvg(assetTag: string): Promise<string> {
    try {
      const svg = await QRCode.toString(assetTag, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
      });
      return svg;
    } catch (error) {
      console.error('QR SVG üretim hatası:', error);
      throw new Error('QR SVG üretimi başarısız oldu.');
    }
  }
}
