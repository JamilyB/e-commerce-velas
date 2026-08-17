import { IMAGE_FALLBACKS, DEFAULT_FALLBACK_IMAGE } from '../data/constants';

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  id: string
): void => {
  e.currentTarget.src = IMAGE_FALLBACKS[id] || DEFAULT_FALLBACK_IMAGE;
};
