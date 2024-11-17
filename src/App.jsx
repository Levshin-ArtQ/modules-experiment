import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { moduleConfig } from "./moduleСonfig.js";

function App() {
  const [moduleRoutes, setModuleRoutes] = useState([]);

  useEffect(() => {
    /**
     * Load routes from modules that are enabled in moduleConfig.
     *
     * The function uses Promise.all to load all routes in parallel, and then
     * flattens the resulting array of routes. The routes are then wrapped in a
     * Suspense component to handle loading states.
     *
     * The new array of routes is then set as the state of the component.
     */
    const loadRoutes = async () => {
      const routes = await Promise.all(
        Object.entries(moduleConfig)
          .filter(([, enabled]) => enabled)
          .map(async ([moduleName]) => {
            console.log("looking for module: ", moduleName);
            try {
              const moduleRoutes = await import(
                `./modules/${moduleName}/routes`
              );
              return moduleRoutes.default.map((route) => ({
                ...route,
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    {route.element()}
                  </Suspense>
                ),
              }));
            } catch (error) {
              console.error(error);
              throw new Error(`Module ${moduleName} not found`);
            }
          })
      );

      setModuleRoutes(routes.flat());
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
