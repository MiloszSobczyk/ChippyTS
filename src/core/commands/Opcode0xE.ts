import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0xE implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const kk = opcode & 0x00ff;

    if (kk === 0x9e) {
      if (context.keypadState[context.cpuRegisters[x]] === 1) {
        context.programCounter += 2;
      }
    } else if (kk === 0xa1) {
      if (context.keypadState[context.cpuRegisters[x]] === 0) {
        context.programCounter += 2;
      }
    }
  }
}
