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
  // Not working yet
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

  public readonly width: number = 64;
  public readonly height: number = 32;

  constructor() {
    this.memory = new Uint8Array(4096);
    this.V = new Uint8Array(16);
    this.I = 0;
    this.pc = 0x200;
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

  public GetScreen(): Uint8Array<ArrayBuffer> {
    return this.gfx.slice();
  }

  public Cycle(): void {
    const opcode: number = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];

    this.pc += 2;

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

  private ExecuteOpcode(opcode: number) {
    const nibbles = [
      (opcode & 0xf000) >> 12,
      (opcode & 0x0f00) >> 8,
      (opcode & 0x00f0) >> 4,
      opcode & 0x000f,
    ];

    const nnn = opcode & 0x0fff;
    const kk = opcode & 0x00ff;
    const x = nibbles[1]; // first register index
    const y = nibbles[2]; // second register index
    const n = nibbles[3]; // additional extra value, e.g. sprite height

    // nibbles[0] - instruction category
    switch (nibbles[0]) {
      case 0x0:
        if (opcode === 0x00e0) {
          // CLS - clear the display
          this.gfx.fill(0);
          this.drawFlag = true;
          if (this.onDraw) {
            this.onDraw(this.GetScreen(), this.width, this.height);
          }
        } else if (opcode === 0x00ee) {
          // RET - return from subroutine
          this.sp -= 1;
          this.pc = this.stack[this.sp];
        } else {
          // 0nnn - SYS addr (ignored)
        }

        break;

      case 0x1:
        // JP addr
        this.pc = nnn;
        break;

      case 0x2:
        // CALL addr
        this.stack[this.sp] = this.pc;
        this.sp += 1;
        this.pc = nnn;
        break;

      case 0x3:
        // SE Vx, byte
        if (this.V[x] === kk) {
          this.pc += 2;
        }

        break;

      case 0x4:
        // SNE Vx, byte
        if (this.V[x] !== kk) {
          this.pc += 2;
        }

        break;

      case 0x5:
        // SE Vx, Vy
        if (this.V[x] === this.V[y]) {
          this.pc += 2;
        }

        break;

      case 0x6:
        // LD Vx, byte
        this.V[x] = kk;
        break;

      case 0x7:
        // ADD Vx, byte
        this.V[x] = (this.V[x] + kk) & 0xff;
        break;

      case 0x8:
        switch (n) {
          case 0x0:
            // LD Vx, Vy
            this.V[x] = this.V[y];
            break;

          case 0x1:
            // OR Vx, Vy
            this.V[x] |= this.V[y];
            break;

          case 0x2:
            // AND Vx, Vy
            this.V[x] &= this.V[y];
            break;

          case 0x3:
            // XOR Vx, Vy
            this.V[x] ^= this.V[y];
            break;

          case 0x4:
            // ADD Vx, Vy (set VF when carry)
            const sum = this.V[x] + this.V[y];
            this.V[0xf] = sum > 0xff ? 1 : 0;
            this.V[x] = sum & 0xff;
            break;

          case 0x5:
            // SUB Vx, Vy (VF = NOT borrow)
            this.V[0xf] = this.V[x] > this.V[y] ? 1 : 0;
            this.V[x] = (this.V[x] - this.V[y]) & 0xff;
            break;

          case 0x6:
            // SHR Vx {, Vy}
            this.V[0xf] = this.V[x] & 0x1;
            this.V[x] = this.V[x] >> 1;
            break;

          case 0x7:
            // SUBN Vx, Vy (VF = NOT borrow)
            this.V[0xf] = this.V[y] > this.V[x] ? 1 : 0;
            this.V[x] = (this.V[y] - this.V[x]) & 0xff;
            break;

          case 0xe:
            // SHL Vx {, Vy}
            this.V[0xf] = (this.V[x] & 0x80) >> 7;
            this.V[x] = (this.V[x] << 1) & 0xff;
            break;

          default:
            // Unknown
            break;
        }

        break;

      case 0x9:
        // SNE Vx, Vy
        if (this.V[x] !== this.V[y]) {
          this.pc += 2;
        }

        break;

      case 0xa:
        // LD I, addr
        this.I = nnn;
        break;

      case 0xb:
        // JP V0, addr
        this.pc = nnn + this.V[0];
        break;

      case 0xc:
        // RND Vx, byte
        this.V[x] = Math.floor(Math.random() * 0xff) & kk & 0xff;
        break;

      case 0xd:
        // DRW Vx, Vy, nibble - draw sprite
        this.V[0xf] = 0;
        const vx = this.V[x];
        const vy = this.V[y];
        const height = n;

        for (let row = 0; row < height; row++) {
          const spriteByte = this.memory[this.I + row];

          for (let bit = 0; bit < 8; bit++) {
            const px = (vx + bit) % this.width;
            const py = (vy + row) % this.height;
            const pixelIndex = px + py * this.width;
            const spritePixel = (spriteByte >> (7 - bit)) & 0x1;

            if (spritePixel === 1) {
              if (this.gfx[pixelIndex] === 1) {
                this.V[0xf] = 1;
              }

              this.gfx[pixelIndex] ^= 1;
            }
          }
        }

        this.drawFlag = true;

        if (this.onDraw) {
          this.onDraw(this.GetScreen(), this.width, this.height);
        }

        break;

      case 0xe:
        if (kk === 0x9e) {
          // SKP Vx
          if (this.key[this.V[x]] === 1) {
            this.pc += 2;
          }
        } else if (kk === 0xa1) {
          // SKNP Vx
          if (this.key[this.V[x]] === 0) {
            this.pc += 2;
          }
        }

        break;

      case 0xf:
        switch (kk) {
          case 0x07:
            // LD Vx, DT
            this.V[x] = this.delayTimer;
            break;

          case 0x0a:
            // LD Vx, K - wait for key press
            {
              let keyPressed = false;

              for (let i = 0; i < 16; i++) {
                if (this.key[i] === 1) {
                  this.V[x] = i;
                  keyPressed = true;
                  break;
                }
              }

              if (!keyPressed) {
                // Repeat this instruction by moving PC back 2
                this.pc -= 2;
              }
            }

            break;

          case 0x15:
            // LD DT, Vx
            this.delayTimer = this.V[x];
            break;

          case 0x18:
            // LD ST, Vx
            this.soundTimer = this.V[x];
            break;

          case 0x1e:
            // ADD I, Vx
            this.I = (this.I + this.V[x]) & 0xffff;
            break;

          case 0x29:
            // LD F, Vx - set I to location of sprite for digit Vx
            this.I = 0x50 + this.V[x] * 5;
            break;

          case 0x33:
            // LD B, Vx - store BCD representation of Vx in memory I, I+1, I+2
            this.memory[this.I] = Math.floor(this.V[x] / 100);
            this.memory[this.I + 1] = Math.floor((this.V[x] % 100) / 10);
            this.memory[this.I + 2] = this.V[x] % 10;
            break;

          case 0x55:
            // LD [I], Vx - store V0..Vx in memory starting at I
            for (let i = 0; i <= x; i++) {
              this.memory[this.I + i] = this.V[i];
            }

            break;

          case 0x65:
            // LD Vx, [I] - read V0..Vx from memory starting at I
            for (let i = 0; i <= x; i++) {
              this.V[i] = this.memory[this.I + i];
            }

            break;

          default:
            // Unknown
            break;
        }

        break;

      default:
        // Unknown opcode
        break;
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
