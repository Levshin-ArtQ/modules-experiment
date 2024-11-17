import "./App.css";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { moduleConfig } from "./moduleConfig.js";
import PropTypes from "prop-types";
function App() {
  const [moduleRoutes, setModuleRoutes] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);

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
                  <Suspense fallback={<LoadingScreen moduleName={moduleName} />}>
                    <div className="module-route">
                      <p>Welcome to the {moduleName} module!</p>
                      <p>This module is enabled and functional.</p>
                      <small>
                        This project demonstrates a modular React architecture where modules are dynamically included based on configurations.
                      </small>
                    </div>
                  </Suspense>
                ),
              }));
            })
        );

        setModuleRoutes(routes.flat());
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    loadRoutes();
  }, []);

  return (
    <Router>
      <div className="app">
        {loadingModules && <LoadingScreen />}
        {!loadingModules && (
          <Routes>
            {moduleRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <p>Oops! The module you are looking for is not available.</p>
                </div>
              }
            />
          </Routes>
        )}
      </div>
    </Router>
  );
}

const LoadingScreen = ({ moduleName }) => (
  <div className="loading-screen">
    <p>{moduleName ? `Loading ${moduleName} module...` : "Loading application..."}</p>
  </div>
);

LoadingScreen.propTypes = {
  moduleName: PropTypes.string,
};

export default App;


