import React, { useEffect, useRef } from 'react';

const BreathingPath = () => {

    const canvasRef = useRef(null);
    const width = 300;
    const height = 200;
    const top = 45;
    const bottom = 195;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let startX = 532;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo((startX + 1160), top);
            ctx.lineTo((startX + 900), bottom);
            ctx.lineTo((startX + 820), bottom);
            ctx.lineTo((startX + 265), top);
            ctx.lineTo((startX - 50), top);
            ctx.lineTo((startX - 340), bottom);
            ctx.lineTo((startX - 480), bottom);
            ctx.lineTo((startX - 970), top);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            startX-= 1.05
            //if (startX > 0) requestAnimationFrame(animate);
            if (startX <= (width-1000)) startX = 532; // Reset startX when it goes beyond the left edge
            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default BreathingPath;
