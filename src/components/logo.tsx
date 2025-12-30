import Image from "next/image";

type LogoProps = {
  width?: number;
  height?: number;
};

const Logo = ({ width = 128, height = 128 }: LogoProps) => {
  return (
    <Image
      className="dark:invert"
      src="/logo.png"
      alt="Logo "
      width={width}
      height={height}
    />
  );
};

export default Logo;
