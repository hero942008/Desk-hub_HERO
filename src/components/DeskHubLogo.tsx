import React from "react";
import { DESKHUB_LOGO_DATA_URL } from "../assets/logoBase64";

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const DeskHubLogo: React.FC<LogoProps> = ({
  className = "w-full h-full object-cover",
  alt = "DeskHub Logo"
}) => {
  return (
    <img
      src="/Deck.jpg"
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src.indexOf("icon.png") === -1 && target.src.indexOf("deskhub-logo.png") === -1 && !target.src.startsWith("data:")) {
          target.src = "/icon.png";
        } else if (target.src.indexOf("deskhub-logo.png") === -1 && !target.src.startsWith("data:")) {
          target.src = "/assets/deskhub-logo.png";
        } else {
          target.src = DESKHUB_LOGO_DATA_URL;
        }
      }}
    />
  );
};
