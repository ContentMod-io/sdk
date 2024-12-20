import { ContentModSigner } from './signer';
import type {
  QueueItemResponse,
  SignType,
  TextModerationResponse,
  WebhookBody,
  WebhookData,
  WebhookEvent,
} from './types';
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

    moderate: async <
      T extends
        | {
            callbackUrl?: string;
            defer?: boolean;
            metadata?: Record<string, any>;
            actorId?: string;
          }
        | { metadata?: Record<string, any>; actorId?: string },
    >(
      text: string,
      options?: T,
    ): Promise<
      T extends { callbackUrl: string } | { defer: boolean }
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

      return response as T extends { callbackUrl: string } | { defer: boolean }
        ? { id: string }
        : TextModerationResponse;
    },
  };

  public image = {
    moderate: async <
      T extends
        | {
            callbackUrl?: string;
            metadata?: Record<string, any>;
            actorId?: string;
            defer?: boolean;
          }
        | { metadata?: Record<string, any>; actorId?: string },
    >(
      image: string,
      options?: T,
    ): Promise<
      T extends { callbackUrl: string } | { defer: boolean }
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
      return response as T extends { callbackUrl: string } | { defer: boolean }
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

  public queue(queueId: string) {
    return {
      getItem: async (id: string): Promise<QueueItemResponse> => {
        const response = await this.performRequest(
          `/queues/${queueId}/items/${id}`,
          {
            method: 'GET',
          },
        );
        return response;
      },
      addItem: async (params: {
        type: 'text' | 'image';
        content: string;
        metadata?: Record<string, any>;
        actorId?: string;
      }): Promise<{
        id: string;
        status: 'processing' | 'pending';
      }> => {
        const response = await this.performRequest(`/queues/${queueId}`, {
          method: 'POST',
          body: params,
        });
        return response;
      },
    };
  }

  public parseWebhook(data: WebhookBody<WebhookEvent>) {
    switch (data.event) {
      case 'moderation.completed':
        return {
          event: data.event,
          data: data.data as TextModerationResponse,
        };
      case 'queue.review.completed':
        return {
          event: data.event,
          data: data.data as QueueItemResponse,
        };
      default:
        return {
          event: data.event,
          data: data.data as TextModerationResponse,
        };
    }
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
