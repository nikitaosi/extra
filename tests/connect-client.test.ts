import assert from 'node:assert/strict';
import { test } from 'node:test';
import { create, toBinary } from '@bufbuild/protobuf';
import { authClient } from '../src/shared/api/client';
import { MeResponseSchema } from '../src/shared/api/gen/expense_pb';

test('auth client sends binary Protobuf with browser credentials', async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3101';
  let called = false;
  globalThis.fetch = async (input, init) => {
    called = true;
    assert.equal(String(input), 'http://localhost:3101/extra.v1.AuthService/Me');
    assert.equal(init?.credentials, 'include');
    assert.equal(new Headers(init?.headers).get('content-type'), 'application/proto');
    assert.ok(init?.body instanceof Uint8Array);
    return new Response(toBinary(MeResponseSchema, create(MeResponseSchema, { email: 'user@example.com' })), {
      headers: { 'content-type': 'application/proto' },
    });
  };

  try {
    const response = await authClient().me({});
    assert.equal(response.email, 'user@example.com');
    assert.equal(called, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalUrl;
  }
});
