import { useRoutes } from "react-router-dom";
import rootRouter from "@/router";
import AuthRouter from "@/router/authRouter";

function App() {
  const element = useRoutes(rootRouter as any);
  return (
    <>
      <AuthRouter>{element}</AuthRouter>
    </>
  )
}

export default App;