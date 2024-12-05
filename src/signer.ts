import type { SignType } from './types';

export class ContentModSigner {
  private host: string;
  private publicKey: string;
  private datetime: string;
  private secretKey: string;
  private expires: number = 3600;
  private type: SignType;
  private metadata: Record<string, any> | null;

  constructor(params: {
    publicKey: string;
    host: string;
    secretKey: string;
    expires: number;
    type?: SignType;
    metadata?: Record<string, any>;
  }) {
    this.host = params.host;
    this.publicKey = params.publicKey;
    this.datetime = new Date().toISOString();
    this.secretKey = params.secretKey;
    this.expires = params.expires;
    this.type = params.type || 'text';
    this.metadata = params.metadata || null;
  }

  async generateUrl() {
    const id = crypto.randomUUID();
    const signature = await this.generateSignature(id);
    const url = new URL(`${this.host}/public/${id}`);
    url.searchParams.set('signature', signature);
    url.searchParams.set('publicKey', this.publicKey);
    url.searchParams.set('datetime', this.datetime);
    url.searchParams.set('expires', this.expires.toString());
    url.searchParams.set('type', this.type);
    if (this.metadata) {
      url.searchParams.set('metadata', JSON.stringify(this.metadata));
    }
    return {
      id: id,
      url: url.toString(),
    };
  }

  async generateSignature(id: string) {
    const toSign = `${this.host}/public/${id}`;
    const dateKey = await HMAC('cmod' + this.secretKey, this.datetime);
    const publicKeyKey = await HMAC(dateKey, `pub-${this.publicKey}`);
    const expiresKey = await HMAC(
      publicKeyKey,
      `exp-${this.expires.toString()}`,
    );
    const actionKey = await HMAC(expiresKey, `type-${this.type}`);
    const signingKey = await HMAC(actionKey, 'contentmod_request');
    const signature = buf2hex(await HMAC(signingKey, toSign));
    return signature;
  }
}

const encoder = new TextEncoder();

async function HMAC(key: ArrayBuffer | string, str: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? encoder.encode(key) : key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(str));
}

const HEX_CHARS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
];

function buf2hex(arrayBuffer: ArrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  let out = '';
  for (let idx = 0; idx < buffer.length; idx++) {
    const n = buffer[idx];
    if (n) {
      out += HEX_CHARS[(n >>> 4) & 0xf];
      out += HEX_CHARS[n & 0xf];
    }
  }
  return out;
}
