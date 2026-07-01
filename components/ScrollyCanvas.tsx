"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
    // ImageBitmap is GPU-decoded → drawImage is ~10x faster than HTMLImageElement
    const bitmapsRef = useRef<(ImageBitmap | null)[]>([]);
    const loadedMaskRef = useRef<boolean[]>([]);
    const rafRef = useRef<number | null>(null);
    const currentFrameRef = useRef(0);
    const [firstFrameReady, setFirstFrameReady] = useState(false);
    const isMobile = useIsMobile();

    // Mobile: every 3rd frame = 32 frames (~580KB), Desktop: all 96
    const mobileStep = 3;
    const activeFrameCount = isMobile ? Math.ceil(frameCount / mobileStep) : frameCount;

    const drawBitmap = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const bitmap = bitmapsRef.current[index];
        if (!canvas || !bitmap) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cw = canvas.width, ch = canvas.height;
        const ir = bitmap.width / bitmap.height;
        const cr = cw / ch;

        let dw, dh, ox, oy;
        if (ir > cr) {
            dh = ch; dw = bitmap.width * (ch / bitmap.height);
            ox = (cw - dw) / 2; oy = 0;
        } else {
            dw = cw; dh = bitmap.height * (cw / bitmap.width);
            ox = 0; oy = (ch - dh) / 2;
        }

        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(bitmap, ox, oy, dw, dh);
    }, []);

    const renderFrame = useCallback((index: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            drawBitmap(index);
            rafRef.current = null;
        });
    }, [drawBitmap]);

    useEffect(() => {
        setFirstFrameReady(false);
        const count = activeFrameCount;
        const step = isMobile ? mobileStep : 1;

        bitmapsRef.current = new Array(count).fill(null);
        loadedMaskRef.current = new Array(count).fill(false);

        const loadFrame = async (i: number) => {
            const sourceIndex = i * step;
            const frameId = sourceIndex.toString().padStart(4, "0");
            try {
                const resp = await fetch(`/sequence-webp/${frameId}.webp`);
                if (!resp.ok) return;
                const blob = await resp.blob();
                const bitmap = await createImageBitmap(blob);
                bitmapsRef.current[i] = bitmap;
                loadedMaskRef.current[i] = true;
                if (i === 0) setFirstFrameReady(true);
            } catch {
                // frame missing — skip
            }
        };

        // Load frame 0 first for instant display, then batch-load rest
        loadFrame(0).then(() => {
            // Load in batches of 8 to avoid hammering mobile network
            const batchSize = 8;
            const batches: Promise<void>[][] = [];
            for (let i = 1; i < count; i += batchSize) {
                const batch: Promise<void>[] = [];
                for (let j = i; j < Math.min(i + batchSize, count); j++) {
                    batch.push(loadFrame(j));
                }
                batches.push(batch);
            }
            const runBatches = async () => {
                for (const batch of batches) {
                    await Promise.all(batch);
                }
            };
            runBatches();
        });

        return () => {
            bitmapsRef.current.forEach(b => b?.close());
        };
    }, [isMobile, activeFrameCount]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (!firstFrameReady) return;
        const target = Math.min(
            activeFrameCount - 1,
            Math.floor(latest * activeFrameCount)
        );
        // Walk back to nearest loaded frame
        let frame = target;
        while (frame > 0 && !loadedMaskRef.current[frame]) frame--;
        currentFrameRef.current = frame;
        renderFrame(frame);
    });

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(currentFrameRef.current);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [renderFrame]);

    useEffect(() => {
        if (firstFrameReady) renderFrame(0);
    }, [firstFrameReady, renderFrame]);

    const scrollHeight = isMobile ? "h-[250vh]" : "h-[500vh]";

    return (
        <div ref={containerRef} className={`${scrollHeight} relative`}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {!firstFrameReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#121212] z-50">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <canvas ref={canvasRef} className="block w-full h-full" />
                <Overlay scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
}
