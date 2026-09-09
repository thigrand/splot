import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSnapshot,
  createDraft,
  mergeApprovedRecord,
  normalizeTags,
  validateHttpUrl,
  validateSubmission
} from '../extension/material.js';

test('tworzy wstępny rekord z pełnym URL i wartościami domyślnymi', () => {
  const record = createDraft(
    { url: 'https://Sub.Example.org/a?x=1#fragment', title: 'Tytuł' },
    '2026-09-09T10:00:00.000Z',
    'record-1'
  );
  assert.deepEqual(record, {
    id: 'record-1',
    url: 'https://sub.example.org/a?x=1#fragment',
    domain: 'sub.example.org',
    title: 'Tytuł',
    description: '',
    tags: [],
    importance: 'important',
    intent: 'remember',
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-09T10:00:00.000Z'
  });
});

test('odrzuca nieobsługiwane URL', () => {
  assert.throws(() => validateHttpUrl('chrome://extensions'), /HTTP lub HTTPS/);
  assert.throws(() => validateHttpUrl('nie adres'), /HTTP lub HTTPS/);
});

test('scala tagi bez rozróżniania wielkości liter i zachowuje pierwszą pisownię', () => {
  assert.deepEqual(normalizeTags([' Relacje ', 'relacje', 'Dzieci']), ['Relacje', 'Dzieci']);
});

test('waliduje granice opisu, tagów i enumów', () => {
  assert.throws(() => validateSubmission({
    url: 'https://example.org', description: '', tags: '', importance: 'other', intent: 'remember'
  }), /ważności/);
  assert.throws(() => validateSubmission({
    url: 'https://example.org', description: '', tags: '', importance: 'important', intent: 'other'
  }), /tryb/);
});

test('scalenie zastępuje zatwierdzone pola, łączy tagi i nie zmienia daty bez zmiany', () => {
  const existing = createDraft({ url: 'https://example.org/', title: 'Pierwszy' }, '2026-09-09T10:00:00.000Z', 'id');
  existing.tags = ['Relacje'];
  const changed = mergeApprovedRecord(existing, {
    url: existing.url,
    description: 'Polski opis',
    tags: ['relacje', 'Dzieci'],
    importance: 'less_important',
    intent: 'summarize'
  }, '2026-09-09T11:00:00.000Z');
  assert.deepEqual(changed.tags, ['Relacje', 'Dzieci']);
  assert.equal(changed.description, 'Polski opis');
  assert.equal(changed.updatedAt, '2026-09-09T11:00:00.000Z');
  assert.equal(mergeApprovedRecord(changed, {
    url: changed.url, description: 'Polski opis', tags: ['dzieci'], importance: 'less_important', intent: 'summarize'
  }), changed);
});

test('migawka sortuje rekordy bez mutowania oryginału', () => {
  const later = createDraft({ url: 'https://example.org/b', title: '' }, '2026-09-09T12:00:00.000Z', 'b');
  const earlier = createDraft({ url: 'https://example.org/a', title: '' }, '2026-09-09T11:00:00.000Z', 'a');
  const snapshot = buildSnapshot([later, earlier], '2026-09-09T13:00:00.000Z');
  assert.equal(snapshot.schemaVersion, 1);
  assert.deepEqual(snapshot.materials.map(({ id }) => id), ['a', 'b']);
  assert.deepEqual([later.id, earlier.id], ['b', 'a']);
});
