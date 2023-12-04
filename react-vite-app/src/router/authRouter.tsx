import { useLocation, Navigate } from "react-router-dom";


const AuthRouter = (props) => {
  const { pathname } = useLocation();
  if (pathname === '/') {
    return <Navigate to="/home" replace />;
  }
  return props.children;
}

export default AuthRouter