export interface Chip8Context {
  memory: Uint8Array;
  cpuRegisters: Uint8Array;
  indexRegister: number;
  programCounter: number;
  graphics: Uint8Array;
  delayTimer: number;
  soundTimer: number;
  stack: number[];
  stackPointer: number;
  keypadState: Uint8Array;
  drawFlag: boolean;
  width: number;
  height: number;
  onDraw?: (screen: Uint8Array, width: number, height: number) => void;
  onSound?: () => void;
}
