import {IMocks} from "@graphql-tools/mock/typings/types";

export const SchemaMocks: IMocks = {
    EmailAddress: () => 'test@test.com',
    String: () => 'Test string'
};