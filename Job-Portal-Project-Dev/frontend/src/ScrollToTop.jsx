import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollToPageTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToPageTop();

      setTimeout(() => {
        scrollToPageTop();
      }, 0);
    });
  }, [
    location.pathname,
    location.search,
    location.hash,
    location.key,
    navigationType,
  ]);

  return null;
};

export default ScrollToTop;
