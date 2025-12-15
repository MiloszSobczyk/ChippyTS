import type { Chip8Context } from "@core/Chip8Context";

export interface OpcodeCommand {
  Execute(opcode: number, context: Chip8Context): void;
}
