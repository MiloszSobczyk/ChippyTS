import { useEffect, useRef } from "react";

export default function EmulatorCanvas({ screen }: { screen: Uint8Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const width = 64;
    const height = 32;

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < width * height; i++) {
      const v = screen[i] ? 255 : 0;
      imgData.data[i * 4 + 0] = v;
      imgData.data[i * 4 + 1] = v;
      imgData.data[i * 4 + 2] = v;
      imgData.data[i * 4 + 3] = 255;
    }
    // Helper canvas used to scale 64x32 image into 640x320
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    tmp.getContext("2d")!.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, width * 10, height * 10);
  }, [screen]);

  return <canvas ref={canvasRef} width={640} height={320}></canvas>;
}
