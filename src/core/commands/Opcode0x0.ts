import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0x0 implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    if (opcode === 0x00e0) {
      context.graphics.fill(0);
      context.drawFlag = true;

      if (context.onDraw) {
        context.onDraw(context.graphics.slice(), context.width, context.height);
      }
    } else if (opcode === 0x00ee) {
      context.stackPointer -= 1;
      context.programCounter = context.stack[context.stackPointer];
    }
  }
}
