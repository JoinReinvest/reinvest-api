import CommandType from "../../shared/SimpleAggregator/CommandType";

export type ProfileCommand = CommandType;

export const profileCommands = {
    CreateProfile: 'CreateProfile',
    AttachIndividualToProfile: 'AttachIndividualToProfile'
}

export function createCommand(kind: string, data = {}): ProfileCommand {
    return {
        kind,
        data,
    }
}

export type AttachIndividualToProfile = ProfileCommand & {
    kind: 'AttachIndividualToProfile',
    data: {
        individualId: string,
    }
}