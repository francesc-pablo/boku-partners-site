import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770226242/boku_horizontal_matched_font-removebg-preview_v2ax4m.png"
      alt="Boku Partners Logo"
      width={150}
      height={40}
      priority
    />
  );
}
