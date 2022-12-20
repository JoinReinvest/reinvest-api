export const getResourceName = (name: string, separator: '-' | '_' = '-') => '${self:service}' + separator + '${sls:stage}' + separator + name;

export const getResourceNameTag = (name: string) => ({
    Key: 'Name',
    Value: getResourceName(name)
})

export const getAttribute = (resource: string, attribute: string) => ({
    "Fn::GetAtt": [resource, attribute]
})

export const joinAttributes = (delimiter: string, attributes: any[]) => ({
    "Fn::Join": [delimiter, attributes]
})