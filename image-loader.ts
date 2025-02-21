const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

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

  return `https://photograph.ecarry.uk/cdn-cgi/image/${paramsString}/${normalizeSrc(
    src
  )}`;
}
