/**
 * A document attached to a vehicle — mirrors the backend `CarDocumentDto`.
 *
 * Documents are the paperwork an operator must produce on demand: the
 * registration certificate, the insurance policy PDF, the inspection report,
 * a rental agreement. The category drives grouping and the matching glyph.
 */
export type CarDocumentCategory =
  | 'registration'
  | 'insurance'
  | 'inspection'
  | 'agreement'
  | 'invoice'
  | 'other';

export const CAR_DOCUMENT_CATEGORIES: readonly CarDocumentCategory[] = [
  'registration',
  'insurance',
  'inspection',
  'agreement',
  'invoice',
  'other',
] as const;

export interface CarDocumentDto {
  id: string;
  carId: string;
  name: string;
  category: CarDocumentCategory;
  /** Download URL. */
  url: string;
  /** MIME type, when known — drives the file glyph (pdf vs image vs sheet). */
  mimeType: string | null;
  sizeBytes: number | null;
  /** Optional expiry — e.g. an agreement or a temporary permit. */
  expiresAt: string | null;
  createdAt: string;
}
