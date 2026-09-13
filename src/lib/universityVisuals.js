const CAMPUS_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1592280771190-3e2d4d8f6c32?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1600&q=80",
];

export function getUniversityImage(uni) {
  const key = `${uni?.id ?? ""}-${uni?.country ?? ""}-${uni?.name ?? ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return uni?.image_url || CAMPUS_IMAGES[Math.abs(hash) % CAMPUS_IMAGES.length];
}

export { CAMPUS_IMAGES };
