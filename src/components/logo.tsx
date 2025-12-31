import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  width?: number;
  height?: number;
};

const Logo = ({ width = 128, height = 128 }: LogoProps) => {
  return (
    <Link href="/" className="flex flex-row justify-center items-center">
      <Image
        src="/logo.png"
        alt="Logo ProtectMyDesign"
        width={width}
        height={height}
      />
      <p className="text-slate-12 dark:text-white w-24 leading-5 font-semibold text-xl">
        ProtectMy Design
      </p>
    </Link>
  );
};

export default Logo;
