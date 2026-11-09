// src/lib/ai/adapters.ts
// Universal AI Provider Adapter Layer (Server-Side Only)

export interface GenerateInput {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  timeoutMs?: number;
  searchGrounding?: boolean;
}

export interface GenerateOutput {
  text: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  latency_ms: number;
}

export type AdapterErrorType = 
  | "invalid_key" 
  | "credit_exhausted" 
  | "rate_limited" 
  | "server_error" 
  | "timeout" 
  | "invalid_response" 
  | "connection_error";

export class AdapterError extends Error {
  status: number;
  provider: string;
  errorType: AdapterErrorType;

  constructor(status: number, message: string, provider: string, errorType: AdapterErrorType) {
    super(`[${provider.toUpperCase()} ${status}] ${message}`);
    this.name = "AdapterError";
    this.status = status;
    this.provider = provider;
    this.errorType = errorType;
  }
}

/**
 * Classify HTTP response errors based on status code and message.
 */
function classifyError(status: number, message: string, provider: string): AdapterError {
  const lower = message.toLowerCase();

  // 1. Invalid or Bad API Key
  if (
    status === 401 ||
    status === 403 ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("authentication failed") ||
    lower.includes("unauthorized")
  ) {
    return new AdapterError(status, message, provider, "invalid_key");
  }

  // 2. Credit / Quota / Billing Exhausted
  if (
    status === 402 ||
    lower.includes("credit balance") ||
    lower.includes("insufficient quota") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("quota exceeded") ||
    lower.includes("billing")
  ) {
    return new AdapterError(status, message, provider, "credit_exhausted");
  }

  // 3. Rate Limit / 429
  if (status === 429 || lower.includes("rate limit") || lower.includes("too many requests")) {
    return new AdapterError(status, message, provider, "rate_limited");
  }

  // 4. Server 5xx Error
  if (
    status >= 500 && status < 600 ||
    lower.includes("overloaded") ||
    lower.includes("capacity") ||
    lower.includes("internal server error")
  ) {
    return new AdapterError(status, message, provider, "server_error");
  }

  return new AdapterError(status, message, provider, "invalid_response");
}

export interface ModelAdapter {
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

// -------------------------------------------------------------
// 1. Anthropic Adapter
// -------------------------------------------------------------
export class AnthropicAdapter implements ModelAdapter {
  constructor(private apiKey: string, private modelId: string = "claude-haiku-5-5") {}

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const start = Date.now();
    const timeoutMs = input.timeoutMs || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;

    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: input.maxTokens || 600,
          temperature: input.temperature ?? 0.75,
          system: input.system,
          messages: [{ role: "user", content: input.prompt }],
        }),
      });
    } catch (netErr: any) {
      if (netErr.name === "AbortError") {
        throw new AdapterError(504, `Call timed out after ${timeoutMs / 1000}s`, "anthropic", "timeout");
      }
      throw new AdapterError(503, netErr.message || "Network failed", "anthropic", "connection_error");
    } finally {
      clearTimeout(timeoutId);
    }

    const latency = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      throw classifyError(res.status, errText, "anthropic");
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text || "";

    return {
      text,
      usage: {
        input_tokens: data?.usage?.input_tokens || 0,
        output_tokens: data?.usage?.output_tokens || 0,
      },
      latency_ms: latency,
    };
  }
}

// -------------------------------------------------------------
// 2. OpenAI & OpenAI-Compatible Adapter
// -------------------------------------------------------------
export class OpenAIAdapter implements ModelAdapter {
  private baseUrl: string;

  constructor(
    private apiKey: string, 
    private modelId: string = "gpt-4o-mini",
    baseUrl?: string,
    private providerName: string = "openai"
  ) {
    this.baseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : (providerName === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1");
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const start = Date.now();
    const timeoutMs = input.timeoutMs || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
    };

    if (this.providerName === "openrouter") {
      headers["HTTP-Referer"] = "https://zentapdigitalsolutions.com";
      headers["X-Title"] = "ZenTap Digital Solutions";
    }

    const payload: any = {
      model: this.modelId,
      max_tokens: input.maxTokens || 600,
      temperature: input.temperature ?? 0.75,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt },
      ],
    };

    if (input.json) {
      payload.response_format = { type: "json_object" };
    }

    let res: Response;

    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers,
        body: JSON.stringify(payload),
      });
    } catch (netErr: any) {
      if (netErr.name === "AbortError") {
        throw new AdapterError(504, `Call timed out after ${timeoutMs / 1000}s`, this.providerName, "timeout");
      }
      throw new AdapterError(503, netErr.message || "Network failed", this.providerName, "connection_error");
    } finally {
      clearTimeout(timeoutId);
    }

    const latency = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      throw classifyError(res.status, errText, this.providerName);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";

    return {
      text,
      usage: {
        input_tokens: data?.usage?.prompt_tokens || 0,
        output_tokens: data?.usage?.completion_tokens || 0,
      },
      latency_ms: latency,
    };
  }
}

// -------------------------------------------------------------
// 3. Google Gemini Adapter
// -------------------------------------------------------------
export class GoogleAdapter implements ModelAdapter {
  constructor(private apiKey: string, private modelId: string = "gemini-1.5-flash") {}

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const start = Date.now();
    const timeoutMs = input.timeoutMs || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let cleanModel = this.modelId.replace(/^models\//, "");
    if (cleanModel === "gemini-2.5-flash" || cleanModel === "gemini-1.5-flash" || !cleanModel) {
      cleanModel = "gemini-3.5-flash-lite";
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${this.apiKey}`;
    let res: Response;

    const bodyPayload: any = {
      systemInstruction: { parts: [{ text: input.system }] },
      contents: [{ parts: [{ text: input.prompt }] }],
      generationConfig: {
        maxOutputTokens: input.maxTokens || 600,
        temperature: input.temperature ?? 0.75,
      },
    };

    if (input.json) {
      bodyPayload.generationConfig.responseMimeType = "application/json";
    }

    if (input.searchGrounding) {
      bodyPayload.tools = [{ googleSearch: {} }];
    }

    try {
      res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
    } catch (netErr: any) {
      if (netErr.name === "AbortError") {
        throw new AdapterError(504, `Call timed out after ${timeoutMs / 1000}s`, "google", "timeout");
      }
      throw new AdapterError(503, netErr.message || "Network failed", "google", "connection_error");
    } finally {
      clearTimeout(timeoutId);
    }

    const latency = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      throw classifyError(res.status, errText, "google");
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      text,
      usage: {
        input_tokens: data?.usageMetadata?.promptTokenCount || 0,
        output_tokens: data?.usageMetadata?.candidatesTokenCount || 0,
      },
      latency_ms: latency,
    };
  }
}

// -------------------------------------------------------------
// Adapter Factory
// -------------------------------------------------------------
export function createAdapter(
  provider: string,
  apiKey: string,
  modelId: string,
  baseUrl?: string
): ModelAdapter {
  switch (provider.toLowerCase()) {
    case "anthropic":
      return new AnthropicAdapter(apiKey, modelId);
    case "openai":
      return new OpenAIAdapter(apiKey, modelId, baseUrl, "openai");
    case "google":
      return new GoogleAdapter(apiKey, modelId);
    case "openrouter":
      return new OpenAIAdapter(apiKey, modelId, baseUrl || "https://openrouter.ai/api/v1", "openrouter");
    case "openai_compatible":
    default:
      return new OpenAIAdapter(apiKey, modelId, baseUrl, "openai_compatible");
  }
}
