import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x1 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    context.programCounter = opcode & 0x0fff;
  }
}
