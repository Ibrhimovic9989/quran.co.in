// Batch Processor
// Handles parallel processing with rate limiting and error handling

export interface BatchProcessorOptions {
  batchSize?: number;
  concurrency?: number;
  retries?: number;
  retryDelay?: number;
}

export class BatchProcessor<T, R> {
  private batchSize: number;
  private concurrency: number;
  private retries: number;
  private retryDelay: number;

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize || 10;
    this.concurrency = options.concurrency || 5;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Process items in batches with concurrency control
   */
  async processBatches(
    items: T[],
    processor: (item: T) => Promise<R>,
    onProgress?: (processed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    const total = items.length;
    let processed = 0;

    // Split into batches
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await this.processBatch(batch, processor);
      results.push(...batchResults);
      processed += batch.length;
      
      if (onProgress) {
        onProgress(processed, total);
      }
    }

    return results;
  }

  /**
   * Process a single batch with concurrency limit
   */
  private async processBatch(
    batch: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    const chunks: T[][] = [];

    // Split batch into concurrent chunks
    for (let i = 0; i < batch.length; i += this.concurrency) {
      chunks.push(batch.slice(i, i + this.concurrency));
    }

    // Process chunks sequentially, items within chunk concurrently
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(item => this.processWithRetry(item, processor))
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch processing error:', result.reason);
        }
      }
    }

    return results;
  }

  /**
   * Process item with retry logic
   */
  private async processWithRetry(
    item: T,
    processor: (item: T) => Promise<R>
  ): Promise<R> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        return await processor(item);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.retries - 1) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Processing failed after retries');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
