'use client';

import Image from 'next/image';
import CompanionIconSrc from '@/assets/Lumee.png'; 

type CompanionIconProps = {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function CompanionIcon({
  width = 120,
  height = 120,
  alt = 'Companion icon',
  className,
  style,
}: CompanionIconProps) {
  return (
    <Image
      src={CompanionIconSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        // filter: 'saturate(1582%) brightness(76%) contrast(92%)',
        ...style,
      }}
      priority
    />
  );
}
