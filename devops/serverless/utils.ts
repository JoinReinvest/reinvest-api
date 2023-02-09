export const getResourceName = (name: string, separator: "-" | "_" = "-") =>
    "${self:service}" + separator + "${sls:stage}" + separator + name;

export const getResourceNameTag = (name: string) => ({
    Key: "Name",
    Value: getResourceName(name),
});

export const getAttribute = (resource: string, attribute: string) => ({
    "Fn::GetAtt": [resource, attribute],
});

export const joinAttributes = (delimiter: string, attributes: any[]) => ({
    "Fn::Join": [delimiter, attributes],
});

export const exportOutput = (name: string) => ({
    Export: {
        Name: "${env:APPLICATION_NAME}-${sls:stage}-" + name
    }
});

export const importOutput = (name: string) => ({
    "Fn::ImportValue": "${env:APPLICATION_NAME}-${sls:stage}-" + name
});

export const importOutputFrom = (name: string) => ({
    "Fn::ImportValue": name
});