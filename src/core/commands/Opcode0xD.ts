import type { Chip8Context } from "@core/Chip8Context";
import type { OpcodeCommand } from "./OpcodeCommand";

export class Opcode0xD implements OpcodeCommand {
  public Execute(opcode: number, context: Chip8Context): void {
    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;
    const n = opcode & 0x000f;

    const vx = context.cpuRegisters[x];
    const vy = context.cpuRegisters[y];

    context.cpuRegisters[0xf] = 0;

    for (let row = 0; row < n; row++) {
      const spriteByte = context.memory[context.indexRegister + row];

      for (let bit = 0; bit < 8; bit++) {
        const px = (vx + bit) % context.width;
        const py = (vy + row) % context.height;
        const index = px + py * context.width;
        const spritePixel = (spriteByte >> (7 - bit)) & 1;

        if (spritePixel === 1) {
          if (context.graphics[index] === 1) {
            context.cpuRegisters[0xf] = 1;
          }

          context.graphics[index] ^= 1;
        }
      }
    }

    context.drawFlag = true;

    if (context.onDraw) {
      context.onDraw(context.graphics.slice(), context.width, context.height);
    }
  }
}
