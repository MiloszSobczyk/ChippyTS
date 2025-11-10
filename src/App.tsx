import { useEffect, useRef, useState } from "react";
import { Chip8 } from "@core/Chip8";
import EmulatorCanvas from "@components/EmulatorCanvas";

export default function App() {
  const chip8Ref = useRef<Chip8 | null>(null);
  const [screen, setScreen] = useState<Uint8Array>(new Uint8Array(64 * 32));
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const chip8 = new Chip8();
    chip8.SetDrawCallback((gfx) => setScreen(gfx));
    chip8Ref.current = chip8;

    fetch("/roms/pong2.ch8")
      .then((res) => res.arrayBuffer())
      .then((buf) => chip8.LoadProgram(new Uint8Array(buf)));
  }, []);

  useEffect(() => {
    let frame: number;
    function loop() {
      if (running && chip8Ref.current) {
        chip8Ref.current.RunFrame(10);
      }
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  return (
    <div>
      <EmulatorCanvas screen={screen} />
      <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button>
    </div>
  );
}
