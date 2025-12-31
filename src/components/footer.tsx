import Link from "next/link";
import { Button } from "./ui/button";
import { GithubIcon } from "./ui/github";

const Footer = () => {
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <p className="text-xs text-gray-600 dark:text-gray-500 font-normal">
        Copyright © 2025{" "}
        <Button asChild variant="link" className="text-xs p-0">
          <Link href="https://izier.co">Izier</Link>
        </Button>
      </p>
      <ul>
        <li>
          <Button asChild variant="ghost" size="icon">
            <Link href="https://github.com/izier-co/protect-my-design">
              <GithubIcon />
            </Link>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default Footer;
