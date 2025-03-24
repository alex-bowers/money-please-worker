/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
};

export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);

		if (pathname === '/monthly-costs/get') {
			return await handleGet(env);
		} else if (pathname === '/monthly-costs/update') {
			return await handleUpdate(request, env);
		} else {
			return new Response(stringifyResponse(
				'Endpoint not Found'
			), {
				headers: corsHeaders,
				status: 404
			});
		}
	},
};

async function handleGet(env) {
	const costs = await env.monthly_costs.get('costs');

	if (costs) {
		return new Response(costs, {
			headers: corsHeaders,
			status: 200
		});
	} else {
		return new Response(stringifyResponse(
			'Key not found'
		), {
			headers: corsHeaders,
			status: 404
		});
	}
};

async function handleUpdate(request, env) {
	const body = await request.json();
	const value = JSON.stringify(body);

	try {
		await env.monthly_costs.put('costs', value);
		return new Response(stringifyResponse(
			'Value updated successfully'
		), {
			headers: corsHeaders,
			status: 200
		});
	} catch (error) {
		return new Response(stringifyResponse(
			'Failed to update value',
			error
		), {
			headers: corsHeaders,
			status: 500
		});
	}
};

function stringifyResponse(message, error) {
	const params = {
		message,
	}

	if (error) {
		params.error = error;
	}

	return JSON.stringify(params);
}
