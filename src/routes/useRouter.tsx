import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/store";
import AuthLayout from "../layouts/AuthLayout";
import { path } from "../utils/path";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import FriendPage from "../pages/friend/friend";
import MainLayout from "../layouts/MainLayout/MainLayout";

const ProjectRouter = () => {
  const isLogin = useAppStore((state) => state.accessToken);
  const { pathname } = useLocation();
  return isLogin ? <Outlet /> : <Navigate to={`/login?redirect_url=${encodeURIComponent(pathname)}`} />;
};

const RejectRouter = () => {
  const isLogin = useAppStore((state) => state.accessToken);
  const [searchParams] = useSearchParams();
  if (!isLogin) {
    return <Outlet />;
  }
  const navigate = searchParams.get("redirect_url") || "/";
  return <Navigate to={navigate} />;
};

export default function useRouter() {
  const routerElement = useRoutes([
    {
      path: "",
      element: <ProjectRouter />,
      children: [
        {
          path: "",
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: (
                <Suspense>
                  <FriendPage />
                </Suspense>
              ),
            },
            {
              path: path.friends,
              element: (
                <Suspense>
                  <FriendPage />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "",
      element: <RejectRouter />,
      children: [
        {
          path: "",
          element: <AuthLayout />,
          children: [
            {
              path: path.login,
              element: (
                <Suspense>
                  <LoginPage />
                </Suspense>
              ),
            },
            {
              path: path.register,
              element: (
                <Suspense>
                  <RegisterPage />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
  ]);
  return routerElement;
}
