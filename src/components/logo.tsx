import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770224522/boku_horizontal_matched_font_c5kydw.png"
      alt="Boku Partners Logo"
      width={150}
      height={40}
      priority
    />
  );
}
