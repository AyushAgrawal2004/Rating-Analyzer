import React, { useEffect, useState } from "react";
import ClayToggle from "../../ui/ClayToggle.jsx";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <ClayToggle
      checked={isDark}
      onChange={setIsDark}
      isThemeToggle
      size="sm"
    />
  );
}

export default DarkModeToggle;
