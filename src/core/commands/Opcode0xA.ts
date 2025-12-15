import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0xA implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    context.indexRegister = opcode & 0x0fff;
  }
}
