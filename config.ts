// @ts-nocheck

import * as dotenv from 'dotenv'

dotenv.config({path: '.env'});

export const NORTH_CAPITAL_CONFIG = {
    CLIENT_ID: process.env.NORTH_CAPITAL_CLIENT_ID,
    DEVELOPER_API_KEY: process.env.NORTH_CAPITAL_DEVELOPER_API_KEY,
    API_URL: process.env.NORTH_CAPITAL_API_URL,
    OFFERING_ID: process.env.NORTH_CAPITAL_OFFERING_ID
}

export const VERTALO_CONFIG = {
    CLIENT_ID: process.env.VERTALO_CLIENT_ID,
    CLIENT_SECRET: process.env.VERTALO_CLIENT_SECRET,
    API_URL: process.env.VERTALO_API_URL,
    SECURITY_ID: process.env.VERTALO_SECURITY_ID
}
