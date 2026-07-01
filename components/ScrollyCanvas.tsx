"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import Overlay from "./Overlay";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

function drawBitmapCover(canvas: HTMLCanvasElement, bitmap: ImageBitmap) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = bitmap.width / bitmap.height, cr = cw / ch;
    let dw, dh, ox, oy;
    if (ir > cr) {
        dh = ch; dw = bitmap.width * (ch / bitmap.height);
        ox = (cw - dw) / 2; oy = 0;
    } else {
        dw = cw; dh = bitmap.height * (cw / bitmap.width);
        ox = 0; oy = 0;
    }
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, ox, oy, dw, dh);
}

// ─── Canvas hero ─────────────────────────────────────────────────────────────

interface HeroProps {
    videoSrc:     string;
    frameCount:   number;
    scrollVh:     number;
    onProgress:   (p: number) => void;
    onFirstFrame: () => void;
    onAllLoaded:  () => void;
}

function CanvasHero({ videoSrc, frameCount, scrollVh, onProgress, onFirstFrame, onAllLoaded }: HeroProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bitmaps      = useRef<(ImageBitmap | null)[]>([]);
    const loadedMask   = useRef<boolean[]>([]);
    const rafRef       = useRef<number | null>(null);
    const lastFrame    = useRef(-1);

    const progressRef    = useRef(onProgress);
    const firstFrameRef  = useRef(onFirstFrame);
    const allLoadedRef   = useRef(onAllLoaded);
    useEffect(() => { progressRef.current   = onProgress;   }, [onProgress]);
    useEffect(() => { firstFrameRef.current = onFirstFrame; }, [onFirstFrame]);
    useEffect(() => { allLoadedRef.current  = onAllLoaded;  }, [onAllLoaded]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const drawFrame = useCallback((index: number) => {
        const bitmap = bitmaps.current[index];
        const canvas = canvasRef.current;
        if (!canvas || !bitmap) return;
        if (lastFrame.current === index) return;
        lastFrame.current = index;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            drawBitmapCover(canvas, bitmap!);
            rafRef.current = null;
        });
    }, []);

    // ── Video frame extraction ───────────────────────────────────────────────
    // Download 1 small MP4 → seek through each frame → extract to ImageBitmap
    // Much faster than 96 individual fetch requests
    useEffect(() => {
        let cancelled = false;
        bitmaps.current   = new Array(frameCount).fill(null);
        loadedMask.current = new Array(frameCount).fill(false);

        const video = document.createElement("video");
        video.src        = videoSrc;
        video.muted      = true;
        video.playsInline = true;
        video.preload    = "auto";
        // crossOrigin needed for createImageBitmap on some browsers
        video.crossOrigin = "anonymous";

        const extract = async () => {
            if (cancelled) return;
            const duration = video.duration;

            for (let i = 0; i < frameCount; i++) {
                if (cancelled) return;

                // Seek to the position for this frame
                video.currentTime = (i / frameCount) * duration;
                await new Promise<void>((resolve) => {
                    video.addEventListener("seeked", () => resolve(), { once: true });
                });

                if (cancelled) return;

                try {
                    bitmaps.current[i]    = await createImageBitmap(video);
                    loadedMask.current[i] = true;
                } catch {
                    // frame decode failed — leave null, scroll falls back to nearest
                }

                progressRef.current((i + 1) / frameCount);
                if (i === 0) { drawFrame(0); firstFrameRef.current(); }
                if (i === frameCount - 1) allLoadedRef.current();
            }
        };

        video.addEventListener("canplaythrough", extract, { once: true });
        video.addEventListener("error", () => {
            // If video fails, nothing to do — loading bar just stays
            console.error("Video load failed:", videoSrc);
        }, { once: true });

        video.load();

        return () => {
            cancelled = true;
            video.src = "";
        };
    }, [videoSrc, frameCount, drawFrame]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        let target = Math.min(frameCount - 1, Math.floor(latest * frameCount));
        while (target > 0 && !loadedMask.current[target]) target--;
        drawFrame(target);
    });

    useEffect(() => {
        const NAVBAR_H = 64;
        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width  = window.innerWidth;
            canvasRef.current.height = window.innerHeight - NAVBAR_H;
            lastFrame.current = -1;
            if (bitmaps.current[0]) drawFrame(0);
        };
        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
    }, [drawFrame]);

    return (
        <div ref={containerRef} style={{ height: `${scrollVh}vh` }} className="relative">
            <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden">
                <canvas ref={canvasRef} className="block w-full h-full" />
                <Overlay scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default function ScrollyCanvas({ frameCount = 96 }: { frameCount?: number }) {
    const isMobile = useIsMobile();
    const [mounted,    setMounted]    = useState(false);
    const [progress,   setProgress]   = useState(0);
    const [firstFrame, setFirstFrame] = useState(false);
    const [allLoaded,  setAllLoaded]  = useState(false);

    useEffect(() => setMounted(true), []);

    const handleProgress   = useCallback((p: number) => setProgress(p), []);
    const handleFirstFrame = useCallback(() => setFirstFrame(true), []);
    const handleAllLoaded  = useCallback(() => setAllLoaded(true),  []);

    // Lock scroll until all frames extracted into GPU memory
    useEffect(() => {
        if (allLoaded) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [allLoaded]);

    if (!mounted) return <div className="bg-[#121212]" style={{ height: "100vh" }} />;

    const props: HeroProps = {
        videoSrc:     isMobile ? "/hero-mobile.mp4" : "/hero-desktop.mp4",
        frameCount:   isMobile ? 32 : frameCount,
        scrollVh:     isMobile ? 300 : 500,
        onProgress:   handleProgress,
        onFirstFrame: handleFirstFrame,
        onAllLoaded:  handleAllLoaded,
    };

    return (
        <div className="relative">
            <CanvasHero {...props} />

            <AnimatePresence>
                {!allLoaded && (
                    <motion.div
                        key="loader"
                        className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center gap-6"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">Loading</p>
                        <div className="w-48 h-px bg-white/10 relative overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-white transition-all duration-150"
                                style={{ width: `${Math.round(progress * 100)}%` }}
                            />
                        </div>
                        <p className="text-white/30 text-xs font-mono">{Math.round(progress * 100)}%</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
