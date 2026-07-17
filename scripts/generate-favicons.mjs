import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(projectRoot, "圆形透明头像.png");
const outputDirectory = join(projectRoot, "public", "favicon");
const icoPath = join(projectRoot, "public", "favicon.ico");

const alphaTrimThreshold = 8;
const safeMarginRatio = 1 / 32;
const edgeCleanupPixels = 2;

const pngTargets = [
	{
		name: "favicon-16x16.png",
		size: 16,
		sharpen: { sigma: 0.55, m1: 0.8, m2: 1.3, x1: 2, y2: 6, y3: 8 },
	},
	{
		name: "favicon-32x32.png",
		size: 32,
		sharpen: { sigma: 0.5, m1: 0.65, m2: 1.2, x1: 2, y2: 6, y3: 8 },
	},
	{
		name: "favicon-48x48.png",
		size: 48,
		sharpen: { sigma: 0.45, m1: 0.5, m2: 1.1, x1: 2, y2: 5, y3: 7 },
	},
	{ name: "favicon-64x64.png", size: 64 },
	{ name: "apple-touch-icon.png", size: 180 },
];

const staleFaviconNames = [
	"favicon-32.png",
	"favicon-48.png",
	"favicon-64.png",
	"favicon-128.png",
	"favicon-180.png",
	"favicon-192.png",
	"favicon-light-32.png",
	"favicon-light-128.png",
	"favicon-light-180.png",
	"favicon-light-192.png",
	"favicon-dark-32.png",
	"favicon-dark-128.png",
	"favicon-dark-180.png",
	"favicon-dark-192.png",
];

function findAlphaBounds(data, width, height, channels) {
	let left = width;
	let top = height;
	let right = -1;
	let bottom = -1;

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const alpha = data[(y * width + x) * channels + 3];
			if (alpha < alphaTrimThreshold) continue;
			left = Math.min(left, x);
			top = Math.min(top, y);
			right = Math.max(right, x);
			bottom = Math.max(bottom, y);
		}
	}

	if (right < left || bottom < top) {
		throw new Error("The favicon source has no visible pixels.");
	}

	return {
		left,
		top,
		width: right - left + 1,
		height: bottom - top + 1,
	};
}

function circularMask(width, height) {
	const radius = Math.min(width, height) / 2 - edgeCleanupPixels;
	return Buffer.from(`
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<rect width="100%" height="100%" fill="transparent"/>
			<circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="white"/>
		</svg>
	`);
}

async function encodeTarget(prepared, target) {
	let pipeline = sharp(prepared)
		.resize(target.size, target.size, {
			fit: "fill",
			kernel: sharp.kernel.lanczos3,
		})
		.toColourspace("srgb");

	if (target.sharpen) {
		pipeline = pipeline.sharpen(target.sharpen);
	}

	const { data, info } = await pipeline
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	for (let offset = 0; offset < data.length; offset += info.channels) {
		if (data[offset + 3] !== 0) continue;
		data[offset] = 0;
		data[offset + 1] = 0;
		data[offset + 2] = 0;
	}

	return sharp(data, {
		raw: {
			width: info.width,
			height: info.height,
			channels: 4,
		},
	})
		.png({ adaptiveFiltering: true, compressionLevel: 9, palette: false })
		.toBuffer();
}

function createIco(images) {
	const directorySize = 6 + images.length * 16;
	const header = Buffer.alloc(directorySize);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);

	let imageOffset = directorySize;
	for (const [index, image] of images.entries()) {
		const entryOffset = 6 + index * 16;
		header.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset);
		header.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset + 1);
		header.writeUInt8(0, entryOffset + 2);
		header.writeUInt8(0, entryOffset + 3);
		header.writeUInt16LE(1, entryOffset + 4);
		header.writeUInt16LE(32, entryOffset + 6);
		header.writeUInt32LE(image.buffer.length, entryOffset + 8);
		header.writeUInt32LE(imageOffset, entryOffset + 12);
		imageOffset += image.buffer.length;
	}

	return Buffer.concat([header, ...images.map((image) => image.buffer)]);
}

await mkdir(outputDirectory, { recursive: true });

for (const staleName of staleFaviconNames) {
	await rm(join(outputDirectory, staleName), { force: true });
}

const sourceBuffer = await readFile(sourcePath);
const source = sharp(sourceBuffer).ensureAlpha();
const { data: sourcePixels, info: sourceInfo } = await source
	.clone()
	.raw()
	.toBuffer({ resolveWithObject: true });
const bounds = findAlphaBounds(
	sourcePixels,
	sourceInfo.width,
	sourceInfo.height,
	sourceInfo.channels,
);

if (bounds.width !== bounds.height) {
	throw new Error(
		`Expected a square circular source after trimming, received ${bounds.width}x${bounds.height}.`,
	);
}

const padding = Math.ceil(
	(bounds.width * safeMarginRatio) / (1 - safeMarginRatio * 2),
);
const prepared = await sharp(sourceBuffer)
	.ensureAlpha()
	.extract(bounds)
	.composite([
		{
			input: circularMask(bounds.width, bounds.height),
			blend: "dest-in",
		},
	])
	.extend({
		top: padding,
		bottom: padding,
		left: padding,
		right: padding,
		background: { r: 0, g: 0, b: 0, alpha: 0 },
	})
	.png()
	.toBuffer();

const generated = new Map();
for (const target of pngTargets) {
	const buffer = await encodeTarget(prepared, target);
	await writeFile(join(outputDirectory, target.name), buffer);
	generated.set(target.size, buffer);
}

const ico = createIco(
	[16, 32, 48].map((size) => ({ size, buffer: generated.get(size) })),
);
await writeFile(icoPath, ico);

console.log(
	`Generated ${pngTargets.length} PNG files and favicon.ico from ${sourcePath}.`,
);
console.log(
	`Alpha bounds: ${bounds.width}x${bounds.height} at (${bounds.left}, ${bounds.top}); safe padding: ${padding}px per side.`,
);
