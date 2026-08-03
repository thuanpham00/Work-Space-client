/* eslint-disable react-refresh/only-export-components */
import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { path } from "../utils/path";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import MainLayout from "../layouts/MainLayout/MainLayout";
import FriendPage from "../pages/Friend/FriendPage";
import Workspace from "../pages/Workspace/Workspace";
import SettingAccount from "../pages/SettingAccount/SettingAccount";
import { useUserStore } from "../store/userStore";

const ProjectRouter = () => {
  const isLogin = useUserStore((state) => state.accessToken);
  const { pathname } = useLocation();
  return isLogin ? <Outlet /> : <Navigate to={`/login?redirect_url=${encodeURIComponent(pathname)}`} />;
};

const RejectRouter = () => {
  const isLogin = useUserStore((state) => state.accessToken);
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
            {
              path: path.workspaces,
              element: (
                <Suspense>
                  <Workspace />
                </Suspense>
              ),
            },
            {
              path: path.settingAccount,
              element: (
                <Suspense>
                  <SettingAccount />
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
