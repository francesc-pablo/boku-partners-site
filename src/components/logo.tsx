import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770227035/boku_horizontal_matched_font-Photoroom_1_p8gexh.png"
      alt="Boku Partners Logo"
      width={150}
      height={40}
      priority
    />
  );
}
