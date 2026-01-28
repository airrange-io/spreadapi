// Simple file-based service storage

const fs = require('fs').promises;
const path = require('path');

const SERVICES_DIR = path.join(process.cwd(), 'services');

async function ensureDir() {
  try {
    await fs.mkdir(SERVICES_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

async function saveService(serviceId, data) {
  await ensureDir();
  const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function getService(serviceId) {
  try {
    const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

async function deleteService(serviceId) {
  try {
    const filePath = path.join(SERVICES_DIR, `${serviceId}.json`);
    await fs.unlink(filePath);
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
};
