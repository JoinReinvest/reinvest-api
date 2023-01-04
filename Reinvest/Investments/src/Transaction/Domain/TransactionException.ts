export class TransactionException extends Error {
  static throw(message: string) {
    throw new TransactionException(message);
  }
}
