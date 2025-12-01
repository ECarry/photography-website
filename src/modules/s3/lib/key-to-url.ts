const BASE_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";

export const keyToUrl = (key: string | undefined | null) => {
  if (!key) {
    return "";
  }

  return `${BASE_URL}/${key}`;
};
