export const PLAYER_SANDBOX = "allow-scripts allow-same-origin allow-forms allow-presentation";
export const MOVIE_PLAYER_HOSTS = ["superflixapi.rest", "superflixapi.monster", "superflixapi.fun", "superflixapi.boats"];
export const CURRENT_MOVIE_PLAYER_HOST = "superflixapi.boats";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const AVATAR_PRESETS = Array.from({ length: 6 }, (_, i) => `/avatars/preset-${i + 1}.svg`);

export function safePlayerUrl(value: string, hosts = [...MOVIE_PLAYER_HOSTS, "embedtv.cc"]): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443")
      && hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`)) ? url.href : null;
  } catch { return null; }
}

export function safeAvatarUrl(value: unknown, supabaseUrl?: string, userId?: string): string | null {
  if (typeof value !== "string") return null;
  if (AVATAR_PRESETS.includes(value)) return value;
  try {
    const url = new URL(value);
    const origin = new URL(supabaseUrl || "").origin;
    const path = /^\/storage\/v1\/object\/public\/avatars\/([a-f0-9-]{36})\/[a-zA-Z0-9.-]+\.(png|jpe?g|webp)$/;
    const match = path.exec(url.pathname);
    const version = url.searchParams.get("v");
    const safeQuery = !url.search || [...url.searchParams].length === 1 && !!version && /^[a-f0-9-]{36}$/.test(version);
    return url.protocol === "https:" && url.origin === origin && !url.username && !url.password && safeQuery && !url.hash
      && match && (!userId || match[1] === userId) ? url.href : null;
  } catch { return null; }
}

export function validateDisplayName(value: string): string {
  const name = value.trim();
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error("Use um nome entre 1 e 80 caracteres.");
  return name;
}

export async function prepareAvatar(file: File): Promise<Blob> {
  if (!AVATAR_MIME_TYPES.includes(file.type) || file.size > AVATAR_MAX_BYTES || !file.size) {
    throw new Error("Escolha uma imagem PNG, JPG ou WebP de até 2 MB.");
  }
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(file.type === "image/png" && png || file.type === "image/jpeg" && jpeg || file.type === "image/webp" && webp)) {
    throw new Error("O conteúdo da imagem não corresponde ao formato informado.");
  }
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("Não foi possível ler esta imagem."); }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 16000000) throw new Error("A imagem deve ter até 16 megapixels.");
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível preparar a imagem.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Re-encode instead of uploading original metadata or active SVG content.
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Imagem inválida.")), "image/png"));
  } finally { bitmap.close(); }
}
