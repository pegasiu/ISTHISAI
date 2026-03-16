export interface CachedResult {
	id: number;
	content_hash: string;
	content_type: 'image' | 'video' | 'website' | 'text';
	is_ai_generated: number; // SQLite uses 0/1 for boolean
	confidence: number;
	reasoning: string;
	artifacts: string; // JSON string
	natural_elements: string; // JSON string
	created_at: string;
}

export async function getCachedResult(db: D1Database, hash: string) {
	const result = await db
		.prepare('SELECT * FROM analysis_results WHERE content_hash = ?')
		.bind(hash)
		.first<CachedResult>();

	if (!result) return null;

	return {
		content_hash: result.content_hash,
		content_type: result.content_type,
		is_ai_generated: result.is_ai_generated === 1,
		confidence: result.confidence,
		reasoning: result.reasoning,
		artifacts: JSON.parse(result.artifacts) as string[],
		natural_elements: JSON.parse(result.natural_elements) as string[],
		created_at: result.created_at
	};
}

export async function cacheResult(
	db: D1Database,
	hash: string,
	contentType: CachedResult['content_type'],
	result: {
		isAiGenerated: boolean;
		confidence: number;
		reasoning: string;
		details: { artifacts: string[]; naturalElements: string[] };
	}
) {
	await db
		.prepare(
			`INSERT OR REPLACE INTO analysis_results
			(content_hash, content_type, is_ai_generated, confidence, reasoning, artifacts, natural_elements)
			VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			hash,
			contentType,
			result.isAiGenerated ? 1 : 0,
			result.confidence,
			result.reasoning,
			JSON.stringify(result.details.artifacts),
			JSON.stringify(result.details.naturalElements)
		)
		.run();
}

export async function computeHash(data: ArrayBuffer | string): Promise<string> {
	const encoder = new TextEncoder();
	const buffer = typeof data === 'string' ? encoder.encode(data) : data;
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
