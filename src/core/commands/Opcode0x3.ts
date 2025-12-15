import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x3 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const kk = opcode & 0x00ff;

    if (context.cpuRegisters[x] === kk) {
      context.programCounter += 2;
    }
  }
}
