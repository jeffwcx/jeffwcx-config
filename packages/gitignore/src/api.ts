function parseURL<T extends Record<string, string>>(template: string, args: T) {
  return template.replace(/\{([^{}]+)\}/g, (_, key) => args[key]);
}

export const GI_GET_ALL_TEMPLATES_API =
  'https://www.toptal.com/developers/gitignore/api/list?format=lines';

export async function getTemplates() {
  const res = await fetch(GI_GET_ALL_TEMPLATES_API, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  if (!res.ok) {
    throw new Error(`Response Status: ${res.status}, ${res.statusText}`);
  }
  const lines = await res.text();
  return lines.split(/[\n]+/);
}

export const GI_GEN_API =
  'https://www.toptal.com/developers/gitignore/api/{templates}';

export async function generateGitignore(templates: string) {
  const url = parseURL(GI_GEN_API, { templates });
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  if (!res.ok) {
    throw new Error(`Response Status: ${res.status}, ${res.statusText}`);
  }
  return await res.text();
}
