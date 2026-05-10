type FetchJsonOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const detail = payload.detail ?? payload.message ?? payload.error;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
        .join(", ");
    }
    if (detail) {
      return JSON.stringify(detail);
    }
  } catch {
    // Ignore non-JSON error bodies and fall back to the status-based message.
  }

  return fallback;
}

export async function requestJson<T>(urls: string[], options: FetchJsonOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: string | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let lastError: Error | null = null;

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    try {
      const response = await fetch(url, {
        method: options.method ?? (body ? "POST" : "GET"),
        credentials: "include",
        headers,
        body,
      });

      if (response.ok) {
        if (response.status === 204) {
          return undefined as T;
        }

        const text = await response.text();
        if (!text) {
          return undefined as T;
        }

        return JSON.parse(text) as T;
      }

      if (response.status === 404 && index < urls.length - 1) {
        continue;
      }

      throw new Error(await readErrorMessage(response));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
      if (index < urls.length - 1) {
        continue;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}