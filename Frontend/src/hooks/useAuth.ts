import { useAppSelector } from "../redux/store/store";
import { selectUser, selectAccessToken } from "../redux/authSlice";

export function useAuth() {
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectAccessToken);
  const role = user?.role;
  const isTeacher = role === "TEACHER";
  return { user, token, role, isTeacher, isLoggedIn: !!token };
}
