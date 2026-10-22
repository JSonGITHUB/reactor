import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TOP_THRESHOLD_PX = 120;
const BOTTOM_THRESHOLD_PX = 120;

const SitewideLowerNav = () => {
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(false);
    const location = useLocation();

    const updateScrollState = useCallback(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
        const viewportHeight = window.innerHeight || doc.clientHeight || 0;
        const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight);
        const hasScrollableContent = scrollHeight > viewportHeight + 20;

        setShowTop(hasScrollableContent && scrollTop > TOP_THRESHOLD_PX);
        setShowBottom(
            hasScrollableContent &&
            scrollTop + viewportHeight < scrollHeight - BOTTOM_THRESHOLD_PX
        );
    }, []);

    useEffect(() => {
        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            window.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState]);

    useEffect(() => {
        window.requestAnimationFrame(updateScrollState);
    }, [location.pathname, location.search, updateScrollState]);

    if (!showTop && !showBottom) {
        return null;
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight);
        window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className='sitewide-lower-nav' aria-label='Page navigation'>
            <div className='sitewide-lower-nav-buttons show-buttons'>
                {
                    showTop
                        ? <div
                            type='button'
                            className='button size40 mb-10 text-outline-lite'
                            onClick={scrollToTop}
                            title='Scroll to top'
                        >
                            🔼
                        </div>
                        : null
                }
                {
                    showBottom
                        ? <div
                            type='button'
                            className='button size40 mt-10 mb-10 text-outline-lite'
                            onClick={scrollToBottom}
                            title='Scroll to bottom'
                        >
                            🔽
                        </div>
                        : null
                }
            </div>
        </div>
    );
};

export default SitewideLowerNav;
