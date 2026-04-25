export const ACCEPTED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/plain',
  'text/csv',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
]);

export const ACCEPTED_FILE_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'tif',
  'tiff',
  'heic',
  'heif',
  'doc',
  'docx',
  'rtf',
  'odt',
  'xls',
  'xlsx',
  'ods',
  'txt',
  'csv',
  'ppt',
  'pptx',
  'odp',
]);

export const ACCEPTED_FILE_INPUT_ATTR = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.tif,.tiff,.heic,.heif,.pdf,.doc,.docx,.rtf,.odt,.txt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.odp';

export const ACCEPTED_FILE_FORMATS_LABEL = 'JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, HEIC, HEIF, PDF, DOC, DOCX, RTF, ODT, TXT, XLS, XLSX, ODS, CSV, PPT, PPTX, ODP';

export const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function isAcceptedFileType(file: File): boolean {
  if (ACCEPTED_FILE_MIME_TYPES.has(file.type)) return true;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return ACCEPTED_FILE_EXTENSIONS.has(extension);
}
