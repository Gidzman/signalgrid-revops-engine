import dotenv from 'dotenv';
dotenv.config();

export const config = {
  hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};