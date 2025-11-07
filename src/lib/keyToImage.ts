const BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "";

export const keyToImage = (key: string | undefined | null) => {
  if (!key) {
    return "";
  }

  return `${BASE_URL}/${key}`;
};
