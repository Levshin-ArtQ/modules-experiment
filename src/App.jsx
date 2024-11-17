import "./App.css";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { moduleConfig } from "./moduleConfig.js";

function App() {
  const [moduleRoutes, setModuleRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routes = await Promise.all(
          Object.entries(moduleConfig)
            .filter(([, enabled]) => enabled)
            .map(async ([moduleName]) => {
              const moduleRoutes = await import(
                /* webpackChunkName: "[request]" */ `./modules/${moduleName}/routes.js`
              );
              return moduleRoutes.default.map((route) => ({
                ...route,
                element: (
                  <Suspense fallback={<div className="loading">Loading...</div>}>
                    <div className="module-route">
                      <p>Welcome to {moduleName} module! </p>
                      <p>This module is enabled and functional.</p>
                    </div>
                  </Suspense>
                ),
              }));
            })
        );

        setModuleRoutes(routes.flat());
      } catch (error) {
        console.error("Error loading routes:", error);
      }
    };

    loadRoutes();
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          {moduleRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          <Route
            path="*"
            element={
              <div className="not-found">
                <p>Oops! The module you&apos;re looking for is not available.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
