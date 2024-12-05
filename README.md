# ContentMod TypeScript SDK

This is the repository for the ContentMod TypeScript SDK.

Checkout our docs at [https://docs.contentmod.io](https://docs.contentmod.io)

## Installation

```bash
npm install @contentmod/sdk
```

## Usage

```ts
import { ContentMod } from '@contentmod/sdk';

const contentMod = new ContentMod({
  secretKey: 'YOUR_SECRET_KEY',
  publicKey: 'YOUR_PUBLIC_KEY',
});

const textModerationResponse = await contentMod.text.moderate('Hello world!');

const imageModerationResponse = await contentMod.image.moderate(
  'https://example.com/image.jpg',
);
```
