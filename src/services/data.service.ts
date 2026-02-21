/**
 * Data service – SQLite db (Supabase əvəzinə).
 */
import { getDb, genId } from "@/lib/db";
import type { Hackathon, Team, Profile, Startup, ItHub } from "@/types/models";
import type { RoleSlug } from "@/types/database.types";

export async function getHackathons(): Promise<Hackathon[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string; name: string; description: string | null;
    start_date: string; end_date: string; location: string | null;
    latitude: number | null; longitude: number | null;
    image_url: string | null; icon_url?: string | null;
    created_at: string; updated_at: string;
  }>("SELECT * FROM hackathons ORDER BY start_date DESC");
  return rows as Hackathon[];
}

export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<Hackathon>("SELECT * FROM hackathons WHERE id = ?", id);
  return rows[0] ?? null;
}

export async function createHackathon(data: {
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  icon_url?: string | null;
}): Promise<Hackathon> {
  const db = await getDb();
  const id = genId();
  await db.runAsync(
    `INSERT INTO hackathons (id, name, description, start_date, end_date, location, latitude, longitude, icon_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, data.name, data.description ?? null, data.start_date, data.end_date,
    data.location ?? null, data.latitude ?? null, data.longitude ?? null, data.icon_url ?? null
  );
  const h = await getHackathonById(id);
  return h!;
}

export async function updateHackathon(id: string, data: Partial<{
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  icon_url: string | null;
}>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.start_date !== undefined) { fields.push("start_date = ?"); values.push(data.start_date); }
  if (data.end_date !== undefined) { fields.push("end_date = ?"); values.push(data.end_date); }
  if (data.location !== undefined) { fields.push("location = ?"); values.push(data.location); }
  if (data.latitude !== undefined) { fields.push("latitude = ?"); values.push(data.latitude); }
  if (data.longitude !== undefined) { fields.push("longitude = ?"); values.push(data.longitude); }
  if (data.icon_url !== undefined) { fields.push("icon_url = ?"); values.push(data.icon_url); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);
  await db.runAsync(`UPDATE hackathons SET ${fields.join(", ")} WHERE id = ?`, ...values);
}

export async function deleteHackathon(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM hackathons WHERE id = ?", id);
}

export async function getItHubs(): Promise<ItHub[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItHub>("SELECT * FROM it_hubs ORDER BY name");
  return rows;
}

export async function getTeamsByHackathonId(hackathonId: string): Promise<Team[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Team>("SELECT * FROM teams WHERE hackathon_id = ?", hackathonId);
  return rows;
}

export async function getTeamById(id: string): Promise<Team | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<Team>("SELECT * FROM teams WHERE id = ?", id);
  return rows[0] ?? null;
}

export async function getTeamMembersWithProfiles(teamId: string): Promise<Array<{
  id: string; user_id: string; role: string; full_name: string | null;
}>> {
  const db = await getDb();
  const members = await db.getAllAsync<{ id: string; user_id: string; role: string }>(
    "SELECT id, user_id, role FROM team_members WHERE team_id = ?", teamId
  );
  const result: Array<{ id: string; user_id: string; role: string; full_name: string | null }> = [];
  for (const m of members) {
    const profRows = await db.getAllAsync<{ full_name: string | null }>(
      "SELECT full_name FROM profiles WHERE id = ?", m.user_id
    );
    result.push({ ...m, full_name: profRows[0]?.full_name ?? null });
  }
  return result;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<Profile & { password_hash?: string }>(
    "SELECT id, role_id, email, full_name, avatar_url, phone, created_at, updated_at FROM profiles WHERE id = ?", id
  );
  if (!rows[0]) return null;
  const { password_hash: _, ...p } = rows[0];
  return p as Profile;
}

export async function getRoleSlugByRoleId(roleId: string): Promise<RoleSlug | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ slug: string }>("SELECT slug FROM roles WHERE id = ?", roleId);
  return (rows[0]?.slug as RoleSlug) ?? null;
}

export async function getRoleIdBySlug(slug: RoleSlug): Promise<string | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string }>("SELECT id FROM roles WHERE slug = ?", slug);
  return rows[0]?.id ?? null;
}

export async function updateProfileRole(profileId: string, roleId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE profiles SET role_id = ?, updated_at = datetime('now') WHERE id = ?",
    roleId, profileId
  );
}

export async function getAllProfiles(): Promise<Array<Profile & { role_slug: RoleSlug }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<Profile & { password_hash?: string }>(
    "SELECT id, role_id, email, full_name, avatar_url, phone, created_at, updated_at FROM profiles ORDER BY COALESCE(email, ''), id"
  );
  const result: Array<Profile & { role_slug: RoleSlug }> = [];
  for (const p of rows) {
    const slug = await getRoleSlugByRoleId(p.role_id);
    if (slug) result.push({ ...p, role_slug: slug } as Profile & { role_slug: RoleSlug });
  }
  return result;
}

export async function deleteProfile(profileId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM profiles WHERE id = ?", profileId);
}

export async function getAllRoles(): Promise<Array<{ id: string; slug: string; name: string }>> {
  const db = await getDb();
  return db.getAllAsync("SELECT id, slug, name FROM roles ORDER BY slug");
}

export async function getStartups(): Promise<Startup[]> {
  // #region agent log
  fetch('http://127.0.0.1:7608/ingest/dc845c4d-7102-4711-a8f1-555bb84dada4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b5ff6e'},body:JSON.stringify({sessionId:'b5ff6e',location:'data.service:getStartups:entry',message:'getStartups called',data:{},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const db = await getDb();
  const rows = await db.getAllAsync<Startup>("SELECT * FROM startups ORDER BY created_at DESC");
  // #region agent log
  const first = rows[0];
  fetch('http://127.0.0.1:7608/ingest/dc845c4d-7102-4711-a8f1-555bb84dada4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b5ff6e'},body:JSON.stringify({sessionId:'b5ff6e',location:'data.service:getStartups:afterQuery',message:'getStartups result',data:{rowCount:rows?.length,firstKeys:first?Object.keys(first):[],sampleId:first?.id},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  return rows;
}

export async function getStartupById(id: string): Promise<Startup | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<Startup>("SELECT * FROM startups WHERE id = ?", id);
  return rows[0] ?? null;
}

export async function insertTeamJoinRequest(teamId: string, userId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO team_join_requests (id, team_id, user_id, status) VALUES (?, ?, ?, 'pending')",
    genId(), teamId, userId
  );
}

export type TeamJoinRequestRow = {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  full_name: string | null;
  email: string | null;
};

export async function getTeamJoinRequests(teamId: string): Promise<TeamJoinRequestRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; team_id: string; user_id: string; status: string }>(
    "SELECT id, team_id, user_id, status FROM team_join_requests WHERE team_id = ? AND status = 'pending'",
    teamId
  );
  const result: TeamJoinRequestRow[] = [];
  for (const r of rows) {
    const p = await db.getAllAsync<{ full_name: string | null; email: string | null }>(
      "SELECT full_name, email FROM profiles WHERE id = ?", r.user_id
    );
    result.push({ ...r, full_name: p[0]?.full_name ?? null, email: p[0]?.email ?? null });
  }
  return result;
}

export async function getTeamLeadUserId(teamId: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ user_id: string }>(
    "SELECT user_id FROM team_members WHERE team_id = ? AND role = 'lead' LIMIT 1", teamId
  );
  return rows[0]?.user_id ?? null;
}

export async function isUserInTeam(teamId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?", teamId, userId
  );
  return rows.length > 0;
}

export async function getJoinRequestStatus(teamId: string, userId: string): Promise<"none" | "pending" | "accepted" | "rejected"> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ status: string }>(
    "SELECT status FROM team_join_requests WHERE team_id = ? AND user_id = ?", teamId, userId
  );
  if (rows.length === 0) return "none";
  return rows[0].status as "pending" | "accepted" | "rejected";
}

export async function acceptTeamJoinRequest(requestId: string): Promise<void> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ team_id: string; user_id: string }>(
    "SELECT team_id, user_id FROM team_join_requests WHERE id = ? AND status = 'pending'", requestId
  );
  if (rows.length === 0) return;
  const { team_id, user_id } = rows[0];
  await db.runAsync(
    "INSERT OR IGNORE INTO team_members (id, team_id, user_id, role) VALUES (?, ?, ?, 'member')",
    genId(), team_id, user_id
  );
  await db.runAsync("UPDATE team_join_requests SET status = 'accepted' WHERE id = ?", requestId);
}

export async function rejectTeamJoinRequest(requestId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE team_join_requests SET status = 'rejected' WHERE id = ?", requestId);
}
