export class VertaloException extends Error {
    metadata: any = {}
    statusCode: number;
    reason: string;

    constructor(statusCode: number, reason: string, metadata: any = {}) {
        super(`Request error: [${statusCode}] ${reason}`);
        this.statusCode = statusCode;
        this.reason = reason;
        this.metadata = metadata;
    }

    getMetadata(): any {
        return this.metadata;
    }

    getStatus() {
        return this.statusCode;
    }
}