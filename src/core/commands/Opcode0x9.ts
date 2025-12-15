import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x9 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;

    if (context.cpuRegisters[x] !== context.cpuRegisters[y]) {
      context.programCounter += 2;
    }
  }
}
