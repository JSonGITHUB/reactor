import React, { useEffect, useRef } from 'react';

const AnimatedLine = () => {
    const canvasRef = useRef(null);

    const animationWidth = 280; // Width of the animation
    const animationHeight = 200; // Height of the animation

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrameId;

        // Define animation parameters
        const lineColor = '#FFFFFF'; // Color of the line
        const lineWidth = 2; // Width of the line
        const lineSpeed = 1.07; // Speed of the line movement
        const riseHeight = 50; // Height where the line rises
        const fallHeight = 198; // Height where the line falls
        const topSpacing = 315;
        const bottomSpacing = 70;
        const riseSpacing = 320; // Spacing between rises and falls
        const fallSpacing = 580; // Spacing between rises and falls
        const totalWidth = 4 * animationWidth; // Total width of the line

        // Define initial position of the line
        const ogStartX = 70;
        let startX = ogStartX;
        let startY = fallHeight;
        let endX = startX + totalWidth;

        const drawLine = () => {
            // Clear canvas
            context.clearRect(0, 0, animationWidth, animationHeight);

            // Draw the line
            context.beginPath();
            context.moveTo(startX - fallSpacing, riseHeight);
            context.lineTo(startX, startY);
            context.lineTo(startX + bottomSpacing, startY);
            context.lineTo(startX + bottomSpacing + riseSpacing, riseHeight);
            context.lineTo(startX + bottomSpacing + riseSpacing + topSpacing, riseHeight);
            context.lineTo(startX + bottomSpacing + riseSpacing + topSpacing + fallSpacing, startY);
            context.lineTo(startX + bottomSpacing + riseSpacing + topSpacing + fallSpacing + bottomSpacing, startY);
            context.lineTo(startX + bottomSpacing + riseSpacing + topSpacing + fallSpacing + bottomSpacing + riseSpacing, riseHeight);
            context.strokeStyle = lineColor;
            context.lineWidth = lineWidth;
            context.stroke();

            // Update positions for next frame
            startX -= lineSpeed;
            endX -= lineSpeed;

            // Check if line has moved out of bounds, reset positions if needed
            if (endX <= (0-(animationWidth/3))) {
                startX = ogStartX;
                endX = startX + totalWidth;
            }

            // Request next animation frame
            animationFrameId = requestAnimationFrame(drawLine);
        };

        // Start animation
        drawLine();

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} width={animationWidth} height={animationHeight} />;
};

export default AnimatedLine;