// File-based service storage with in-memory caching

const fs = require('fs').promises;
const path = require('path');
const serviceCache = require('./serviceCache');
const resultCache = require('./resultCache');

const SERVICES_DIR = path.join(process.cwd(), 'services');

async function ensureDir() {
  try {
    await fs.mkdir(SERVICES_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

/**
 * Validate serviceId to prevent path traversal attacks
 */
function isValidServiceId(serviceId) {
  if (!serviceId || typeof serviceId !== 'string') return false;
  // Only allow alphanumeric, dash, underscore
  return /^[a-zA-Z0-9_-]+$/.test(serviceId);
}

async function saveService(serviceId, data) {
  if (!isValidServiceId(serviceId)) {
    throw new Error('Invalid service ID');
  }

  await ensureDir();
  const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  // Invalidate caches - service data changed
  serviceCache.invalidate(serviceId);
  resultCache.invalidateService(serviceId);
}

async function getService(serviceId) {
  if (!isValidServiceId(serviceId)) {
    return null;
  }

  // Check cache first
  const cached = serviceCache.get(serviceId);
  if (cached) {
    return cached;
  }

  // Read from filesystem
  try {
    const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const service = JSON.parse(content);

    // Cache for next request
    serviceCache.set(serviceId, service);

    return service;
  } catch (err) {
    return null;
  }
}

async function deleteService(serviceId) {
  if (!isValidServiceId(serviceId)) {
    return false;
  }

  try {
    const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
    await fs.unlink(filePath);

    // Invalidate caches
    serviceCache.invalidate(serviceId);
    resultCache.invalidateService(serviceId);

    return true;
  } catch (err) {
    return false;
  }
}

async function listServices() {
  await ensureDir();
  try {
    const files = await fs.readdir(SERVICES_DIR);
    const services = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        const content = await fs.readFile(path.join(SERVICES_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        services.push({
          serviceId: data.serviceId || file.replace('.json', ''),
          name: data.apiJson?.name || data.name || 'Unnamed',
          title: data.apiJson?.title || data.title || 'Untitled',
          description: data.apiJson?.description || data.description || '',
          inputCount: data.apiJson?.inputs?.length || 0,
          outputCount: data.apiJson?.outputs?.length || 0,
          uploadedAt: data.uploadedAt || null,
        });
      } catch (err) {
        console.error(`Error reading service file ${file}:`, err.message);
      }
    }

    return services;
  } catch (err) {
    return [];
  }
}

module.exports = {
  saveService,
  getService,
  deleteService,
  listServices,
  isValidServiceId,
};
