export async function retry<T>(
  fn: () => Promise<T>,
  { retries = 2, delay = 250 }: { retries?: number; delay?: number } = {},
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt)),
      );
      attempt += 1;
    }
  }
  throw lastError;
}

