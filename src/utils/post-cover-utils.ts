type PostCoverData = {
	image?: string | null;
	showCoverInPost?: boolean;
};

export function shouldShowPostCover(data: PostCoverData): boolean {
	return Boolean(data.image && data.showCoverInPost !== false);
}
