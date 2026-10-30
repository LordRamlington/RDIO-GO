import { RadioStation } from '../types/radio';

export const CURATED_STATIONS: RadioStation[] = [
  // --- CHILL & LO-FI ---
  {
    id: 'rp-mellow',
    name: 'Radio Paradise Mellow',
    category: 'chill',
    subgenre: 'Acoustic Downtempo & Chill',
    streamUrl: 'https://stream.radioparadise.com/mellow-128',
    backupStreamUrls: ['https://stream.radioparadise.com/mp3-128'],
    bitrate: 128,
    codec: 'MP3',
    country: 'United States',
    countryCode: 'US',
    description: 'A relaxing, mellow eclectic mix of acoustic, ambient, and downtempo songs curated by Bill & Rebecca.',
    accentColor: '#10b981', // Emerald
    tags: ['Acoustic', 'Chillout', 'Downtempo', 'Relax'],
    homepage: 'https://radioparadise.com',
  },
  {
    id: 'fip-paris',
    name: 'FIP Radio Paris',
    category: 'chill',
    subgenre: 'Eclectic Chill & Chansons',
    streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Legendary Parisian broadcaster blending jazz, chansons, world beats, and cultural soundscapes commercial-free.',
    accentColor: '#f43f5e', // Rose
    tags: ['Eclectic', 'Parisian', 'Chill', 'Cinematic'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- JAZZ & SWING ---
  {
    id: 'tsf-jazz',
    name: 'TSF Jazz Paris',
    category: 'jazz',
    subgenre: 'Bebop, Swing & Classic Jazz',
    streamUrl: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'France’s premier 24/7 jazz station broadcasting legendary jazz standards, swing, and live Parisian sessions.',
    accentColor: '#f59e0b', // Amber
    tags: ['Jazz', 'Swing', 'Bebop', 'Paris'],
    homepage: 'https://www.tsfjazz.com',
  },
  {
    id: 'fip-jazz',
    name: 'FIP Jazz',
    category: 'jazz',
    subgenre: 'Nu-Jazz, Soul & Contemporary',
    streamUrl: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Modern jazz, post-bop explorations, and afro-cuban rhythms curated by Radio France musicologists.',
    accentColor: '#d97706', // Warm Amber
    tags: ['Nu Jazz', 'Modern Jazz', 'Soul', 'Groove'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- BLUES & SOUL ---
  {
    id: 'fip-groove',
    name: 'FIP Groove & Blues',
    category: 'blues',
    subgenre: 'Vintage Soul, Funk & Delta Blues',
    streamUrl: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Pure soul, Motown classics, deep funk grooves, and electrified Mississippi Delta blues.',
    accentColor: '#3b82f6', // Electric Blue
    tags: ['Blues', 'Funk', 'Soul', 'Motown', 'Vinyl'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- ROCK & INDIE ---
  {
    id: 'rp-rock',
    name: 'Radio Paradise Rock',
    category: 'rock',
    subgenre: 'Classic & Modern Rock',
    streamUrl: 'https://stream.radioparadise.com/rock-128',
    backupStreamUrls: ['https://stream.radioparadise.com/mp3-128'],
    bitrate: 128,
    codec: 'MP3',
    country: 'United States',
    countryCode: 'US',
    description: 'High-energy eclectic rock from classic icons to indie innovators with flawless flow and zero ads.',
    accentColor: '#f97316', // Orange
    tags: ['Classic Rock', 'Indie', 'Alternative', 'Progressive'],
    homepage: 'https://radioparadise.com',
  },
  {
    id: 'fip-rock',
    name: 'FIP Rock Alternative',
    category: 'rock',
    subgenre: 'Post-Punk, Garage & Indie Rock',
    streamUrl: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'From psychedelic 60s garage to 90s grunge and modern British post-punk guitar anthems.',
    accentColor: '#ef4444', // Red
    tags: ['Alternative', 'Garage', 'Post-Punk', 'Indie'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- METAL & HEAVY ---
  {
    id: 'fip-metal',
    name: 'FIP Metal',
    category: 'metal',
    subgenre: 'Heavy, Thrash & Doom Metal',
    streamUrl: 'https://icecast.radiofrance.fr/fipmetal-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Heavy metal mastery: Sabbath, Maiden, Slayer, Mastodon, and cutting-edge underground riffs.',
    accentColor: '#dc2626', // Crimson Red
    tags: ['Heavy Metal', 'Thrash', 'Doom', 'Hard Rock'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- POP & MODERN HITS ---
  {
    id: 'rp-main',
    name: 'Radio Paradise Main Mix',
    category: 'pop',
    subgenre: 'Eclectic Pop & World Indie',
    streamUrl: 'https://stream.radioparadise.com/mp3-128',
    backupStreamUrls: ['https://stream.radioparadise.com/mellow-128'],
    bitrate: 128,
    codec: 'MP3',
    country: 'United States',
    countryCode: 'US',
    description: 'The flagship Radio Paradise mix blending pop, rock, world, and acoustic tracks in seamless harmony.',
    accentColor: '#ec4899', // Pink
    tags: ['Eclectic', 'Songwriters', 'Indie Pop', 'Melodic'],
    homepage: 'https://radioparadise.com',
  },
  {
    id: 'fip-pop',
    name: 'FIP Pop Radio',
    category: 'pop',
    subgenre: 'Sophisticated Pop & Indie Hooks',
    streamUrl: 'https://icecast.radiofrance.fr/fippop-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Catchy hooks, vibrant electronic melodies, and sophisticated European and American pop songwriting.',
    accentColor: '#e11d48', // Vibrant Rose
    tags: ['Pop', 'Indie Pop', 'Dance', 'Melodic'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- HIP-HOP & URBAN ---
  {
    id: 'mouv-urban',
    name: 'Mouv’ Radio Paris',
    category: 'hiphop',
    subgenre: 'French & US Hip-Hop, Rap & Trap',
    streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'France’s premier national urban music network playing cutting-edge rap, hip-hop, drill, and R&B.',
    accentColor: '#eab308', // Gold
    tags: ['Hip-Hop', 'Rap', 'Trap', 'Urban Culture'],
    homepage: 'https://www.radiofrance.fr/mouv',
  },

  // --- ELECTRONIC & DANCE ---
  {
    id: 'fip-electro',
    name: 'FIP Electro',
    category: 'electronic',
    subgenre: 'Deep House, Techno & Synthwave',
    streamUrl: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'From Berlin techno and Chicago deep house to ambient French Touch and futuristic synthwave.',
    accentColor: '#06b6d4', // Cyan
    tags: ['EDM', 'Deep House', 'Techno', 'French Touch'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- CLASSICAL & ORCHESTRAL ---
  {
    id: 'france-musique',
    name: 'France Musique',
    category: 'classical',
    subgenre: 'Symphonies, Concertos & Chamber',
    streamUrl: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Prestigious classical live concert broadcasts from Paris: Beethoven, Mozart, Bach, and romantic symphonies.',
    accentColor: '#ca8a04', // Deep Gold
    tags: ['Classical', 'Orchestral', 'Paris', 'Opera'],
    homepage: 'https://www.radiofrance.fr/francemusique',
  },

  // --- NEWS, CULTURE & PUBLIC RADIO ---
  {
    id: 'bbc-world-service',
    name: 'BBC World Service',
    category: 'news',
    subgenre: 'Global News & In-depth Analysis',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    bitrate: 128,
    codec: 'MP3',
    country: 'United Kingdom',
    countryCode: 'GB',
    description: 'Award-winning global breaking news, investigative journalism, cultural analysis, and sports from London.',
    accentColor: '#ef4444', // Red
    tags: ['Breaking News', 'BBC', 'Journalism', 'Current Affairs'],
    homepage: 'https://www.bbc.co.uk/worldserviceradio',
  },
  {
    id: 'france-inter',
    name: 'France Inter',
    category: 'news',
    subgenre: 'News, Culture & Debates',
    streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'France’s flagship public service news channel featuring high-caliber political debate, culture, and science.',
    accentColor: '#f43f5e', // Rose
    tags: ['French News', 'Debates', 'Culture', 'Talk'],
    homepage: 'https://www.radiofrance.fr/franceinter',
  },
  {
    id: 'wnyc-fm',
    name: 'WNYC 93.9 FM New York',
    category: 'news',
    subgenre: 'Public Radio & Conversations',
    streamUrl: 'https://fm939.wnyc.org/wnycfm-app.aac',
    bitrate: 128,
    codec: 'AAC',
    country: 'United States',
    countryCode: 'US',
    description: 'NPR News and compelling storytelling from New York Public Radio with thought-provoking dialogue.',
    accentColor: '#0284c7', // Sky Blue
    tags: ['NPR', 'New York', 'Interviews', 'Culture'],
    homepage: 'https://www.wnyc.org',
  },

  // --- RETRO (70s & 80s) ---
  {
    id: 'heart-80s',
    name: 'Heart 80s Radio',
    category: 'retro',
    subgenre: '80s Anthems & Synthpop',
    streamUrl: 'https://media-ssl.musicradio.com/Heart80sMP3',
    bitrate: 128,
    codec: 'MP3',
    country: 'United Kingdom',
    countryCode: 'GB',
    description: 'Non-stop greatest feel-good hits of the 1980s: Wham!, Michael Jackson, Madonna, and Duran Duran.',
    accentColor: '#8b5cf6', // Violet
    tags: ['80s', 'Feel Good', 'Synthpop', 'Pop Rock'],
    homepage: 'https://www.heart.co.uk/80s/',
  },

  // --- COUNTRY & AMERICANA ---
  {
    id: 'kickin-country-181',
    name: '181.FM Kickin’ Country',
    category: 'country',
    subgenre: 'Today’s Hit Country & Nashville',
    streamUrl: 'https://listen.181fm.com/181-kickincountry_128k.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'United States',
    countryCode: 'US',
    description: 'Nashville hot country: Luke Combs, Morgan Wallen, Carrie Underwood, and modern country storytelling.',
    accentColor: '#b45309', // Rust Brown
    tags: ['Country', 'Nashville', 'Americana', 'Acoustic'],
    homepage: 'https://www.181.fm',
  },

  // --- REGGAE & DUB ---
  {
    id: 'fip-reggae',
    name: 'FIP Reggae & Dub',
    category: 'reggae',
    subgenre: 'Roots Reggae, Dub & Rocksteady',
    streamUrl: 'https://icecast.radiofrance.fr/fipreggae-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'Echo chamber dub, vintage Kingston rocksteady, roots reggae, and modern sound system culture.',
    accentColor: '#22c55e', // Green
    tags: ['Reggae', 'Dub', 'Roots', 'Kingston'],
    homepage: 'https://www.radiofrance.fr/fip',
  },

  // --- CINEMA & SOUNDTRACKS ---
  {
    id: 'cinemix-fm',
    name: 'Cinemix Soundtracks',
    category: 'soundtrack',
    subgenre: 'Film Scores & Movie Themes',
    streamUrl: 'https://kathy.torontocast.com:1825/stream',
    bitrate: 128,
    codec: 'MP3',
    country: 'Canada',
    countryCode: 'CA',
    description: 'The world’s best movie soundtracks: Hans Zimmer, John Williams, Ennio Morricone, and epic cinema themes.',
    accentColor: '#14b8a6', // Teal
    tags: ['Movie Scores', 'Soundtracks', 'Epic', 'Orchestra'],
    homepage: 'https://www.cinemix.us',
  },

  // --- WORLD & GLOBAL ---
  {
    id: 'fip-monde',
    name: 'FIP World Music',
    category: 'world',
    subgenre: 'Afrobeat, Cumbia & Asian Fusion',
    streamUrl: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: 'A rich tapestry of global beats: West African highlife, Balkan brass, Colombian cumbia, and Indian fusion.',
    accentColor: '#a855f7', // Purple
    tags: ['World Music', 'Afrobeat', 'Global', 'Fusion'],
    homepage: 'https://www.radiofrance.fr/fip',
  },
  {
    id: 'latina-fm',
    name: 'Radio Latina FM',
    category: 'latin',
    subgenre: 'Salsa, Bachata & Reggaeton',
    streamUrl: 'https://start-latina.ice.infomaniak.ch/start-latina-high.mp3',
    bitrate: 128,
    codec: 'MP3',
    country: 'France',
    countryCode: 'FR',
    description: '100% caliente Latin music: salsa, bachata, merengue, and high-energy tropical hits straight from the club.',
    accentColor: '#f43f5e', // Rose
    tags: ['Latin', 'Salsa', 'Bachata', 'Reggaeton'],
    homepage: 'https://www.latina.fr',
  },
];
