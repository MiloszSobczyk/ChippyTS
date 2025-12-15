import type { Chip8Context } from "./Chip8Context";
import type { OpcodeCommand } from "./commands/OpcodeCommand";
import { OpcodeCommandsMap } from "./commands/OpcodeCommandsMap";

export type DrawCallback = (screen: Uint8Array, width: number, height: number) => void;
export type SoundCallback = () => void;

// Possible optimizations:
// Precompute x, y, kk, nnn, n for each opcode
// Optimize DRW (draw) loop
// Right now this class copies render buffer each frame. It's not supposed to stay that way, it's only proof of concept for now
export class Chip8 {
  private memory: Uint8Array;
  private cpuRegisters: Uint8Array;
  private indexRegister: number;
  private programCounter: number;
  private graphics: Uint8Array;

  // Timers
  private delayTimer: number;
  private soundTimer: number;

  // Stack and stack pointer
  private stack: number[];
  private stackPointer: number;

  // Keypad state (16 keys)
  // Not working yet
  private keypadState: Uint8Array;

  // Draw flag
  public drawFlag: boolean;

  private onDraw?: DrawCallback;
  private onSound?: SoundCallback;

  // Standard CHIP-8 fontset
  private fontset: Uint8Array = new Uint8Array([
    0xf0,
    0x90,
    0x90,
    0x90,
    0xf0, // 0
    0x20,
    0x60,
    0x20,
    0x20,
    0x70, // 1
    0xf0,
    0x10,
    0xf0,
    0x80,
    0xf0, // 2
    0xf0,
    0x10,
    0xf0,
    0x10,
    0xf0, // 3
    0x90,
    0x90,
    0xf0,
    0x10,
    0x10, // 4
    0xf0,
    0x80,
    0xf0,
    0x10,
    0xf0, // 5
    0xf0,
    0x80,
    0xf0,
    0x90,
    0xf0, // 6
    0xf0,
    0x10,
    0x20,
    0x40,
    0x40, // 7
    0xf0,
    0x90,
    0xf0,
    0x90,
    0xf0, // 8
    0xf0,
    0x90,
    0xf0,
    0x10,
    0xf0, // 9
    0xf0,
    0x90,
    0xf0,
    0x90,
    0x90, // A
    0xe0,
    0x90,
    0xe0,
    0x90,
    0xe0, // B
    0xf0,
    0x80,
    0x80,
    0x80,
    0xf0, // C
    0xe0,
    0x90,
    0x90,
    0x90,
    0xe0, // D
    0xf0,
    0x80,
    0xf0,
    0x80,
    0xf0, // E
    0xf0,
    0x80,
    0xf0,
    0x80,
    0x80, // F
  ]);

  public readonly width: number = 64;
  public readonly height: number = 32;

  constructor() {
    this.memory = new Uint8Array(4096);
    this.cpuRegisters = new Uint8Array(16);
    this.indexRegister = 0;
    this.programCounter = 0x200;
    this.graphics = new Uint8Array(this.width * this.height);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.stack = new Array<number>(16).fill(0);
    this.stackPointer = 0;
    this.keypadState = new Uint8Array(16);
    this.drawFlag = false;

    this.Reset();
  }

  public Reset(): void {
    this.memory.fill(0);
    this.cpuRegisters.fill(0);
    this.indexRegister = 0;
    this.programCounter = 0x200;
    this.graphics.fill(0);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.stack.fill(0);
    this.stackPointer = 0;
    this.keypadState.fill(0);
    this.drawFlag = false;

    // Load fontset into memory at 0x50 (80)
    for (let i = 0; i < this.fontset.length; i++) {
      this.memory[0x50 + i] = this.fontset[i];
    }
  }

  private GetContext(): Chip8Context {
    return {
      memory: this.memory,
      cpuRegisters: this.cpuRegisters,
      indexRegister: this.indexRegister,
      programCounter: this.programCounter,
      graphics: this.graphics,
      delayTimer: this.delayTimer,
      soundTimer: this.soundTimer,
      stack: this.stack,
      stackPointer: this.stackPointer,
      keypadState: this.keypadState,
      drawFlag: this.drawFlag,
      width: this.width,
      height: this.height,
      onDraw: this.onDraw,
      onSound: this.onSound,
    };
  }

  public LoadProgram(program: Uint8Array): void {
    if (program.length + 0x200 > 4096) {
      throw new Error("Program too large for memory");
    }

    for (let i = 0; i < program.length; i++) {
      this.memory[0x200 + i] = program[i];
    }

    this.programCounter = 0x200;
  }

  public SetDrawCallback(cb: DrawCallback): void {
    this.onDraw = cb;
  }

  public SetSoundCallback(cb: SoundCallback): void {
    this.onSound = cb;
  }

  public SetKey(index: number, pressed: boolean): void {
    if (index < 0 || index > 0xf) {
      return;
    }

    this.keypadState[index] = pressed ? 1 : 0;
  }

  public GetScreen(): Uint8Array<ArrayBuffer> {
    return this.graphics.slice();
  }

  public Cycle(): void {
    const opcode: number =
      (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];

    this.programCounter += 2;

    this.ExecuteOpcode(opcode);

    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }

    if (this.soundTimer > 0) {
      this.soundTimer -= 1;

      if (this.soundTimer === 0) {
        if (this.onSound) {
          this.onSound();
        }
      }
    }
  }

  public ExecuteOpcode(opcode: number): void {
    const key = (opcode & 0xf000) >> 12;

    const command: OpcodeCommand | undefined = OpcodeCommandsMap.get(key);

    if (command) {
      let context = this.GetContext();

      command.Execute(opcode, context);

      this.programCounter = context.programCounter;
      this.indexRegister = context.indexRegister;
      this.delayTimer = context.delayTimer;
      this.soundTimer = context.soundTimer;
      this.stackPointer = context.stackPointer;
      this.drawFlag = context.drawFlag;
    } else {
      console.warn(`Unknown opcode: 0x${opcode.toString(16)}`);
    }
  }

  // Helpers to run many cycles per frame and update timers at ~60Hz
  public RunFrame(cycles: number) {
    for (let i = 0; i < cycles; i++) {
      this.Cycle();
    }
  }

  // Debug: disassemble next opcode
  public PeekOpcodeAt(address: number) {
    const opcode = (this.memory[address] << 8) | this.memory[address + 1];
    return opcode;
  }
}
