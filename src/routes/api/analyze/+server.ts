import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeWithVision, analyzeText } from '$lib/server/openrouter';
import { getCachedResult, cacheResult, computeHash } from '$lib/server/db';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	const chunks: string[] = [];
	const chunkSize = 8192;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		chunks.push(String.fromCharCode(...chunk));
	}
	return btoa(chunks.join(''));
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform?.env?.DB;
	const apiKey = platform?.env?.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw error(500, 'OpenRouter API key not configured');
	}

	const formData = await request.formData();
	const type = formData.get('type') as string;

	if (!type || !['image', 'video', 'website', 'text'].includes(type)) {
		throw error(400, 'Invalid analysis type');
	}

	try {
		if (type === 'text') {
			const text = formData.get('text') as string;
			if (!text || text.trim().length < 20) {
				throw error(400, 'Text must be at least 20 characters');
			}

			const hash = await computeHash(text);

			if (db) {
				const cached = await getCachedResult(db, hash);
				if (cached) {
					return json({ ...cached, cached: true });
				}
			}

			const result = await analyzeText(apiKey, text);
			if (db) await cacheResult(db, hash, 'text', result);

			return json({
				content_hash: hash,
				content_type: 'text',
				is_ai_generated: result.isAiGenerated,
				confidence: result.confidence,
				reasoning: result.reasoning,
				artifacts: result.details.artifacts,
				natural_elements: result.details.naturalElements,
				cached: false
			});
		}

		if (type === 'website') {
			const url = formData.get('url') as string;
			if (!url) throw error(400, 'URL is required');

			const hash = await computeHash(url);

			if (db) {
				const cached = await getCachedResult(db, hash);
				if (cached) {
					return json({ ...cached, cached: true });
				}
			}

			const siteResponse = await fetch(url, {
				headers: { 'User-Agent': 'IsThisAI Bot/1.0' }
			});
			const html = await siteResponse.text();

			const textContent = html
				.replace(/<script[\s\S]*?<\/script>/gi, '')
				.replace(/<style[\s\S]*?<\/style>/gi, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim()
				.slice(0, 4000);

			const result = await analyzeText(apiKey, textContent);
			if (db) await cacheResult(db, hash, 'website', result);

			return json({
				content_hash: hash,
				content_type: 'website',
				is_ai_generated: result.isAiGenerated,
				confidence: result.confidence,
				reasoning: result.reasoning,
				artifacts: result.details.artifacts,
				natural_elements: result.details.naturalElements,
				cached: false
			});
		}

		// Image or video — client sends base64 + mimeType to avoid heavy server-side encoding
		const base64 = formData.get('base64') as string;
		const mimeType = formData.get('mimeType') as string;

		if (!base64 || !mimeType) {
			throw error(400, 'base64 and mimeType fields are required for image/video');
		}

		const hash = await computeHash(base64);

		if (db) {
			const cached = await getCachedResult(db, hash);
			if (cached) {
				return json({ ...cached, cached: true });
			}
		}

		const contentType = type as 'image' | 'video';
		const context = type === 'video' ? 'video_frame' : 'image';
		const result = await analyzeWithVision(apiKey, base64, mimeType, context);
		if (db) await cacheResult(db, hash, contentType, result);

		return json({
			content_hash: hash,
			content_type: contentType,
			is_ai_generated: result.isAiGenerated,
			confidence: result.confidence,
			reasoning: result.reasoning,
			artifacts: result.details.artifacts,
			natural_elements: result.details.naturalElements,
			cached: false
		});
	} catch (err) {
		console.error('Analysis error:', err);
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
