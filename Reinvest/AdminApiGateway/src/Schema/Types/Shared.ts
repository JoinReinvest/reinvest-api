const schema = `
    #graphql
    """
    If not provided, default pagination is page: 0, perPage: 10
    """
    input Pagination {
        page: Int! = 0
        perPage: Int! = 10
    }

    "Link id + PUT url to store resource in the storage"
    type PutFileLink {
        id: ID
        url: String
    }

    "Link id + url to read the document"
    type GetDocumentLink {
        id: ID
        url: String
    }
    
    type USD {
        value: Money!,
        formatted: String
    }
`;
export const Shared = {
  typeDefs: schema,
};
