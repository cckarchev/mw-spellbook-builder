import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { unzipSync } from 'fflate';
import sharp from 'sharp';
import { cardCode, cardImagePath } from '@/core/catalog/cardImage';
import type { Card, Format } from '@/core/rules/types';
import { mages } from '@/data/mages';
import { buildExpansionMap, type LegacySet } from './lib/expansions';
import { frameBox } from './lib/frameBox';
import { normalizeCard } from './lib/normalizeCard';
import { parseSetXml, readModuleSets } from './lib/readModule';

// Reads the OCTGN Mage Wars module and the community image pack from raw-input/ and
// writes src/data/cards.json and public/cards/<code>.webp. Run with `npm run data`.

const RAW_DIR = 'raw-input';
const MODULE_PATH = path.join(RAW_DIR, 'mage-wars-3.1.4.1.nupkg');
const MODULE_URL =
  'https://www.myget.org/F/octgngamedirectory/api/v2/package/9acef3d0-efa8-4d3f-a10c-54812baecdda/3.1.4.1';
const LEGACY_DIR = path.join(RAW_DIR, 'legacy-sets');
const LEGACY_SETS_API =
  'https://api.github.com/repos/sIKE23/Mage-Wars/contents/GameDatabase/9acef3d0-efa8-4d3f-a10c-54812baecdda/Sets';
const LEGACY_RAW_BASE =
  'https://raw.githubusercontent.com/sIKE23/Mage-Wars/master/GameDatabase/9acef3d0-efa8-4d3f-a10c-54812baecdda/Sets';
const IMAGE_PACK_PATH = path.join(RAW_DIR, 'MW_Card_Image_Pack.o8c');

const CARDS_JSON_PATH = path.join('src', 'data', 'cards.json');
const PUBLIC_DIR = 'public';
const IMAGE_DIR = path.join(PUBLIC_DIR, 'cards');
const IMAGE_WIDTH = 480;
const IMAGE_QUALITY = 80;
const JSON_INDENT = 2;
const BIOME_BIN = path.join('node_modules', '.bin', 'biome');

const SETS: { id: string; format: Format }[] = [
  { id: '36d0ba97-faee-4117-895c-2c08eed318eb', format: 'arena' },
  { id: '85c1fe26-1bed-4efe-9756-a8d4e01079c5', format: 'academy' },
];

const IMAGE_ENTRY_PATTERN = /\/Cards\/([0-9a-f-]+)\.(jpe?g|png)$/i;

const log = (message: string): void => {
  process.stdout.write(`${message}\n`);
};

const download = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  return new Uint8Array(await response.arrayBuffer());
};

const ensureModule = async (): Promise<void> => {
  if (existsSync(MODULE_PATH)) {
    return;
  }

  log(`Downloading ${MODULE_URL}`);
  await writeFile(MODULE_PATH, await download(MODULE_URL));
};

const ensureLegacySets = async (): Promise<void> => {
  if (existsSync(LEGACY_DIR)) {
    return;
  }

  log('Downloading legacy set files from sIKE23/Mage-Wars');
  await mkdir(LEGACY_DIR, { recursive: true });

  const listing = JSON.parse(new TextDecoder().decode(await download(LEGACY_SETS_API))) as {
    name: string;
  }[];

  for (const { name } of listing) {
    await writeFile(
      path.join(LEGACY_DIR, `${name}.xml`),
      await download(`${LEGACY_RAW_BASE}/${name}/set.xml`),
    );
  }
};

const readLegacySets = async (): Promise<LegacySet[]> => {
  const files = (await readdir(LEGACY_DIR)).filter((file) => file.endsWith('.xml')).sort();
  const sets: LegacySet[] = [];

  for (const file of files) {
    const set = parseSetXml(await readFile(path.join(LEGACY_DIR, file), 'utf8'));

    sets.push({ name: set.name, cardIds: set.cards.map((card) => card.id) });
  }

  return sets;
};

const readCards = async (): Promise<Card[]> => {
  const moduleSets = readModuleSets(
    await readFile(MODULE_PATH),
    SETS.map((set) => set.id),
  );
  const expansions = buildExpansionMap(await readLegacySets());
  const cards: Card[] = [];

  for (const { id, format } of SETS) {
    for (const raw of moduleSets.get(id)?.cards ?? []) {
      const card = normalizeCard(raw, format, expansions.get(raw.id));

      if (card) {
        cards.push(card);
      }
    }
  }

  return cards.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
};

const assertUniqueCodes = (cards: readonly Card[]): void => {
  const seen = new Set<string>();

  for (const card of cards) {
    if (seen.has(card.code)) {
      throw new Error(`Duplicate card code ${card.code} (${card.name})`);
    }

    seen.add(card.code);
  }
};

/** Where the image of a card id is written, under public/. */
const imageFile = (cardId: string): string =>
  path.join(PUBLIC_DIR, cardImagePath(cardCode(cardId)));

/** Cuts the white or transparent frame some pack images have, then resizes to webp. */
const writeFramelessImage = async (data: Uint8Array, target: string): Promise<void> => {
  const box = await frameBox(data);

  await sharp(data)
    .extract(box)
    .resize({ width: IMAGE_WIDTH })
    .webp({ quality: IMAGE_QUALITY })
    .toFile(target);
};

/**
 * Converts the pack image of every wanted card id, rewriting existing ones so a change in
 * the conversion reaches them all. Returns the ids that got an image.
 */
const writeImages = async (wantedIds: ReadonlySet<string>): Promise<Set<string>> => {
  await mkdir(IMAGE_DIR, { recursive: true });

  const entries = unzipSync(await readFile(IMAGE_PACK_PATH), {
    filter: (file) => wantedIds.has(IMAGE_ENTRY_PATTERN.exec(file.name)?.[1] ?? ''),
  });
  const written = new Set<string>();

  for (const [name, data] of Object.entries(entries)) {
    const id = IMAGE_ENTRY_PATTERN.exec(name)?.[1] ?? '';
    const target = imageFile(id);

    if (written.has(id)) {
      continue;
    }

    try {
      await writeFramelessImage(data, target);
    } catch (error) {
      throw new Error(`Could not convert the image of card ${id}`, { cause: error });
    }

    written.add(id);
  }

  return written;
};

/** Removes images left from cards that are no longer in the catalog. */
const removeStaleImages = async (keptIds: ReadonlySet<string>): Promise<number> => {
  const keptFiles = new Set([...keptIds].map((id) => path.basename(imageFile(id))));
  const stale = (await readdir(IMAGE_DIR)).filter((file) => !keptFiles.has(file));

  for (const file of stale) {
    await rm(path.join(IMAGE_DIR, file));
  }

  return stale.length;
};

const main = async (): Promise<void> => {
  if (!existsSync(IMAGE_PACK_PATH)) {
    throw new Error(`Place the image pack at ${IMAGE_PACK_PATH} first`);
  }

  await ensureModule();
  await ensureLegacySets();

  const cards = await readCards();

  assertUniqueCodes(cards);

  const mageCardIds = mages.flatMap((mage) => (mage.imageCardId ? [mage.imageCardId] : []));
  const withImage = await writeImages(new Set([...cards.map((card) => card.id), ...mageCardIds]));

  const removed = await removeStaleImages(withImage);

  for (const card of cards) {
    card.image = withImage.has(card.id) ? cardImagePath(card.code) : null;
  }

  await writeFile(CARDS_JSON_PATH, `${JSON.stringify(cards, null, JSON_INDENT)}\n`);
  // Match the repo formatter so `npm run lint` checks the generated file too.
  execFileSync(BIOME_BIN, ['format', '--write', CARDS_JSON_PATH], { stdio: 'ignore' });

  const missingImages = cards.filter((card) => card.image === null);
  const unknownExpansion = cards.filter((card) => card.expansion === 'Unknown');

  log(`Cards: ${cards.length}`);
  log(`With image: ${cards.length - missingImages.length}`);
  log(`Without image: ${missingImages.map((card) => card.name).join(', ') || 'none'}`);
  log(`Without expansion: ${unknownExpansion.length}`);
  log(`Stale images removed: ${removed}`);
  log(`Mages without image: ${mageCardIds.filter((id) => !withImage.has(id)).length}`);
};

await main();
