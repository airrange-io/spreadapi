import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getError } from '../../../utils/helper';

//===============================================
// Function
//===============================================

async function getServiceAnalytics(apiId) {
  if (!apiId) return getError("serviceId is required");
  let result = { serviceId: apiId };

  try {
    const serviceInfo = await redis.hGetAll("service:" + apiId);
    let callsByDate = [];
    let callsByToken = [];
    let callsByDateAndToken = [];
    if (serviceInfo) {
      result.calls = serviceInfo.calls ? parseInt(serviceInfo.calls) : 0;
      // get all calls by date for this service
      for (const [key, value] of Object.entries(serviceInfo)) {
        if (key?.includes("calls:20")) {
          const calls = parseInt(value);
          const keyInfo = key.replace("calls:", "");
          if (keyInfo.includes("token")) {
            const dateStr = keyInfo.split(":token")[0];
            const token = keyInfo.split(":")[2];
            callsByDateAndToken.push({
              date: dateStr,
              token: token,
              calls: calls,
            });
          } else {
            const dateStr = keyInfo;
            callsByDate.push({
              date: keyInfo,
              calls: calls,
            });
          }
        } else if (key?.includes("calls:token")) {
          const calls = parseInt(value);
          const token = key.split(":")[2];
          callsByToken.push({ token: token, calls: calls });
        }
      }
      result.created = serviceInfo.created;
      result.callsByDate = callsByDate;
      result.callsByToken = callsByToken;
      result.callsByTokenAndDate = callsByDateAndToken;
    }
  } catch (error) {
    console.error("ERROR getServiceData", error);
  }

  return result;
}

async function getServicesByTenant(tenantId) {
  if (!tenantId) return getError("tenant is required");
  let result = { tenant: tenantId };
  let services = [];
  let serviceAnalytics = [];

  try {
    const tenantInfo = await redis.hGetAll("tenant:" + tenantId);
    for (const [key] of Object.entries(tenantInfo)) {
      if (key?.includes("service:")) {
        let index = key.indexOf("service:");
        let serviceId = key.substring(index + 8);
        if (services.indexOf(serviceId) === -1) {
          services.push(serviceId);
          const analytics = await getServiceAnalytics(serviceId);
          serviceAnalytics.push({ serviceId: serviceId, analytics: analytics });
        }
      }
    }
  } catch (error) {
    console.error("ERROR getServicesByTenant", error);
  }
  result.services = serviceAnalytics;
  return result;
}

//===============================================
// Route Handlers
//===============================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  let apiId = searchParams.get('api');
  if (!apiId) apiId = searchParams.get('service');
  if (!apiId) apiId = searchParams.get('id');
  let apiToken = searchParams.get('token');
  const tenantId = searchParams.get('tenant');
  let parameters = [];

  // get the parameters from the query string
  for (const [key, value] of searchParams.entries()) {
    if (key === "id" || key === "token") continue; // skip id and key parameters
    parameters.push({ name: key, value: value });
  }

  let requestInfo = {
    apiId: apiId,
    apiToken: apiToken,
    tenant: tenantId,
    parameters: parameters,
  };
  let result;
  if (apiId) {
    result = await getServiceAnalytics(apiId);
  } else if (tenantId) {
    result = await getServicesByTenant(tenantId);
  }

  // are there any errors?
  if (!result || result.error) {
    return NextResponse.json(result ? result : { error: "unknown error" }, { status: 400 });
  }
  // get the item & source type
  return NextResponse.json(result);
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}