type LlmOptions = {
  envPrefix: string;
  defaultModel: string;
};

type ResolvedLlmConfig = {
  apiKey: string | null;
  apiUrl: string | null;
  model: string;
  provider: "generic" | "openai";
};

export function resolveLlmConfig(options: LlmOptions): ResolvedLlmConfig {
  const env = process.env;
  const apiKey =
    env[`${options.envPrefix}_API_KEY`] ||
    env.LLM_API_KEY ||
    env.OPENAI_API_KEY ||
    null;
  const apiUrl =
    env[`${options.envPrefix}_API_URL`] ||
    env.LLM_API_URL ||
    env.OPENAI_BASE_URL ||
    (env.OPENAI_API_KEY ? "https://api.openai.com/v1/responses" : null);
  const model =
    env[`${options.envPrefix}_MODEL`] ||
    env.LLM_MODEL ||
    env.OPENAI_MODEL ||
    options.defaultModel;

  return {
    apiKey,
    apiUrl,
    model,
    provider:
      apiUrl === "https://api.openai.com/v1/responses" || Boolean(env.OPENAI_API_KEY)
        ? "openai"
        : "generic",
  };
}

export async function invokeLlmJson(input: {
  envPrefix: string;
  defaultModel: string;
  prompt: string;
}): Promise<string | null> {
  const config = resolveLlmConfig({
    envPrefix: input.envPrefix,
    defaultModel: input.defaultModel,
  });

  if (!config.apiKey || !config.apiUrl) {
    return null;
  }

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: input.prompt,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Record<string, unknown>;
  return config.provider === "openai" ? extractOpenAiText(data) : extractGenericText(data);
}

function extractGenericText(data: Record<string, unknown>): string | null {
  if (typeof data.output === "string") return data.output;
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.text === "string") return data.text;
  return null;
}

function extractOpenAiText(data: Record<string, unknown>): string | null {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const output = data.output;
  if (!Array.isArray(output)) {
    return null;
  }

  const texts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const content = record.content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const piece = part as Record<string, unknown>;
      if (piece.type === "output_text" && typeof piece.text === "string") {
        texts.push(piece.text);
      }
    }
  }

  return texts.length > 0 ? texts.join("\n") : null;
}
