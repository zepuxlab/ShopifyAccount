import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? "animate-fade-in" : "opacity-0"}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
