import React, { useState } from 'react';

interface SchoolLogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  logoUrl = '/placeholder-logo.svg',
  altText = 'School Logo',
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-[11px]',
    lg: 'w-12 h-12 text-[14px]',
    xl: 'w-20 h-20 text-[20px]',
  };

  const finalSizeClass = className || sizeClasses[size];

  // Extract initials dynamically from school name/alt text
  const getInitials = (text: string) => {
    const clean = text
      .replace(/Logo/gi, '')
      .replace(/School/gi, '')
      .replace(/Public/gi, '')
      .replace(/Sr\./gi, '')
      .replace(/Sec\./gi, '')
      .trim();

    const words = clean.split(' ').filter(Boolean);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return 'SP';
  };

  const initials = getInitials(altText || 'School');
  const effectiveUrl = logoUrl || '/placeholder-logo.svg';

  // Fallback: Only render monogram badge if image fails to load or URL is empty
  if (imgError || !effectiveUrl) {
    return (
      <div
        className={`${finalSizeClass} rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-navy-950 flex items-center justify-center font-extrabold tracking-wider shadow-md border-2 border-amber-400/60 shrink-0 select-none`}
        title={altText}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={effectiveUrl}
      alt={altText}
      onError={() => setImgError(true)}
      className={`${finalSizeClass} rounded-full object-cover shadow-md border-2 border-amber-400/50 bg-white shrink-0`}
    />
  );
};
