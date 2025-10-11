export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith("/")) {
    return src;
  }
  // if (process.env.NODE_ENV === "development") {
  //   return src;
  // }
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const paramsString = params.join(",");

  let imageSrc = src;
  if (imageSrc.startsWith("gallery-r2")) {
    imageSrc = `https://${imageSrc}`;
  }

  return `/img/${paramsString}/${imageSrc}`;
}
