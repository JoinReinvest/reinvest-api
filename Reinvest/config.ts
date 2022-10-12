// @ts-nocheck

import * as dotenv from 'dotenv'

dotenv.config({path: '../.env'});

export const NORTH_CAPITAL_CONFIG = {
    CLIENT_ID: process.env.NORTH_CAPITAL_CLIENT_ID as string,
    DEVELOPER_API_KEY: process.env.NORTH_CAPITAL_DEVELOPER_API_KEY as string,
    API_URL: process.env.NORTH_CAPITAL_API_URL as string,
    OFFERING_ID: process.env.NORTH_CAPITAL_OFFERING_ID as string
}

export const VERTALO_CONFIG = {
    CLIENT_ID: process.env.VERTALO_CLIENT_ID as string,
    CLIENT_SECRET: process.env.VERTALO_CLIENT_SECRET as string,
    API_URL: process.env.VERTALO_API_URL as string,
    SECURITY_ID: process.env.VERTALO_SECURITY_ID as string
}
