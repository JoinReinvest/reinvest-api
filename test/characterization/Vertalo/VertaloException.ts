export default class VertaloException extends Error {
    metadata: any = {}
    reason: string;

    constructor(reason: string, metadata: any = {}) {
        super(`Request error: ${reason}`);
        this.reason = reason;
        this.metadata = metadata;
    }

    getMetadata(): any {
        return this.metadata;
    }
}