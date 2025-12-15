import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0xF implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const kk = opcode & 0x00ff;

    switch (kk) {
      case 0x07:
        context.cpuRegisters[x] = context.delayTimer;
        break;

      case 0x0a: {
        let keyPressed = false;

        for (let i = 0; i < 16; i++) {
          if (context.keypadState[i] === 1) {
            context.cpuRegisters[x] = i;
            keyPressed = true;
            break;
          }
        }

        if (!keyPressed) {
          context.programCounter -= 2;
        }

        break;
      }

      case 0x15:
        context.delayTimer = context.cpuRegisters[x];
        break;

      case 0x18:
        context.soundTimer = context.cpuRegisters[x];
        break;

      case 0x1e:
        context.indexRegister = (context.indexRegister + context.cpuRegisters[x]) & 0xffff;
        break;

      case 0x29:
        context.indexRegister = 0x50 + context.cpuRegisters[x] * 5;
        break;

      case 0x33:
        context.memory[context.indexRegister] = Math.floor(context.cpuRegisters[x] / 100);
        context.memory[context.indexRegister + 1] = Math.floor(
          (context.cpuRegisters[x] % 100) / 10,
        );
        context.memory[context.indexRegister + 2] = context.cpuRegisters[x] % 10;
        break;

      case 0x55:
        for (let i = 0; i <= x; i++) {
          context.memory[context.indexRegister + i] = context.cpuRegisters[i];
        }
        break;

      case 0x65:
        for (let i = 0; i <= x; i++) {
          context.cpuRegisters[i] = context.memory[context.indexRegister + i];
        }
        break;
    }
  }
}
