export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: T | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as T)
    : null;

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}
