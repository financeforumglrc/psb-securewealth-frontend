export interface AABank {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo?: string;
}

export const AA_BANKS: AABank[] = [
  { id: 'sbi', name: 'State Bank of India', shortName: 'SBI', color: '#1A4DB4' },
  { id: 'hdfc', name: 'HDFC Bank', shortName: 'HDFC', color: '#004C8F' },
  { id: 'icici', name: 'ICICI Bank', shortName: 'ICICI', color: '#C74634' },
  { id: 'axis', name: 'Axis Bank', shortName: 'AXIS', color: '#8A1C1C' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', shortName: 'KOTAK', color: '#ED1C24' },
  { id: 'pnb', name: 'Punjab National Bank', shortName: 'PNB', color: '#9B2335' },
];

export function getBankById(id: string): AABank | undefined {
  return AA_BANKS.find((b) => b.id === id);
}
