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

  // Aggressive correction for malformed src
  let imageSrc = src;
  if (src.includes(':/')) {
    // Handles `https:/` and `http:/`
    imageSrc = 'https://' + src.split(':/')[1];
  } else if (!src.startsWith('https://')) {
    // Handles cases where protocol is missing entirely
    imageSrc = 'https://' + src;
  }

  return `/img/${paramsString}/${imageSrc}`;
}
