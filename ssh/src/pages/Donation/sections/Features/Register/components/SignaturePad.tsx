import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SignaturePad({
  height = 200,
  lineWidth = 3,
  onSave,
}: {
  height?: number;
  lineWidth?: number;
  onSave: (dataUrl: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = container.clientWidth;
      const cssHeight = height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#111827';
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [height, lineWidth]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current!;
    const { x, y } = getPos(e);
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const ctx = ctxRef.current!;
    ctx.closePath();
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const save = () => {
    const dataUrl = canvasRef.current!.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">서명을 입력해 주세요.</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="h-9 px-3" onClick={clear}>
            지우기
          </Button>
          <Button type="button" className="h-9 px-4" onClick={save}>
            저장
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="rounded-md border bg-white">
        <canvas
          ref={canvasRef}
          className="block touch-none rounded-md"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <p className="text-xs text-muted-foreground">팁: 마우스/트랙패드/터치 모두 지원합니다.</p>
    </div>
  );
}
