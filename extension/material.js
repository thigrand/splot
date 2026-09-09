export const DEFAULT_IMPORTANCE = 'important';
export const DEFAULT_INTENT = 'remember';
export const MAX_DESCRIPTION_LENGTH = 4000;
export const MAX_TAGS = 30;
export const MAX_TAG_LENGTH = 60;

export function validateHttpUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Można zapisywać tylko poprawne adresy HTTP lub HTTPS.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Można zapisywać tylko adresy HTTP lub HTTPS.');
  }

  return url.href;
}

export function domainFromUrl(url) {
  return new URL(validateHttpUrl(url)).hostname.toLowerCase();
}

export function normalizeTags(value) {
  const candidates = Array.isArray(value) ? value : String(value ?? '').split(',');
  const tags = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const tag = String(candidate).trim();
    if (!tag) continue;
    if (tag.length > MAX_TAG_LENGTH) {
      throw new Error(`Każdy tag może mieć najwyżej ${MAX_TAG_LENGTH} znaków.`);
    }
    const key = tag.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }

  if (tags.length > MAX_TAGS) {
    throw new Error(`Możesz podać najwyżej ${MAX_TAGS} tagów.`);
  }

  return tags;
}

export function validateSubmission(values) {
  const description = String(values.description ?? '');
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Opis może mieć najwyżej ${MAX_DESCRIPTION_LENGTH} znaków.`);
  }
  if (!['important', 'less_important'].includes(values.importance)) {
    throw new Error('Wybierz poprawną wartość ważności.');
  }
  if (!['remember', 'summarize', 'research'].includes(values.intent)) {
    throw new Error('Wybierz poprawny tryb.');
  }

  return {
    url: validateHttpUrl(values.url),
    description,
    tags: normalizeTags(values.tags),
    importance: values.importance,
    intent: values.intent
  };
}

export function createDraft({ url, title }, now = new Date().toISOString(), id = crypto.randomUUID()) {
  const safeUrl = validateHttpUrl(url);
  return {
    id,
    url: safeUrl,
    domain: domainFromUrl(safeUrl),
    title: String(title ?? ''),
    description: '',
    tags: [],
    importance: DEFAULT_IMPORTANCE,
    intent: DEFAULT_INTENT,
    createdAt: now,
    updatedAt: now
  };
}

export function mergeApprovedRecord(existing, submitted, now = new Date().toISOString()) {
  const tags = normalizeTags([...existing.tags, ...submitted.tags]);
  const next = {
    ...existing,
    description: submitted.description,
    tags,
    importance: submitted.importance,
    intent: submitted.intent
  };
  const changed = next.description !== existing.description ||
    next.importance !== existing.importance ||
    next.intent !== existing.intent ||
    next.tags.length !== existing.tags.length ||
    next.tags.some((tag, index) => tag !== existing.tags[index]);

  return changed ? { ...next, updatedAt: now } : existing;
}

export function buildSnapshot(records, exportedAt = new Date().toISOString()) {
  return {
    schemaVersion: 1,
    exportedAt,
    materials: [...records].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id)
    )
  };
}
