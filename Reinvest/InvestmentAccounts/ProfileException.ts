export class ProfileException extends Error {
  static throw(message: string) {
    throw new ProfileException(message);
  }
}
