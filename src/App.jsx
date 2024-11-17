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
                  <Suspense fallback={<div>Loading...</div>}>
                    {route.element()}
                  </Suspense>
                ),
              }));
            })
        );

        setModuleRoutes(routes.flat());
      } catch (error) {
        console.error(error);
      }
    };

    loadRoutes();
  }, []);

  return (
    <Router>
      <Routes>
        {moduleRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<div>Module Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;

