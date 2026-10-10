import QRCode from 'qrcode';
import { prisma } from '../prisma';

export const generateQrDataUrl = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('QR Kod üretim hatası:', error);
    throw error;
  }
};

export const generateNextAssetTag = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.asset.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  
  let candidateTag = `AST-${currentYear}-${nextNum}`;
  
  // Çakışma kontrolü
  let exists = await prisma.asset.findUnique({ where: { assetTag: candidateTag } });
  let offset = 1;
  while (exists) {
    const adjustedNum = (count + 1 + offset).toString().padStart(4, '0');
    candidateTag = `AST-${currentYear}-${adjustedNum}`;
    exists = await prisma.asset.findUnique({ where: { assetTag: candidateTag } });
    offset++;
  }

  return candidateTag;
};
