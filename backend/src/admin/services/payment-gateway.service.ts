import { Injectable, Logger } from '@nestjs/common';

/**
 * PaymentGatewayService — Mock Saga Pattern
 *
 * Simulates a third-party payment gateway for refund processing.
 * Uses a 2-second delay to mimic network latency and a 95% success rate
 * to demonstrate handling of external side-effects.
 */
@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  /**
   * Simulate issuing a refund via an external payment gateway.
   * @param pnr The booking PNR
   * @param amount The refund amount in INR
   * @returns Promise resolving to a RefundResult
   */
  async issueRefund(
    pnr: string,
    amount: number,
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    this.logger.log(
      `[MOCK GATEWAY] Processing refund for PNR ${pnr}, amount ₹${amount}...`,
    );

    // Simulate network latency (2.0 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 95% success rate
    const isSuccess = Math.random() < 0.95;

    const transactionId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (isSuccess) {
      this.logger.log(
        `[MOCK GATEWAY] ✅ Refund successful — txn: ${transactionId}`,
      );
      return {
        success: true,
        transactionId,
        message: `Refund of ₹${amount} processed successfully`,
      };
    } else {
      this.logger.warn(
        `[MOCK GATEWAY] ❌ Refund failed — txn: ${transactionId}`,
      );
      return {
        success: false,
        transactionId,
        message:
          'Payment gateway temporarily unavailable. Please retry in a few minutes.',
      };
    }
  }
}
