import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x7 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    context.cpuRegisters[x] = (context.cpuRegisters[x] + (opcode & 0x00ff)) & 0xff;
  }
}
