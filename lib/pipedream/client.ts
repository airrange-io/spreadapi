import { PipedreamClient } from '@pipedream/sdk/server';

// Fresh client per request matches listplus's tested pattern. The SDK is
// lightweight and the credentials are env-only, so re-instantiation has no
// observable cost.
export function makePipedreamClient(): InstanceType<typeof PipedreamClient> {
  const projectId = process.env.PIPEDREAM_PROJECT_ID;
  const clientId = process.env.PIPEDREAM_CLIENT_ID;
  const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET;
  if (!projectId || !clientId || !clientSecret) {
    throw new Error(
      'Pipedream Connect is not configured. Set PIPEDREAM_PROJECT_ID, ' +
      'PIPEDREAM_CLIENT_ID and PIPEDREAM_CLIENT_SECRET in your environment.',
    );
  }

  const env = process.env.PIPEDREAM_ENVIRONMENT;
  const projectEnvironment: 'production' | 'development' =
    env === 'production' ? 'production' : 'development';

  return new PipedreamClient({
    projectEnvironment,
    projectId,
    clientId,
    clientSecret,
  });
}

export function pipedreamConfigured(): boolean {
  return !!(
    process.env.PIPEDREAM_PROJECT_ID &&
    process.env.PIPEDREAM_CLIENT_ID &&
    process.env.PIPEDREAM_CLIENT_SECRET
  );
}
