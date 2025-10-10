const normalizeSrc = (src: string) => {
  try {
    const url = new URL(src);
    if (url.hostname === "gallery-r2.tahmidul612.com") {
      return url.pathname.substring(1); // remove leading '/'
    }
  } catch (e) {
    // not a full URL
  }
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

  return `https://gallery.tahmidul612.com/cdn-cgi/image/${paramsString}/${normalizeSrc(
    src
  )}`;
}
