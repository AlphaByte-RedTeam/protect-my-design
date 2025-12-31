import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  width?: number;
  height?: number;
};

const Logo = ({ width = 32, height = 32 }: LogoProps) => {
  return (
    <Link
      href="/"
      className="flex gap-1 flex-row justify-center items-center h-full"
    >
      <Image
        src="/logo.png"
        alt="Logo ProtectMyDesign"
        width={width}
        height={height}
      />
      <p className="text-slate-12 dark:text-white w-24 leading-4 font-bold text-sm">
        ProtectMy Design
      </p>
    </Link>
  );
};

export default Logo;
