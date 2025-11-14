export const CONTAINERS = ["Sample Pack", "Pouch", "Growler", "16oz"];
export const SCENTS = [
  "Wild Coast",
  "Unscented",
  "Tobacco Vanilla",
  "Local Revival",
  "High Sierra",
  "Cedarwood",
  "Lavender Bloom",
  "Almond Vanilla",
  "Original Blend"
];

export function stripMarkers(input: string): string {
  return input.replace(/\s*-\s*\*+\s*$/g, "").replace(/\*+/g, "").replace(/\s{2,}/g, " ").trim();
}

export function removeLimitedRelease(input: string): string {
  return input.replace(/\(\s*limited\s*release\s*\)/gi, "").replace(/\blimited\s*release\b/gi, "").trim();
}

export function normalizeForKey(input: string): string {
  return stripMarkers(removeLimitedRelease(input)).toLowerCase().replace(/\s{2,}/g, " ").trim();
}

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[\/]/g, " ").replace(/\s{2,}/g, " ").trim();
}

function removePluralS(input: string): string {
  return input.replace(/\b(\w+)s\b/g, "$1");
}

function findMatch(text: string, candidates: string[]): string {
  const normText = normalizeText(text);
  const normTextNoS = removePluralS(normText);
  for (const c of candidates) {
    const cand = c.toLowerCase();
    if (normText.includes(cand) || normTextNoS.includes(cand)) {
      return c;
    }
  }
  return "";
}

export function extractContainerAndScentFromText(input: string): { container: string; scent: string } {
  const cleaned = stripMarkers(removeLimitedRelease(input));
  const hasSlash = cleaned.includes("/");
  if (hasSlash) {
    const [leftRaw, ...rest] = cleaned.split("/");
    const rightRaw = rest.join("/");
    const left = leftRaw.trim();
    const right = rightRaw.trim();
    const container = findMatch(left, CONTAINERS);
    const scent = findMatch(right, SCENTS) || right;
    return { container, scent: stripMarkers(scent) };
  }
  const container = findMatch(cleaned, CONTAINERS);
  const scent = findMatch(cleaned, SCENTS);
  return { container, scent };
}

export function parseNameParts(full: string): { baseName: string; container: string; scent: string } {
  const cleaned = stripMarkers(removeLimitedRelease(full));
  let { container, scent } = extractContainerAndScentFromText(cleaned);
  const tokens = cleaned.split(" - ").map((t) => t.trim()).filter(Boolean);

  if (!container || !scent) {
    let tokenContainer = "";
    let tokenScent = "";

    for (const t of tokens) {
      if (!tokenContainer && CONTAINERS.some((c) => c.toLowerCase() === t.toLowerCase())) {
        tokenContainer = t;
      }
      if (!tokenScent && SCENTS.some((s) => s.toLowerCase() === t.toLowerCase())) {
        tokenScent = t;
      }
    }

    container = container || tokenContainer;
    scent = scent || tokenScent;
    if (!container && tokens[1]) container = tokens[1];
    if (!scent && tokens.length > 2) scent = tokens.slice(2).join(" - ");
  }

  const baseName = tokens.find((t) => t !== container && t !== scent) ?? tokens[0] ?? "";

  return {
    baseName: stripMarkers(baseName),
    container: stripMarkers(container),
    scent: stripMarkers(scent)
  };
}

export function cleanExplicitContainerAndScent(container: string, scent: string): { container: string; scent: string } {
  const c = String(container ?? "").trim();
  const s = String(scent ?? "").trim();
  const isValidContainer = CONTAINERS.some((x) => x.toLowerCase() === c.toLowerCase());
  const needsFix = c.toLowerCase() === "gallon refill" || !isValidContainer || s.includes("/");
  if (!needsFix) {
    const matchedScent = findMatch(s, SCENTS) || s;
    const matchedContainer = findMatch(c, CONTAINERS) || c;
    return { container: stripMarkers(matchedContainer), scent: stripMarkers(matchedScent) };
  }
  const combined = s && s.includes("/") ? s : `${c} ${s}`.trim();
  const extracted = extractContainerAndScentFromText(combined);
  return { container: stripMarkers(extracted.container || c), scent: stripMarkers(extracted.scent || s) };
}


