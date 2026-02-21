/**
 * SES – SQLite database (Supabase əvəzinə local DB).
 * Şəbəkə problemlərindən asılı deyil.
 */
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

let db: SQLiteDatabase | null = null;

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function genId(): string {
  return uuid();
}

export async function getDb(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync("ses.db");
  await initSchema();
  return db;
}

async function initSchema(): Promise<void> {
  const schema = `
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      email TEXT,
      password_hash TEXT,
      full_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );
    CREATE TABLE IF NOT EXISTS hackathons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location TEXT,
      latitude REAL,
      longitude REAL,
      image_url TEXT,
      icon_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      team_role TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
    );
    CREATE TABLE IF NOT EXISTS it_hubs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (user_id) REFERENCES profiles(id),
      UNIQUE(team_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS team_join_requests (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (user_id) REFERENCES profiles(id),
      UNIQUE(team_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS startups (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      logo_url TEXT,
      stage TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES profiles(id),
      UNIQUE(owner_id)
    );
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role_id);
    CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON teams(hackathon_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
  `;
  await db!.execAsync(schema);
  try {
    await db!.runAsync("ALTER TABLE teams ADD COLUMN team_role TEXT");
  } catch {
    // column already exists
  }
  await seedIfEmpty();
  await seedDemoAccountsIfMissing();
  await seedItHubsIfEmpty();
}

/** Mövcud DB-də çatışmayan demo hesabları əlavə et (startup, investor, itcompany, organizer) */
async function seedDemoAccountsIfMissing(): Promise<void> {
  const hash = (p: string) => p;
  const demos: Array<{ email: string; password: string; fullName: string; roleSlug: string }> = [
    { email: "startup@gmail.com", password: "startup123", fullName: "İştirakçı Nümunəsi", roleSlug: "startup" },
    { email: "investor@gmail.com", password: "investor123", fullName: "İnvestor", roleSlug: "investor" },
    { email: "itcompany@gmail.com", password: "itcompany123", fullName: "İT Şirkət", roleSlug: "it_company" },
    { email: "organizer@gmail.com", password: "organizer123", fullName: "Təşkilatçı", roleSlug: "organizer" },
  ];
  for (const d of demos) {
    const existing = await db!.getAllAsync<{ id: string }>("SELECT id FROM profiles WHERE email = ?", d.email);
    if (existing.length > 0) continue;
    const roleRows = await db!.getAllAsync<{ id: string }>("SELECT id FROM roles WHERE slug = ?", d.roleSlug);
    const roleId = roleRows[0]?.id;
    if (!roleId) continue;
    await db!.runAsync(
      "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
      genId(), roleId, d.email, hash(d.password), d.fullName
    );
  }
}

async function seedItHubsIfEmpty(): Promise<void> {
  const rows = await db!.getAllAsync<{ n: number }>("SELECT COUNT(*) as n FROM it_hubs");
  if (rows[0]?.n && rows[0].n > 0) return;
  const itHubs: Array<{ name: string; address: string; lat: number; lng: number }> = [
    { name: "Bakı Tech Park", address: "Bakı", lat: 40.3777, lng: 49.8920 },
    { name: "SABAH Hub", address: "Bakı", lat: 40.3956, lng: 49.8542 },
    { name: "Gəncə İnnovasiya Mərkəzi", address: "Gəncə", lat: 40.6769, lng: 46.3567 },
    { name: "Sumqayıt IT Mərkəzi", address: "Sumqayıt", lat: 40.5897, lng: 49.6686 },
    { name: "Mingəçevir Tech Hub", address: "Mingəçevir", lat: 40.77, lng: 47.0489 },
    { name: "Naxçıvan İnnovasiya Mərkəzi", address: "Naxçıvan", lat: 39.2089, lng: 45.4122 },
  ];
  for (const hub of itHubs) {
    await db!.runAsync(
      "INSERT INTO it_hubs (id, name, description, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)",
      genId(), hub.name, `${hub.name} – IT mərkəzi`, hub.address, hub.lat, hub.lng
    );
  }
}

async function seedIfEmpty(): Promise<void> {
  const roles = await db!.getAllAsync<{ id: string }>("SELECT id FROM roles LIMIT 1");
  if (roles.length > 0) return;

  const now = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 19);
  const ids: string[] = [];

  // Roles: startup, investor, it_company, organizer, admin, super_admin
  const roleRows = [
    ["startup", "İştirakçı"],
    ["investor", "İnvestor"],
    ["it_company", "İT Şirkət"],
    ["organizer", "Təşkilatçı"],
    ["admin", "Admin"],
    ["super_admin", "Super Admin"],
  ];
  for (const [slug, name] of roleRows) {
    const id = genId();
    ids.push(id);
    await db!.runAsync("INSERT INTO roles (id, slug, name) VALUES (?, ?, ?)", id, slug, name);
  }
  const [ridStartup, ridInvestor, ridIt, ridOrg, ridAdmin, ridSuper] = ids;

  // Simple password hash (demo: plain storage for "admin123" / "super123")
  const hash = (p: string) => p; // Demo: store plain

  // Admin, Superadmin və rol nümunə hesabları (hər növ üçün ayrı mail/parol)
  const adminAdmin = genId();
  const adminSuper = genId();
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    adminAdmin, ridAdmin, "admin@gmail.com", hash("admin123"), "Admin"
  );
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    adminSuper, ridSuper, "superadmin@gmail.com", hash("super123"), "Super Admin"
  );
  // İştirakçı, İnvestor, İT Şirkət, Təşkilatçı – fərqli mail və parol
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    genId(), ridStartup, "startup@gmail.com", hash("startup123"), "İştirakçı Nümunəsi"
  );
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    genId(), ridInvestor, "investor@gmail.com", hash("investor123"), "İnvestor"
  );
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    genId(), ridIt, "itcompany@gmail.com", hash("itcompany123"), "İT Şirkət"
  );
  await db!.runAsync(
    "INSERT INTO profiles (id, role_id, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
    genId(), ridOrg, "organizer@gmail.com", hash("organizer123"), "Təşkilatçı"
  );

  const participantIds: string[] = [];
  const firstNames = ["Əli", "Aysel", "Rəşad", "Leyla", "Vüqar", "Nərmin", "Orxan", "Səbinə", "Tural", "Zəhra"];
  const lastNames = ["Məmmədov", "Quliyeva", "Həsənov", "Əliyeva", "Cəfərov", "Məmmədova", "Rəhimov", "Hüseynova", "Məlikov", "Rzayeva"];
  for (let i = 0; i < 100; i++) {
    const id = genId();
    participantIds.push(id);
    const fn = firstNames[i % 10];
    const ln = lastNames[i % 10];
    await db!.runAsync(
      "INSERT INTO profiles (id, role_id, email, full_name) VALUES (?, ?, ?, ?)",
      id, ridStartup, `user${i + 1}@demo.az`, `${fn} ${ln}`
    );
  }

  // Şəhər daxili təsadüfi koordinat (min/max lat-lng)
  const randomIn = (min: number, max: number) => min + Math.random() * (max - min);
  const cityBounds: Array<{ name: string; location: string; latMin: number; latMax: number; lngMin: number; lngMax: number; icon?: string }> = [
    { name: "FinTech Hackathon 2025", location: "Bakı", latMin: 40.36, latMax: 40.44, lngMin: 49.80, lngMax: 49.92, icon: "🏆" },
    { name: "HealthTech Summit", location: "Sumqayıt", latMin: 40.56, latMax: 40.62, lngMin: 49.62, lngMax: 49.72, icon: "💻" },
    { name: "AI Innovation Challenge", location: "Gəncə", latMin: 40.66, latMax: 40.70, lngMin: 46.32, lngMax: 46.40, icon: "🤖" },
    { name: "GreenTech Accelerator", location: "Lənkəran", latMin: 38.72, latMax: 38.78, lngMin: 48.82, lngMax: 48.88, icon: "🌱" },
    { name: "EduTech Hack", location: "Mingəçevir", latMin: 40.76, latMax: 40.79, lngMin: 47.02, lngMax: 47.08, icon: "📚" },
    { name: "Smart City Challenge", location: "Naxçıvan", latMin: 39.18, latMax: 39.22, lngMin: 45.38, lngMax: 45.44, icon: "🏙️" },
    { name: "AgriTech Hackathon", location: "Qəbələ", latMin: 40.96, latMax: 41.00, lngMin: 47.82, lngMax: 47.88, icon: "🌾" },
    { name: "CyberSec Bootcamp", location: "Şəki", latMin: 41.17, latMax: 41.22, lngMin: 47.14, lngMax: 47.22, icon: "🔐" },
    { name: "Social Impact Hack", location: "Masallı", latMin: 38.96, latMax: 39.04, lngMin: 48.62, lngMax: 48.72, icon: "❤️" },
    { name: "DeepTech Lab", location: "Şirvan", latMin: 39.90, latMax: 39.96, lngMin: 48.88, lngMax: 48.96, icon: "🚀" },
  ];
  const hackathonIds: string[] = [];
  for (let h = 0; h < cityBounds.length; h++) {
    const d = cityBounds[h];
    const id = genId();
    hackathonIds.push(id);
    const lat = randomIn(d.latMin, d.latMax);
    const lng = randomIn(d.lngMin, d.lngMax);
    const start = now(h * 30);
    const end = now(h * 30 + 3);
    await db!.runAsync(
      `INSERT INTO hackathons (id, name, description, start_date, end_date, location, latitude, longitude, icon_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, d.name, `Hackathon: ${d.name}.`, start, end, d.location + ", Azərbaycan", lat, lng, d.icon ?? null
    );
  }

  // Komandalar: maraqlı nicklər + vəzifə (team_role)
  const teamRoles = [
    "Backend Lead", "Frontend", "DevOps", "UI/UX", "Team Lead",
    "Full-Stack", "Mobile", "QA", "ML Engineer", "Security",
  ];
  const teamNames = [
    "CodeNinjas", "PixelPirates", "CloudRiders", "DesignMasters", "BugHunters",
    "DataWizards", "AppCrafters", "TestTitans", "NeuralNerds", "CryptoGuard",
  ];
  for (let h = 0; h < 10; h++) {
    const hackId = hackathonIds[h];
    for (let t = 0; t < 10; t++) {
      const teamId = genId();
      const role = teamRoles[t % teamRoles.length];
      const nick = teamNames[t % teamNames.length];
      await db!.runAsync(
        "INSERT INTO teams (id, hackathon_id, name, team_role, description) VALUES (?, ?, ?, ?, ?)",
        teamId, hackId, nick, role, `${role} · ${nick}`
      );
      const base = (h * 10 + t) * 5;
      for (let m = 0; m < 5; m++) {
        const uid = participantIds[(base + m) % 100];
        await db!.runAsync(
          "INSERT OR IGNORE INTO team_members (id, team_id, user_id, role) VALUES (?, ?, ?, ?)",
          genId(), teamId, uid, m === 0 ? "lead" : "member"
        );
      }
    }
  }

  // IT mərkəzləri (xəritədə yaşıl markerlər)
  const itHubs: Array<{ name: string; address: string; lat: number; lng: number }> = [
    { name: "Bakı Tech Park", address: "Bakı", lat: 40.3777, lng: 49.8920 },
    { name: "SABAH Hub", address: "Bakı", lat: 40.3956, lng: 49.8542 },
    { name: "Gəncə İnnovasiya Mərkəzi", address: "Gəncə", lat: 40.6769, lng: 46.3567 },
    { name: "Sumqayıt IT Mərkəzi", address: "Sumqayıt", lat: 40.5897, lng: 49.6686 },
    { name: "Mingəçevir Tech Hub", address: "Mingəçevir", lat: 40.7700, lng: 47.0489 },
    { name: "Naxçıvan İnnovasiya Mərkəzi", address: "Naxçıvan", lat: 39.2089, lng: 45.4122 },
  ];
  for (const hub of itHubs) {
    await db!.runAsync(
      "INSERT INTO it_hubs (id, name, description, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)",
      genId(), hub.name, `${hub.name} – IT mərkəzi`, hub.address, hub.lat, hub.lng
    );
  }

  // 5 startups (each with unique owner from participants)
  for (let i = 0; i < 5; i++) {
    await db!.runAsync(
      "INSERT INTO startups (id, owner_id, name, description, stage) VALUES (?, ?, ?, ?, ?)",
      genId(), participantIds[50 + i], `Startap ${i + 1}`, `Demo startap ${i + 1}`, "mvp"
    );
  }
}
