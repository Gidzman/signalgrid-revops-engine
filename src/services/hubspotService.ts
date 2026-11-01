import axios from 'axios';

export interface HubSpotContactPayload {
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    jobtitle: string;
    company: string;
    domain: string;
  }
}

export async function syncContactToHubSpot(payload: HubSpotContactPayload, accessToken: string): Promise<any> {
  const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
  
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { 
      success: false, 
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message 
    };
  }
}