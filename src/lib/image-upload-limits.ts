/** Max images per offer (1 main + gallery). */
export const MAX_OFFER_IMAGES = 60;

/** Gallery slots excluding the main image. */
export const MAX_GALLERY_IMAGES = MAX_OFFER_IMAGES - 1;

/** Per-file upload size limit. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

export function formatMaxImageSizeLabel() {
  return `Máximo ${MAX_IMAGE_MB} MB`;
}
