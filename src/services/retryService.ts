export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<{ success: boolean; data?: T; error?: any; attempts: number }> {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    try {
      const result = await operation();
      return { success: true, data: result, attempts };
    } catch (error: any) {
      if (attempts >= maxRetries) {
        return { success: false, error, attempts };
      }
      // Exponential backoff delay
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempts - 1)));
    }
  }
  return { success: false, error: new Error('Max retries exceeded'), attempts };
}