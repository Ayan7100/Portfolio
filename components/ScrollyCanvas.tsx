"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import Overlay from "./Overlay";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
}

export default function ScrollyCanvas({ frameCount = 96 }: { frameCount?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = useIsMobile();

    // Mobile: load every 2nd frame → 48 images, covering full animation
    const mobileStep = 2;
    const mobileFrames = Math.ceil(frameCount / mobileStep);
    const activeFrameCount = isMobile ? mobileFrames : frameCount;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    useEffect(() => {
        setIsLoaded(false);
        setImages([]);

        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises: Promise<void>[] = [];

            const count = isMobile ? mobileFrames : frameCount;
            const ext = "webp";
            const dir = "/sequence-webp/";

            for (let i = 0; i < count; i++) {
                const sourceIndex = isMobile ? i * mobileStep : i;
                const promise = new Promise<void>((resolve) => {
                    const img = new Image();
                    const frameId = sourceIndex.toString().padStart(4, "0");
                    img.src = `${dir}${frameId}.${ext}`;
                    img.onload = () => {
                        loadedImages[i] = img;
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, [isMobile, frameCount]);

    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !images[index]) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = images[index];

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = img.width * (canvas.height / img.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = img.height * (canvas.width / img.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (!isLoaded || images.length === 0) return;
        const frameIndex = Math.min(
            activeFrameCount - 1,
            Math.floor(latest * activeFrameCount)
        );
        requestAnimationFrame(() => renderFrame(frameIndex));
    });

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            renderFrame(0);
        }
    }, [isLoaded]);

    // Mobile: 300vh (fast scroll), Desktop: 500vh (cinematic)
    const scrollHeight = isMobile ? "h-[300vh]" : "h-[500vh]";

    return (
        <div ref={containerRef} className={`${scrollHeight} relative`}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-50">
                        Loading...
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full object-cover"
                />
                <Overlay scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
}
