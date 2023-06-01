export class ReinvestmentException extends Error {
  static throw(message: string) {
    throw new ReinvestmentException(message);
  }
}
