import { ContentModSigner } from './signer';
import type { SignType, TextModerationResponse } from './types';
export class ContentMod {
  private secretKey: string;
  private publicKey: string;

  private url = 'https://api.contentmod.io';

  constructor(params: { secretKey: string; publicKey: string; url?: string }) {
    this.secretKey = params.secretKey;
    this.publicKey = params.publicKey;
    if (params.url?.length) {
      this.url = params.url;
    }
  }

  public text = {
    get: async (id: string): Promise<TextModerationResponse> => {
      const response = await this.performRequest(`/text/${id}`, {
        method: 'GET',
      });
      return response;
    },
    moderate: async (
      text: string,
      options?: {
        meta?: Record<string, any>;
      },
    ): Promise<TextModerationResponse> => {
      const response = await this.performRequest(`/text`, {
        method: 'POST',
        body: {
          text,
          options,
        },
      });
      return response;
    },
  };

  public image = {
    moderate: async (
      image: string, // Url or base64 encoded image
      options?: {
        meta?: Record<string, any>;
      },
    ) => {
      const response = await this.performRequest(`/image`, {
        method: 'POST',
        body: {
          image,
          options,
        },
      });
      return response;
    },
  };

  public sign(params: {
    type: SignType;
    metadata?: Record<string, any>;
    expires?: number;
  }) {
    const signer = new ContentModSigner({
      publicKey: this.publicKey,
      host: this.url,
      secretKey: this.secretKey,
      expires: params.expires || 3600,
      type: params.type,
      metadata: params.metadata,
    });

    return signer.generateUrl();
  }

  private async performRequest(
    path: string,
    params: { method: string; body?: any; headers?: Record<string, string> },
  ) {
    const response = await fetch(`${this.url}${path}`, {
      method: params.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: JSON.stringify(params.body),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API Key');
      } else {
        throw new Error(response.statusText);
      }
    } else {
      const json = await response.json();
      return json;
    }
  }
}
