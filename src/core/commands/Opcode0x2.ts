import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x2 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    context.stack[context.stackPointer] = context.programCounter;
    context.stackPointer += 1;
    context.programCounter = opcode & 0x0fff;
  }
}
