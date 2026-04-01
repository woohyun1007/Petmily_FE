import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const useNavigationGuard = (
  isDirty,
  allowNavigateRef = null,
  message = "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty) return false;
    if (allowNavigateRef?.current) return false;
    if (currentLocation.pathname === nextLocation.pathname) return false;
    return true;
  });

  useEffect(() => {
    if (blocker.state === "blocked") {
      const proceed = window.confirm(message);
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return blocker;
};

export default useNavigationGuard;
