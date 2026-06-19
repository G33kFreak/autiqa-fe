import type { IconName } from '~/components/app/Icon.vue';
import type { LedgerCategory } from '#shared/dto/ledger-entry.dto';
import type { CarDocumentCategory } from '#shared/dto/car-document.dto';

/** Glyph for each ledger category — pairs meaning with the colour tone. */
const LEDGER_CATEGORY_ICON: Record<LedgerCategory, IconName> = {
  rental: 'car',
  fare: 'wallet',
  deposit: 'shield',
  income_other: 'wallet',
  maintenance: 'wrench',
  car_payment: 'wallet',
  insurance: 'shield',
  fee: 'receipt',
  expense_other: 'receipt',
};

export function ledgerCategoryIcon(category: LedgerCategory): IconName {
  return LEDGER_CATEGORY_ICON[category] ?? 'wallet';
}

const DOCUMENT_CATEGORY_ICON: Record<CarDocumentCategory, IconName> = {
  registration: 'document',
  insurance: 'shield',
  inspection: 'check',
  agreement: 'document',
  invoice: 'receipt',
  other: 'document',
};

export function documentCategoryIcon(category: CarDocumentCategory): IconName {
  return DOCUMENT_CATEGORY_ICON[category] ?? 'document';
}

/** Pick a glyph from a MIME type — images get the image glyph, the rest a file. */
export function documentMimeIcon(mime: string | null): IconName {
  if (mime?.startsWith('image/')) return 'image';
  return 'document';
}
