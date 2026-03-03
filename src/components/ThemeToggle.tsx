import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-all duration-300 group"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "light" 
              ? "opacity-100 rotate-0 scale-100" 
              : "opacity-0 -rotate-90 scale-0"
          }`} 
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "dark" 
              ? "opacity-100 rotate-0 scale-100" 
              : "opacity-0 rotate-90 scale-0"
          }`} 
        />
      </div>
      <span className="sr-only">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </span>
    </button>
  );
}
