import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import redis from '../../../lib/redis';
import { getError, trimString } from '../../../utils/helper';

//===============================================
// Function
//===============================================

async function checkApi(requestInfo) {
  if (!requestInfo) return getError("check - no request info");
  let result = "unknown";
  try {
    // check if the service is already created
    const isExisting = await redis.exists("service:" + requestInfo.apiId);
    if (isExisting) result = "active";
  } catch (error) {
    console.error("ERROR checkApi", error);
    return getError("check - error checking api");
  }

  return result;
}

async function getFormFile(formData) {
  let file = null;
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      file = value;
      break;
    }
  }
  
  return file;
}

async function createApi(formData, requestInfo) {
  if (!requestInfo) return getError("missing request info");
  if (!requestInfo.tenant) return getError("missing tenant");
  if (!requestInfo.apiId) return getError("missing serviceId");

  const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL;
  const apiId = requestInfo.apiId;
  let title = requestInfo.title ?? "N/A";
  let result;
  let file;

  try {
    // =====================================
    // get the file
    // =====================================
    file = await getFormFile(formData);
    if (!file) return getError("no file found");

    // =====================================
    // get the file name and size
    // =====================================
    let fileName = file.name ?? requestInfo.apiId;
    fileName = trimString(fileName);
    const fileSize = file.size;
    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonData = JSON.parse(buffer.toString());
    const apiJson = jsonData?.apiJson;
    const tokens = apiJson?.tokens ?? [];
    const flags = apiJson?.flags ?? {};

    // =====================================
    // upload the file to the blob
    // =====================================
    const uploadUrl = requestInfo.tenant + "/data/" + fileName;
    const uploadInfo = await put(uploadUrl, buffer, { access: "public" });
    const blobUrl = uploadInfo.url?.replace(blobBasicUrl, "");
    const createdStr = new Date().toISOString();
    const tokenStr = tokens?.toString() ?? "";
    if (blobUrl) {
      await redis.hSet("service:" + apiId, {
        apiId: apiId,
        tenantId: requestInfo.tenant,
        urlData: blobUrl,
        created: new Date().toISOString(),
        title: title,
        tokens: tokenStr,
        useCaching: flags?.useCaching !== "false" ? "true" : "false",
        needsToken: flags?.needsToken ? "true" : "false",
      });
      // put the json data in the cache
      if (jsonData) {
        await redis.json.set("cache:blob:" + apiId, "$", jsonData);
        redis.expire("cache:blob:" + apiId, 60 * 3); // cache for 3 minutes
      }
    }
    result = {
      apiId: apiId,
      fileUrl: blobUrl,
      fileName: fileName,
      fileSize: fileSize,
      title: title,
      tokens: tokens?.toString(),
      useCaching: flags?.useCaching !== "false" ? "true" : "false",
      needsToken: flags?.needsToken ? "true" : "false",
    };
  } catch (error) {
    console.error("ERROR createApi", error);
  }

  return result;
}

async function updateApi(formData, requestInfo) {
  if (!requestInfo) return getError("update - missing requestInfo");
  if (!requestInfo.apiId) return getError("missing serviceId");
  if (!requestInfo.tenant) return getError("missing tenant");

  const apiId = requestInfo.apiId;
  const title = requestInfo.title ?? "N/A";
  // check if the service is already created
  const isExisting = await redis.exists("service:" + apiId);
  if (!isExisting) return getError("update - service not found");

  let result;
  let file;

  try {
    // =====================================
    // get the file name and size
    // =====================================
    file = await getFormFile(formData);
    if (!file) return getError("no file found");

    let fileName = file.name ?? requestInfo.apiId;
    fileName = trimString(fileName);
    const fileSize = file.size;
    const buffer = Buffer.from(await file.arrayBuffer());
    const jsonData = JSON.parse(buffer.toString());
    const apiJson = jsonData?.apiJson;
    const tokens = apiJson?.tokens ?? [];
    const flags = apiJson?.flags ?? {};

    // =====================================
    // delete the old blob
    // =====================================
    const oldBlobUrl = await redis.HGET("service:" + apiId, "urlData");
    if (oldBlobUrl) await del(oldBlobUrl, {});

    // =====================================
    // upload the file to the blob
    // =====================================
    const uploadUrl = requestInfo.tenant + "/data/" + fileName;
    const uploadInfo = await put(uploadUrl, buffer, { access: "public" });
    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL;
    const blobUrl = uploadInfo.url?.replace(blobBasicUrl, "");
    const modifiedStr = new Date().toISOString() ?? "";
    const tokenStr = tokens?.toString() ?? "";

    if (blobUrl)
      await redis.hSet("service:" + apiId, {
        urlData: blobUrl,
        modified: modifiedStr,
        tokens: tokenStr,
        useCaching: flags?.useCaching !== "false" ? "true" : "false",
        needsToken: flags?.needsToken ? "true" : "false",
      });

    result = {
      apiId: apiId,
      fileUrl: blobUrl,
      fileName: fileName,
      fileSize: fileSize,
      title: title,
      tokens: tokens?.toString(),
      useCaching: flags?.useCaching !== "false" ? "true" : "false",
      needsToken: flags?.needsToken ? "true" : "false",
    };
  } catch (error) {
    console.error("ERROR updateApi", error);
    return getError("update - error updating service");
  }

  return result;
}

async function deleteApi(requestInfo) {
  if (!requestInfo) return getError("delete - no request info");
  if (!requestInfo.apiId) return getError("no serviceId found: " + requestInfo.apiId);
  if (!requestInfo.tenant) return getError("missing tenant");

  // check if the service is already created
  const apiId = requestInfo.apiId;
  const isExisting = await redis.exists("service:" + apiId);
  if (!isExisting) return getError("update - service not found");

  let result;

  try {
    const oldBlobUrl = await redis.HGET("service:" + apiId, "urlData");
    if (oldBlobUrl) await del(oldBlobUrl, {});

    // =====================================
    // write the api info to the database
    // =====================================
    await redis.del("service:" + apiId);

    result = { apiId: apiId, status: "deleted" };
  } catch (error) {
    console.error("ERROR deleteApi", error);
    return getError("delete - error deleting service");
  }

  return result;
}

//===============================================
// Route Handlers
//===============================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  let error;
  let type = searchParams.get('type');
  if (!type) error = "missing type";
  let apiId = searchParams.get('api') ?? searchParams.get('service');
  if (!apiId) error = "missing service";
  let tenant = searchParams.get('tenant');
  if (!tenant && type !== "check") error = "missing tenant";
  if (error) return NextResponse.json({ error: error }, { status: 400 });
  let title = searchParams.get('title');

  let result = {};
  let requestInfo = {
    tenant: tenant,
    apiId: apiId,
  };
  if (title) requestInfo.title = title;

  if (type === "check") {
    let status = await checkApi(requestInfo);
    result = { status: status };
  } else if (type === "update") {
    result = await updateApi(requestInfo);
  }

  // are there any errors?
  if (!result || result.error) {
    return NextResponse.json(result ? result : { error: "unknown error" }, { status: 400 });
  }
  // get the item & source type
  return NextResponse.json(result);
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  
  let error;
  let type = searchParams.get('type');
  if (!type) error = "missing type";
  let apiId = searchParams.get('api') ?? searchParams.get('service');
  if (!apiId) error = "missing service";
  let tenant = searchParams.get('tenant');
  if (!tenant && type !== "check") error = "missing tenant";
  if (error) return NextResponse.json({ error: error }, { status: 400 });
  let title = searchParams.get('title');

  let result = {};
  let requestInfo = {
    tenant: tenant,
    apiId: apiId,
  };
  if (title) requestInfo.title = title;

  if (type === "create" || type === "update") {
    const formData = await request.formData();
    
    if (type === "create") {
      result = await createApi(formData, requestInfo);
    } else if (type === "update") {
      result = await updateApi(formData, requestInfo);
    }
  } else if (type === "delete") {
    result = await deleteApi(requestInfo);
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