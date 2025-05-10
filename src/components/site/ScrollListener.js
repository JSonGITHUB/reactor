import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollListener = ({ onScrollToBottom }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const location = useLocation();

  const checkScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const totalHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (scrollTop + windowHeight >= totalHeight - 10) {
      if (location.pathname.toLocaleLowerCase() === '/home') {
        onScrollToBottom(true);
      } else {
        onScrollToBottom(false);  
      }
      setScrolledToBottom(true);
    } else {
      setScrolledToBottom(false);
    }
    
  };

  useEffect(() => {

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll, { passive: true });
    };
  }, [onScrollToBottom, location.pathname, scrolledToBottom]);

  return <div>{/*`location: ${location.pathname.toLocaleLowerCase()} scrolledToBottom: ${scrolledToBottom} scroll value: ${window.scrollY}`*/}</div>;
};

export default ScrollListener;