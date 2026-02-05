import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://res.cloudinary.com/ddvlexmvj/image/upload/v1770333485/image0-Photoroom_rx2nb8.png"
      alt="Boku Partners Logo"
      width={50}
      height={50}
      priority
    />
  );
}
