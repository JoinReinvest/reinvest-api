// = 'created' | 'funded' | 'settled' | 'canceled';
export enum OrderStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  CANCELED = 'canceled',
  UNWIND_PENDING = 'unwind pending',
  UNWIND_SETTLED = 'unwind settled',
  SETTLED = 'settled',
  NOT_SET = 'not set',
}

export class TradeStatus {
  private readonly orderStatus: OrderStatus;

  constructor(orderStatus: OrderStatus) {
    this.orderStatus = orderStatus;
  }

  static fromResponse(orderStatus: string | null): TradeStatus {
    if (!orderStatus) {
      return new TradeStatus(OrderStatus.NOT_SET);
    }

    const status = orderStatus.toLowerCase() as OrderStatus;

    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error(`Invalid order status: ${orderStatus}`);
    }

    return new TradeStatus(status);
  }

  toString(): OrderStatus {
    return this.orderStatus;
  }

  isFunded(): boolean {
    return this.orderStatus === OrderStatus.FUNDED;
  }

  isSettled(): boolean {
    return this.orderStatus === OrderStatus.SETTLED;
  }

  isCreated(): boolean {
    return this.orderStatus === OrderStatus.CREATED;
  }

  isSet(): boolean {
    return this.orderStatus !== OrderStatus.NOT_SET;
  }

  isCanceled(): boolean {
    return this.orderStatus === OrderStatus.CANCELED || this.orderStatus === OrderStatus.UNWIND_SETTLED;
  }

  isUnwindPending(): boolean {
    return this.orderStatus === OrderStatus.UNWIND_PENDING;
  }

  isUnwindSettled(): boolean {
    return this.orderStatus === OrderStatus.UNWIND_SETTLED;
  }
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  SETTLED = 'settled',
  RETURNED = 'returned',
  VOIDED = 'voided',
  DECLINED = 'declined',
}

export class TradePaymentStatus {
  private readonly paymentStatus: PaymentStatus;

  constructor(paymentStatus: PaymentStatus) {
    this.paymentStatus = paymentStatus;
  }

  static fromResponse(paymentStatus: string | null): TradePaymentStatus {
    if (!paymentStatus) {
      return new TradePaymentStatus(PaymentStatus.PENDING);
    }

    const status = paymentStatus.toLowerCase() as PaymentStatus;

    if (!Object.values(PaymentStatus).includes(status)) {
      throw new Error(`Invalid payment status: ${paymentStatus}`);
    }

    return new TradePaymentStatus(status);
  }

  toString(): PaymentStatus {
    return this.paymentStatus;
  }

  isFailed(): boolean {
    return [PaymentStatus.RETURNED, PaymentStatus.VOIDED, PaymentStatus.DECLINED].includes(this.paymentStatus);
  }
}
