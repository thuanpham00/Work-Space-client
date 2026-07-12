import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/store";
import AuthLayout from "../layouts/AuthLayout";
import { path } from "../utils/path";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import MainLayout from "../layouts/MainLayout/MainLayout";
import FriendPage from "../pages/Friend/FriendPage";
import UserSideNav from "../pages/SettingAccount/Layouts/UserSideNav";
import InfoUserPage from "../pages/SettingAccount/Pages/InfoUserPage";
import ChangePasswordPage from "../pages/SettingAccount/Pages/ChangePasswordPage";

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
            {
              path: "",
              element: <UserSideNav />,
              children: [
                {
                  path: path.infoUser,
                  element: <InfoUserPage />,
                },
                {
                  path: path.changePassword,
                  element: <ChangePasswordPage />,
                },
              ],
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
