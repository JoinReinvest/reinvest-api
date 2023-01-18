export class NoMigrationException extends Error {
    static throw(message: string) {
        throw new NoMigrationException(message);
    }
}
