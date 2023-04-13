export const getResourceName = (name: string, separator: "-" | "_" = "-") =>
    "reinvest" + separator + "${sls:stage}" + separator + name;

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
        Name: "reinvest-${sls:stage}-" + name
    }
});

export const importOutput = (name: string, isGlobal: boolean = false) => ({
    "Fn::ImportValue": "reinvest-" + isGlobal ? "global" : "${sls:stage}" + "-" + name
});

export const importOutputFrom = (name: string) => ({
    "Fn::ImportValue": name
});