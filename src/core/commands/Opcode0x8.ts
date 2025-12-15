import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x8 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;
    const n = opcode & 0x000f;

    switch (n) {
      case 0x0:
        context.cpuRegisters[x] = context.cpuRegisters[y];
        break;

      case 0x1:
        context.cpuRegisters[x] |= context.cpuRegisters[y];
        break;

      case 0x2:
        context.cpuRegisters[x] &= context.cpuRegisters[y];
        break;

      case 0x3:
        context.cpuRegisters[x] ^= context.cpuRegisters[y];
        break;

      case 0x4: {
        const sum = context.cpuRegisters[x] + context.cpuRegisters[y];
        context.cpuRegisters[0xf] = sum > 0xff ? 1 : 0;
        context.cpuRegisters[x] = sum & 0xff;
        break;
      }

      case 0x5:
        context.cpuRegisters[0xf] = context.cpuRegisters[x] > context.cpuRegisters[y] ? 1 : 0;
        context.cpuRegisters[x] = (context.cpuRegisters[x] - context.cpuRegisters[y]) & 0xff;
        break;

      case 0x6:
        context.cpuRegisters[0xf] = context.cpuRegisters[x] & 1;
        context.cpuRegisters[x] >>= 1;
        break;

      case 0x7:
        context.cpuRegisters[0xf] = context.cpuRegisters[y] > context.cpuRegisters[x] ? 1 : 0;
        context.cpuRegisters[x] = (context.cpuRegisters[y] - context.cpuRegisters[x]) & 0xff;
        break;

      case 0xe:
        context.cpuRegisters[0xf] = (context.cpuRegisters[x] & 0x80) >> 7;
        context.cpuRegisters[x] = (context.cpuRegisters[x] << 1) & 0xff;
        break;
    }
  }
}
