"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon } from "./ui/moon";
import { SunIcon } from "./ui/sun";

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === "dark" ? (
        <SunIcon className="text-orange-500" />
      ) : (
        <MoonIcon className="text-slate-700" />
      )}
    </Button>
  );
};

export default ThemeToggler;
