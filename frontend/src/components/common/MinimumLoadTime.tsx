import { ReactNode, useEffect, useState } from 'react';

interface MinimumLoadTimeProps {
  children: ReactNode;
  duration?: number;
}

export const MinimumLoadTime = ({ children, duration = 750 }: MinimumLoadTimeProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return showContent ? children : null;
};

export default MinimumLoadTime;
