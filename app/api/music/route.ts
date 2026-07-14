import { readdir } from "fs/promises";
import path from "path";

const playlistMap: Record<string, string> = {
  "Heavy-Lift": "Heavy Lift",
  "Morning-Energy": "Morning Energy",
  "Cardio-Blast": "Cardio Blast",
  "Muscle-Gain": "Muscle Gain",
  "Fat-Burn": "Fat Burn",
  "Cycling": "Cycling",
  "Yoga-Stretching": "Yoga & Stretching",
  "Cool-Down": "Cool Down",
};

const artistMap: Record<string, string> = {
  "Heavy-Lift": "Apex Pulse",
  "Morning-Energy": "Sunrise Labs",
  "Cardio-Blast": "Tempo District",
  "Muscle-Gain": "Iron Drive",
  "Fat-Burn": "Burnline",
  "Cycling": "Velocity Crew",
  "Yoga-Stretching": "Still Motion",
  "Cool-Down": "Afterglow",
};

export async function GET() {
  try {
    const directory = path.join(process.cwd(), "public", "music");
    const files = await readdir(directory);
    const tracks = files
      .filter((file) => /\.mp3$/i.test(file))
      .sort()
      .map((file, index) => {
        const stem = file.replace(/\.mp3$/i, "");
        const normalizedStem = stem.replace(/^[._-]+|[._-]+$/g, "");
        const matchedPlaylist = Object.entries(playlistMap).find(([key]) => normalizedStem.toLowerCase().startsWith(`${key.toLowerCase()}-`));
        const key = matchedPlaylist?.[0];
        const playlist = key ? playlistMap[key] : "Heavy Lift";
        const artist = key ? artistMap[key] : "Titan Sounds";
        const titleStem = key ? normalizedStem.slice(key.length).replace(/^[._-]+/, "") : normalizedStem;
        const title = titleStem.replace(/-/g, " ") || normalizedStem.replace(/-/g, " ");

        return {
          id: `${index}-${file}`,
          title,
          artist,
          album: `${playlist} Session`,
          playlist,
          src: `/music/${encodeURIComponent(file)}`,
        };
      });

    return Response.json({ tracks });
  } catch {
    return Response.json({ tracks: [] });
  }
}
