import { put, del, head, list } from '@vercel/blob';

// Configure blob client with explicit token
const getBlobConfig = () => {
  // Check for different token environment variable names
  const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || 
                process.env.VERCELBLOB_READ_WRITE_TOKEN || 
                process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    console.warn('Blob storage token not found. Checking for: VERCEL_BLOB_READ_WRITE_TOKEN, VERCELBLOB_READ_WRITE_TOKEN, or BLOB_READ_WRITE_TOKEN');
  } else {
    console.log('Using blob storage token from environment');
  }
  
  return {
    token: token
  };
};

// Export configured blob operations
export const putBlob = async (pathname, body, options = {}) => {
  return put(pathname, body, {
    ...options,
    ...getBlobConfig()
  });
};

export const delBlob = async (url) => {
  return del(url, getBlobConfig());
};

export const headBlob = async (url) => {
  return head(url, getBlobConfig());
};

export const listBlobs = async (options = {}) => {
  return list({
    ...options,
    ...getBlobConfig()
  });
};

export default {
  put: putBlob,
  del: delBlob,
  head: headBlob,
  list: listBlobs
};