import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770400558/boku_horizontal_matched_font_burgundy_transparent_e9kzsz.png"
      alt="Boku Partners Logo"
      width={120}
      height={60}
      priority
    />
  );
}
