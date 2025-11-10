export type DrawCallback = (screen: Uint8Array, width: number, height: number) => void;
export type SoundCallback = () => void;

// Right now this class copies render buffer each frame. It's not supposed to stay that way, it's only proof of concept for now
export class Chip8 {
  // Memory
  private memory: Uint8Array;

  // CPU registers: V0..VF
  private V: Uint8Array;

  // Index register
  private I: number;

  // Program counter
  private pc: number;

  // Graphics: 64 x 32 monochrome, stored as 0/1
  private gfx: Uint8Array;

  // Timers
  private delayTimer: number;
  private soundTimer: number;

  // Stack and stack pointer
  private stack: number[];
  private sp: number;

  // Keypad state (16 keys)
  private key: Uint8Array;

  // Draw flag
  public drawFlag: boolean;

  // Callbacks
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

  // Display dimensions
  public readonly width: number = 64;
  public readonly height: number = 32;

  constructor() {
    this.memory = new Uint8Array(4096);
    this.V = new Uint8Array(16);
    this.I = 0;
    this.pc = 0x200; // Programs start at 0x200
    this.gfx = new Uint8Array(this.width * this.height);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.stack = new Array<number>(16).fill(0);
    this.sp = 0;
    this.key = new Uint8Array(16);
    this.drawFlag = false;

    this.Reset();
  }

  public Reset(): void {
    this.memory.fill(0);
    this.V.fill(0);
    this.I = 0;
    this.pc = 0x200;
    this.gfx.fill(0);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.stack.fill(0);
    this.sp = 0;
    this.key.fill(0);
    this.drawFlag = false;

    // Load fontset into memory at 0x50 (80)
    for (let i = 0; i < this.fontset.length; i++) {
      this.memory[0x50 + i] = this.fontset[i];
    }
  }

  public LoadProgram(program: Uint8Array): void {
    if (program.length + 0x200 > 4096) {
      throw new Error("Program too large for memory");
    }

    for (let i = 0; i < program.length; i++) {
      this.memory[0x200 + i] = program[i];
    }

    this.pc = 0x200;
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

    this.key[index] = pressed ? 1 : 0;
  }

  // Return copy of the Chip8 display buffer
  public GetScreen(): Uint8Array<ArrayBuffer> {
    return this.gfx.slice();
  }

  // One CPU cycle: fetch, decode, execute
  public Cycle(): void {
    // Fetch opcode (two bytes)
    const opcode: number = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];

    // Increment pc before we may modify it during some instructions
    this.pc += 2;

    // Decode and execute (missing ExecuteOpcode implementation)
    this.ExecuteOpcode(opcode);

    // Update timers
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

  private ExecuteOpcode(opcode: number): void {}

  // Helpers to run many cycles per frame and update timers at ~60Hz
  // call runFrame(cycles) from your main loop where cycles is e.g. 10..20 depending on speed
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
