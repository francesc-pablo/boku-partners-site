import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770223244/boku_horizontal_matched_font_eqvy17.png"
      alt="Boku Partners Logo"
      width={150}
      height={40}
      priority
    />
  );
}
