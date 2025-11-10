# ChippyTS

A CHIP-8 interpreter implemented in TypeScript and React, modeled after [Chippy](https://github.com/MiloszSobczyk/Chippy).

## Features

- Written entirely in **TypeScript** for type safety.
- React-based **UI** with canvas rendering.
- Supports loading and running CHIP-8 ROMs.
- Keyboard input mapping for CHIP-8 hex keypad.
- Optional memory/register visualizer for debugging.

## Prerequisites

Make sure you have **Node.js** and **npm** installed.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MiloszSobczyk/ChippyTS.git
cd ChippyTS
npm install
```

## Development mode

Run the app in development mode with hot module replacement:

```bash
npm run dev
```

## Release Mode

Build the app for production:

```bash
npm run build
```

This create an optimized build in the `dist/` folder. You can preview it locally by running:

```bash
npm run preview
```
