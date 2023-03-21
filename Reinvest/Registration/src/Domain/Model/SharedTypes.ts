export enum DomicileType {
    CITIZEN = "CITIZEN",
    GREEN_CARD = "GREEN_CARD",
    VISA = "VISA",
}

export type Address = {
    addressLine1: string
    addressLine2?: string
    city: string
    zip: string
    country: string
    state: string
};
