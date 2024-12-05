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

  exampleMethod<T extends string | undefined>(
    param?: T,
  ): T extends string ? number : boolean {
    if (param) {
      return param.length as T extends string ? number : boolean;
    } else {
      return true as T extends string ? number : boolean;
    }
  }

  public text = {
    get: async (id: string): Promise<TextModerationResponse> => {
      const response = await this.performRequest(`/text/${id}`, {
        method: 'GET',
      });
      return response;
    },

    moderate: async <
      T extends
        | { callbackUrl?: string; metadata?: Record<string, any> }
        | { metadata?: Record<string, any> },
    >(
      text: string,
      options?: T,
    ): Promise<
      T extends { callbackUrl: string }
        ? { id: string }
        : TextModerationResponse
    > => {
      const response = await this.performRequest(`/text`, {
        method: 'POST',
        body: {
          text,
          options,
        },
      });

      return response as T extends { callbackUrl: string }
        ? { id: string }
        : TextModerationResponse;
    },
  };

  public image = {
    moderate: async <
      T extends
        | { callbackUrl?: string; metadata?: Record<string, any> }
        | { metadata?: Record<string, any> },
    >(
      image: string,
      options?: T,
    ): Promise<
      T extends { callbackUrl: string }
        ? { id: string }
        : TextModerationResponse
    > => {
      const response = await this.performRequest(`/image`, {
        method: 'POST',
        body: {
          image,
          options,
        },
      });
      return response as T extends { callbackUrl: string }
        ? { id: string }
        : TextModerationResponse;
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
