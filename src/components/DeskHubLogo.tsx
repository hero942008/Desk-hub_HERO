import React, { useState } from "react";
import { DESKHUB_LOGO_DATA_URL, DESKHUB_LOGO_BASE64 } from "../assets/logoBase64";

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const DeskHubLogo: React.FC<LogoProps> = ({
  className = "w-full h-full object-cover",
  alt = "DeskHub Logo"
}) => {
  const [imgSrc, setImgSrc] = useState<string>("/Deck.jpg");
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);

  const fallbackList = [
    "/Deck.jpg",
    "/public/Deck.jpg",
    "/icon.png",
    "/Deck.png",
    "/assets/deskhub-logo.png",
    DESKHUB_LOGO_DATA_URL || DESKHUB_LOGO_BASE64
  ];

  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackList.length) {
      setFallbackIndex(nextIndex);
      setImgSrc(fallbackList[nextIndex]);
    } else {
      setImgSrc(DESKHUB_LOGO_DATA_URL || DESKHUB_LOGO_BASE64);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleImageError}
    />
  );
};

