import React, { createContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

// Step 1: Create the Theme Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Step 2: Load theme from localStorage (so it persists after refresh)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Step 3: Toggle theme and save it in localStorage
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: darkMode ? "#00C896" : "#1677ff",
            colorBgContainer: darkMode ? "#1E1E1E" : "#ffffff",
            colorText: darkMode ? "#E0E0E0" : "#000000",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
