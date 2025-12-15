import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0xC implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const kk = opcode & 0x00ff;

    context.cpuRegisters[x] = Math.floor(Math.random() * 0xff) & kk & 0xff;
  }
}
