import { describe, it, expect, beforeAll, vi } from 'vitest';
import worker from '../src';

describe('Costs worker', () => {
	let env;
    let getRequest;

    beforeAll(() => {
        env = {
            monthly_costs: {
                get: vi.fn(),
                put: vi.fn()
            }
        };

        getRequest = new Request('http://example.com/monthly-costs/get');
    });

	it('responds with "Endpoint not Found" when wrong endpoint is called', async () => {
		const request = new Request('http://example.com/wrong-endpoint');
		const response = await worker.fetch(request, env);
		const responseText = JSON.parse(await response.text());
		expect(response.status).toBe(404);
		expect(responseText.message).toMatchInlineSnapshot(`"Endpoint not Found"`);
	});

	it('responds with "Key not found" when correct endpoint is called but there is no key stored', async () => {
		const response = await worker.fetch(getRequest, env);
		const responseText = JSON.parse(await response.text());
		expect(response.status).toBe(404);
		expect(responseText.message).toMatchInlineSnapshot(`"Key not found"`);
	});

	it('responds with a value when correct endpoint is called and there is a key stored', async () => {
		const testValue = JSON.stringify({ costs: "test value" });
		env.monthly_costs.get.mockReturnValue(testValue)

		const response = await worker.fetch(getRequest, env);
		expect(response.status).toBe(200);
		expect(await response.text()).toMatchInlineSnapshot(`"${testValue}"`);
	});
});
