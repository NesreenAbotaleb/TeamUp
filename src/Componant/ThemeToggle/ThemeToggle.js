// import React, { useState } from "react";
// import { ConfigProvider, Switch, theme } from "antd";

// function ThemeToggle() {
//   const [darkMode, setDarkMode] = useState(false);

//   return (
//     <ConfigProvider theme={{ algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
//       <div style={{ padding: "20px", background: darkMode ? "#141414" : "#fff", minHeight: "100vh" }}>
//         <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} checkedChildren="Dark" unCheckedChildren="Light" />
//       </div>
//     </ConfigProvider>
//   );
// }
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // export default ThemeToggle;
// import React, { useState, useEffect } from "react";
// import { ConfigProvider, Switch, theme } from "antd";

// function ThemeToggle() {
//   // Load theme from localStorage or default to light mode
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem("theme") === "dark";
//   });

//   // Function to toggle theme & store in localStorage
//   const toggleTheme = () => {
//     const newTheme = !darkMode;
//     setDarkMode(newTheme);
//     localStorage.setItem("theme", newTheme ? "dark" : "light");
//   };

//   return (
//     <ConfigProvider
//       theme={{
//         algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
//         token: {
//           colorPrimary: darkMode ? "#00C896" : "#1677ff", // Primary color
//           colorBgContainer: darkMode ? "#1E1E1E" : "#ffffff", // Background
//           colorText: darkMode ? "#E0E0E0" : "#000000", // Text color
//         },
//       }}
//     >
//       <div
//         style={{
//           padding: "20px",
//           background: darkMode ? "#1E1E1E" : "#ffffff",
//           color: darkMode ? "#E0E0E0" : "#000000",
//           minHeight: "100vh",
//           transition: "all 0.3s ease-in-out", // Smooth transition
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <h2>Current Theme: {darkMode ? "Dark Mode 🌙" : "Light Mode ☀️"}</h2>
//         <Switch
//           checked={darkMode}
//           onChange={toggleTheme}
//           checkedChildren="Dark"
//           unCheckedChildren="Light"
//           style={{
//             background: darkMode ? "#00C896" : "#1677ff", // Switch color
//           }}
//         />
//       </div>
//     </ConfigProvider>
//   );
// }

// export default ThemeToggle;
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState } from "react";
import { ConfigProvider, Switch, Layout, Typography, theme } from "antd";

const { Header, Content } = Layout;

function ThemeToggle() {
  // Load theme from localStorage or default to light mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm, // ✅ FIXED
        token: {
          colorPrimary: darkMode ? "#00C896" : "#1677ff",
          colorBgContainer: darkMode ? "#1E1E1E" : "#ffffff",
          colorText: darkMode ? "#E0E0E0" : "#000000",
        },
      }}
    >
      <Layout
        style={{
          minHeight: "100vh",
          transition: "all 0.3s ease-in-out",
          background: darkMode ? "#1E1E1E" : "#ffffff",
        }}
      >
        {/* Navbar */}
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: darkMode ? "#141414" : "#f0f2f5",
            padding: "0 20px",
          }}
        >
          <Typography.Title level={3} style={{ color: darkMode ? "#E0E0E0" : "#000000" }}>
            {/* My App */}
          </Typography.Title>

          {/* Toggle Switch */}
          <Switch
            checked={darkMode}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            style={{
              background: darkMode ? "#00C896" : "#1677ff",
            }}
          />
        </Header>

        {/* Content Area */}
        <Content
          style={{
            padding: "20px",
            color: darkMode ? "#E0E0E0" : "#000000",
            textAlign: "center",
          }}
        >
          <Typography.Title>
            {darkMode ? "Dark Mode Activated 🌙" : "Light Mode Activated ☀️"}
          </Typography.Title>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default ThemeToggle;

