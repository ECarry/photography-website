import Image from "next/image";

type BrandConfigType = {
  src: string;
  width: number;
  height: number;
};

/**
 * BrandsLogo component displays a brand logo like Canon, Nikon, etc.
 *
 * @param {string} brand - The brand name (e.g., "Canon", "Nikon", "Sony", "Fujifilm", "Hasselblad", "Leica", "Lumix", "Olympus", "Pentax", "Ricoh", "Sigma", "Apple", "DJI").
 * @param {number} width - Optional width of the brand logo.
 * @param {number} height - Optional height of the brand logo.
 * @param {string} className - Optional className for the component.
 * @returns {JSX.Element} - The BrandsLogo component.
 */

export const BrandsLogo = ({
  brand,
  width,
  height,
  className = "",
}: {
  brand: string;
  width?: number;
  height?: number;
  className?: string;
}) => {
  // Define default configurations for each brand
  const brandConfigs: Record<string, BrandConfigType> = {
    sony: { src: "/Sony_logo.svg", width: 80, height: 20 },
    nikon: { src: "/Nikon_Logo.svg", width: 40, height: 40 },
    canon: { src: "/Canon_logo.svg", width: 80, height: 20 },
    fujifilm: { src: "/Fujifilm_logo.svg", width: 90, height: 25 },
    hasselblad: { src: "/Hasselblad_logo.svg", width: 120, height: 30 },
    leica: { src: "/Leica_logo.svg", width: 40, height: 40 },
    lumix: { src: "/Lumix_logo.svg", width: 90, height: 30 },
    olympus: { src: "/Olympus_logo.svg", width: 100, height: 30 },
    pentax: { src: "/Pentax_Logo.svg", width: 90, height: 30 },
    ricoh: { src: "/Ricoh_logo.svg", width: 90, height: 30 },
    sigma: { src: "/Sigma_logo.svg", width: 80, height: 30 },
    apple: { src: "/Apple_logo.svg", width: 30, height: 35 },
    dji: { src: "/DJI_logo.svg", width: 50, height: 30 },
  };

  // Case-insensitive search for brand that starts with the provided string
  const normalizedBrand = brand.replace(/\s+/g, "").toLowerCase();

  const matchedBrand = Object.keys(brandConfigs).find((brandKey) =>
    brandKey.startsWith(normalizedBrand)
  );

  // If no brand matches, use placeholder
  const config = matchedBrand
    ? brandConfigs[matchedBrand]
    : { src: "/placeholder.svg", width: 40, height: 40 };

  return (
    <Image
      src={config.src}
      alt={brand}
      width={width || config.width}
      height={height || config.height}
      className={`object-contain ${className}`}
    />
  );
};
