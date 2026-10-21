/**
 * Comprehensive Turkish Color Reference Catalog
 */

export interface ColorEntry {
  name: string;
  hex: string;
  category: 'ana' | 'ara' | 'ton' | 'doğal';
  synonyms?: string[];
}

export const TURKISH_COLORS_CATALOG: Record<string, ColorEntry> = {
  kırmızı: { name: 'Kırmızı', hex: '#EF4444', category: 'ana', synonyms: ['al', 'kızıl'] },
  al: { name: 'Al', hex: '#DC2626', category: 'ana', synonyms: ['kırmızı'] },
  kızıl: { name: 'Kızıl', hex: '#B91C1C', category: 'ton' },
  mavi: { name: 'Mavi', hex: '#3B82F6', category: 'ana', synonyms: ['gök'] },
  gök: { name: 'Gök Mavisi', hex: '#60A5FA', category: 'ton' },
  yeşil: { name: 'Yeşil', hex: '#10B981', category: 'ana' },
  sarı: { name: 'Sarı', hex: '#EAB308', category: 'ana' },
  mor: { name: 'Mor', hex: '#A855F7', category: 'ara' },
  turuncu: { name: 'Turuncu', hex: '#F97316', category: 'ara', synonyms: ['turunç'] },
  pembe: { name: 'Pembe', hex: '#EC4899', category: 'ara' },
  siyah: { name: 'Siyah', hex: '#18181B', category: 'ana', synonyms: ['kara'] },
  kara: { name: 'Kara', hex: '#09090B', category: 'ana', synonyms: ['siyah'] },
  beyaz: { name: 'Beyaz', hex: '#F8FAFC', category: 'ana', synonyms: ['ak'] },
  ak: { name: 'Ak', hex: '#F1F5F9', category: 'ana', synonyms: ['beyaz'] },
  gri: { name: 'Gri', hex: '#71717A', category: 'ara', synonyms: ['kül', 'boz'] },
  kahverengi: { name: 'Kahverengi', hex: '#78350F', category: 'ara', synonyms: ['kahve'] },
  lacivert: { name: 'Lacivert', hex: '#1E3A8A', category: 'ara' },
  turkuaz: { name: 'Turkuaz', hex: '#06B6D4', category: 'ara', synonyms: ['firuze'] },
  bordo: { name: 'Bordo', hex: '#881337', category: 'ton' },
  bej: { name: 'Bej', hex: '#D6C7A1', category: 'ton' },
  eflatun: { name: 'Eflatun', hex: '#9333EA', category: 'ara', synonyms: ['leylak', 'lila'] },
  haki: { name: 'Haki', hex: '#57534E', category: 'ton' },
  zümrüt: { name: 'Zümrüt Yeşili', hex: '#059669', category: 'doğal' },
  yakut: { name: 'Yakut Kırmızısı', hex: '#BE123C', category: 'doğal' },
  kehribar: { name: 'Kehribar', hex: '#D97706', category: 'doğal', synonyms: ['amber'] },
  amber: { name: 'Amber', hex: '#F59E0B', category: 'doğal' },
  somon: { name: 'Somon Rengi', hex: '#FB7185', category: 'ton' },
  hardal: { name: 'Hardal Sarısı', hex: '#CA8A04', category: 'ton' },
  vişne: { name: 'Vişne Çürüğü', hex: '#9F1239', category: 'ton' },
  leylak: { name: 'Leylak', hex: '#C084FC', category: 'ton' },
  lila: { name: 'Lila', hex: '#DDD6FE', category: 'ton' },
  füme: { name: 'Füme', hex: '#475569', category: 'ton' },
  fildişi: { name: 'Fildişi', hex: '#FEF3C7', category: 'ton' },
  safran: { name: 'Safran Sarısı', hex: '#F59E0B', category: 'ton' },
  taba: { name: 'Taba', hex: '#92400E', category: 'ton' },
  nefti: { name: 'Nefti Yeşil', hex: '#064E3B', category: 'ton' },
  mercan: { name: 'Mercan', hex: '#F43F5E', category: 'doğal' },
  kestane: { name: 'Kestane Rengi', hex: '#451A03', category: 'ton' },
  altın: { name: 'Altın Rengi', hex: '#EAB308', category: 'doğal', synonyms: ['yaldız'] },
  gümüş: { name: 'Gümüş Rengi', hex: '#94A3B8', category: 'doğal' },
  bronz: { name: 'Bronz', hex: '#B45309', category: 'doğal', synonyms: ['tunç'] },
  platin: { name: 'Platin', hex: '#E2E8F0', category: 'ton' },
  şampanya: { name: 'Şampanya', hex: '#FDE68A', category: 'ton' },
  macenta: { name: 'Macenta', hex: '#D946EF', category: 'ara' },
  siyan: { name: 'Siyan', hex: '#06B6D4', category: 'ara' },
  fuşya: { name: 'Fuşya', hex: '#E11D48', category: 'ton' },
  tarçın: { name: 'Tarçın Rengi', hex: '#78350F', category: 'ton' },
  erguvan: { name: 'Erguvan', hex: '#7E22CE', category: 'doğal' },
  camgöbeği: { name: 'Camgöbeği', hex: '#38BDF8', category: 'ton' },
  krem: { name: 'Krem', hex: '#FEF9C3', category: 'ton' },
  antrasit: { name: 'Antrasit', hex: '#334155', category: 'ton' },
  vizon: { name: 'Vizon', hex: '#78716C', category: 'ton' },
  bakır: { name: 'Bakır Rengi', hex: '#B45309', category: 'doğal' },
  kemik: { name: 'Kemik Rengi', hex: '#FAF5FF', category: 'ton' },
  saman: { name: 'Saman Sarısı', hex: '#FDE047', category: 'ton' },
  zeytuni: { name: 'Zeytuni', hex: '#4D7C0F', category: 'ton' },
  devetüyü: { name: 'Devetüyü', hex: '#D4B996', category: 'ton' },
  petrol: { name: 'Petrol Mavisi', hex: '#0F766E', category: 'ton' },
  kurşuni: { name: 'Kurşuni', hex: '#64748B', category: 'ton' },
  hardaliye: { name: 'Hardaliye', hex: '#A16207', category: 'ton' },
  kum: { name: 'Kum Beji', hex: '#E7D7C1', category: 'ton' },
  pas: { name: 'Pas Rengi', hex: '#9A3412', category: 'ton' },
  limon: { name: 'Limon Sarısı', hex: '#FACC15', category: 'ton' },
  menekşe: { name: 'Menekşe Moru', hex: '#6D28D9', category: 'doğal' },
  nane: { name: 'Nane Yeşili', hex: '#6EE7B7', category: 'ton' },
  mint: { name: 'Mint Yeşili', hex: '#6EE7B7', category: 'ton' },
  yavruağzı: { name: 'Yavruağzı', hex: '#FCA5A5', category: 'ton' },
  çivit: { name: 'Çivit Mavisi', hex: '#4338CA', category: 'ara' },
  lavanta: { name: 'Lavanta Rengi', hex: '#B39DDB', category: 'ton' }
};

export const COLOR_MODIFIERS = [
  'açık', 'koyu', 'parlak', 'mat', 'pastel', 'canlı', 'soluk', 'tatlı',
  'kirli', 'toz', 'gece', 'çam', 'fıstık', 'şeker', 'limon', 'buz'
];

export const COLOR_SUFFIXES = [
  'msı', 'msi', 'umsu', 'ümsü', 'mtırak', 'mtrak', 'ce', 'ca'
];
