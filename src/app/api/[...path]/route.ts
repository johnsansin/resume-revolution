import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { hashResetToken, HttpError, requireAdmin, requireSession, signSession } from '@/server/auth';
import { rateLimit } from '@/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ path: string[] }> };
const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
const emailOf = (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validPassword = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 6 && value.length <= 128;

async function body<T extends Record<string, unknown> = Record<string, unknown>>(request: NextRequest): Promise<T> {
  try { return await request.json() as T; }
  catch { throw new HttpError(400, 'Invalid JSON body'); }
}

async function roles(userId: string) {
  const result = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [userId]);
  return result.rows.map((row) => row.role as string);
}

function userJson(row: Record<string, unknown>, userRoles: string[]) {
  return {
    id: row.id, email: row.email, displayName: row.display_name,
    avatarUrl: row.avatar_url, phone: row.phone || '', profileData: row.profile_data || {}, isActive: row.is_active,
    createdAt: row.created_at, roles: userRoles,
  };
}

function cvJson(row: Record<string, unknown>) {
  return {
    id: row.id, name: row.name, cvData: row.cv_data, templateId: row.template_id,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function auth(request: NextRequest, action: string, method: string) {
  if (['register', 'login', 'forgot-password', 'reset-password'].includes(action)) rateLimit(request);
  if (action === 'register' && method === 'POST') {
    const data = await body(request);
    const email = emailOf(data.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Invalid email format');
    if (!validPassword(data.password)) throw new HttpError(400, 'Password must be between 6 and 128 characters');
    const name = typeof data.displayName === 'string' && data.displayName.trim()
      ? data.displayName.trim().slice(0, 100) : email.split('@')[0];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const passwordHash = await bcrypt.hash(data.password, 12);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1,$2,$3) RETURNING id,email,display_name,avatar_url,phone,profile_data,is_active,created_at,token_version`,
        [email, passwordHash, name],
      );
      const user = result.rows[0];
      await client.query("INSERT INTO user_roles (user_id,role) VALUES ($1,'user')", [user.id]);
      await client.query(
        `INSERT INTO notifications(user_id,type,title,body,link)
         SELECT DISTINCT user_id,'registration','New user registered',$1,$2
         FROM user_roles WHERE role='admin'`,
        [`${name} (${email}) created a new account.`, `/admin/users?search=${encodeURIComponent(email)}`],
      );
      await client.query('COMMIT');
      const token = signSession({ userId: user.id, email, tokenVersion: user.token_version, purpose: 'access' });
      return ok({ user: userJson(user, ['user']), token }, 201);
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if ((error as { code?: string }).code === '23505') throw new HttpError(409, 'An account with this email already exists');
      throw error;
    } finally { client.release(); }
  }
  if (action === 'login' && method === 'POST') {
    const data = await body(request);
    const email = emailOf(data.email);
    const result = await pool.query(
      'SELECT id,email,password_hash,display_name,avatar_url,phone,profile_data,is_active,created_at,token_version FROM users WHERE email=$1',
      [email],
    );
    const user = result.rows[0];
    if (!user || typeof data.password !== 'string' || !await bcrypt.compare(data.password, user.password_hash)) {
      throw new HttpError(401, 'Invalid email or password');
    }
    if (!user.is_active) throw new HttpError(403, 'This account has been deactivated');
    const token = signSession({ userId: user.id, email, tokenVersion: user.token_version, purpose: 'access' });
    await pool.query(
      'INSERT INTO login_history (user_id,email,ip_address,user_agent) VALUES ($1,$2,$3,$4)',
      [user.id, email, request.headers.get('x-forwarded-for')?.split(',')[0] || '', (request.headers.get('user-agent') || '').slice(0, 300)],
    );
    return ok({ user: userJson(user, await roles(user.id)), token });
  }
  if (action === 'me' && method === 'GET') {
    const session = await requireSession(request);
    const result = await pool.query(
      'SELECT id,email,display_name,avatar_url,phone,profile_data,is_active,created_at FROM users WHERE id=$1', [session.userId],
    );
    return ok(userJson(result.rows[0], await roles(session.userId)));
  }
  if (action === 'profile' && method === 'PUT') {
    const session = await requireSession(request);
    const data = await body(request);
    const name = typeof data.displayName === 'string' ? data.displayName.trim().slice(0, 100) : null;
    const avatar = typeof data.avatarUrl === 'string' ? data.avatarUrl.slice(0, 2_000_000) : null;
    const phone = typeof data.phone === 'string' ? data.phone.trim().slice(0, 25) : null;
    const allowedProfileFields = ['jobTitle','location','address','dateOfBirth','nationality','gender','driverLicense','website','linkedin','summary'];
    const profileData = data.profileData && typeof data.profileData === 'object'
      ? Object.fromEntries(allowedProfileFields.filter((key) => typeof (data.profileData as Record<string, unknown>)[key] === 'string').map((key) => [key, String((data.profileData as Record<string, unknown>)[key]).trim().slice(0, key === 'summary' ? 2000 : 250)]))
      : null;
    if (phone !== null && phone && !/^\+?[0-9()\-\s.]{7,25}$/.test(phone)) throw new HttpError(400, 'Enter a valid mobile number');
    if (data.displayName === undefined && data.avatarUrl === undefined && data.phone === undefined && data.profileData === undefined) throw new HttpError(400, 'No updates provided');
    const result = await pool.query(
      `UPDATE users SET display_name=COALESCE($1,display_name),avatar_url=COALESCE($2,avatar_url),phone=COALESCE($3,phone),profile_data=COALESCE($4::jsonb,profile_data),updated_at=now()
       WHERE id=$5 RETURNING id,email,display_name,avatar_url,phone,profile_data,is_active,created_at`,
      [name, avatar, phone, profileData ? JSON.stringify(profileData) : null, session.userId],
    );
    return ok(userJson(result.rows[0], await roles(session.userId)));
  }
  if (action === 'change-password' && method === 'PUT') {
    const session = await requireSession(request);
    const data = await body(request);
    if (!validPassword(data.newPassword) || typeof data.currentPassword !== 'string') {
      throw new HttpError(400, 'Current password and a 6-128 character new password are required');
    }
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [session.userId]);
    if (!await bcrypt.compare(data.currentPassword, result.rows[0].password_hash)) {
      throw new HttpError(401, 'Current password is incorrect');
    }
    await pool.query(
      'UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=now() WHERE id=$2',
      [await bcrypt.hash(data.newPassword, 12), session.userId],
    );
    return ok({ message: 'Password changed successfully' });
  }
  if (action === 'forgot-password' && method === 'POST') {
    const data = await body(request);
    const email = emailOf(data.email);
    const result = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (result.rowCount) {
      const token = crypto.randomBytes(32).toString('base64url');
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id=$1 OR expires_at<now()', [result.rows[0].id]);
      await pool.query(
        "INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '15 minutes')",
        [result.rows[0].id, hashResetToken(token)],
      );
      if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_DEV_RESET_TOKEN === 'true') {
        return ok({ message: 'Development reset token generated', resetToken: token });
      }
    }
    return ok({ message: 'If an account exists with that email, you will receive a password reset link.' });
  }
  if (action === 'reset-password' && method === 'PUT') {
    const data = await body(request);
    if (typeof data.token !== 'string' || !validPassword(data.newPassword)) {
      throw new HttpError(400, 'A valid token and 10-128 character password are required');
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const resetResult = await client.query(
        'SELECT id,user_id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE',
        [hashResetToken(data.token)],
      );
      if (!resetResult.rowCount) throw new HttpError(401, 'Invalid or expired reset token');
      await client.query(
        'UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=now() WHERE id=$2',
        [await bcrypt.hash(data.newPassword, 12), resetResult.rows[0].user_id],
      );
      await client.query('UPDATE password_reset_tokens SET used_at=now() WHERE id=$1', [resetResult.rows[0].id]);
      await client.query('COMMIT');
      return ok({ message: 'Password reset successfully' });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  throw new HttpError(404, 'API route not found');
}

async function cvs(request: NextRequest, id: string | undefined, method: string) {
  const session = await requireSession(request);
  if (!id && method === 'GET') {
    const result = await pool.query(
      'SELECT id,name,cv_data,template_id,created_at,updated_at FROM saved_cvs WHERE user_id=$1 AND deleted_at IS NULL ORDER BY updated_at DESC',
      [session.userId],
    );
    return ok(result.rows.map(cvJson));
  }
  if (!id && method === 'POST') {
    const data = await body(request);
    if (!data.cvData || typeof data.cvData !== 'object') throw new HttpError(400, 'CV data is required');
    const result = await pool.query(
      `INSERT INTO saved_cvs(user_id,name,cv_data,template_id) VALUES($1,$2,$3,$4)
       RETURNING id,name,cv_data,template_id,created_at,updated_at`,
      [session.userId, String(data.name || 'Untitled CV').slice(0, 200), data.cvData, String(data.templateId || 'classic').slice(0, 50)],
    );
    return ok(cvJson(result.rows[0]), 201);
  }
  if (id && method === 'GET') {
    const result = await pool.query(
      'SELECT id,name,cv_data,template_id,created_at,updated_at FROM saved_cvs WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL',
      [id, session.userId],
    );
    if (!result.rowCount) throw new HttpError(404, 'CV not found');
    return ok(cvJson(result.rows[0]));
  }
  if (id && method === 'PUT') {
    const data = await body(request);
    const result = await pool.query(
      `UPDATE saved_cvs SET name=COALESCE($1,name),cv_data=COALESCE($2,cv_data),template_id=COALESCE($3,template_id),updated_at=now()
       WHERE id=$4 AND user_id=$5 AND deleted_at IS NULL RETURNING id,name,cv_data,template_id,created_at,updated_at`,
      [data.name ?? null, data.cvData ?? null, data.templateId ?? null, id, session.userId],
    );
    if (!result.rowCount) throw new HttpError(404, 'CV not found');
    return ok(cvJson(result.rows[0]));
  }
  if (id && method === 'DELETE') {
    const result = await pool.query(
      'UPDATE saved_cvs SET deleted_at=now(),deleted_by=$2 WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING id',
      [id, session.userId],
    );
    if (!result.rowCount) throw new HttpError(404, 'CV not found');
    return ok({ message: 'CV moved to recycle bin' });
  }
  throw new HttpError(405, 'Method not allowed');
}

const messageJson = (row: Record<string, unknown>) => ({ id:row.id, senderId:row.sender_id, receiverId:row.receiver_id,
  message:row.message, readAt:row.read_at, createdAt:row.created_at, senderName:row.sender_name, senderEmail:row.sender_email });

async function notifications(request: NextRequest, path: string[], method: string) {
  const session = await requireSession(request);
  if (!path[0] && method === 'GET') {
    const result = await pool.query('SELECT id,type,title,body,link,read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [session.userId]);
    return ok({ notifications:result.rows.map((row) => ({ id:row.id,type:row.type,title:row.title,body:row.body,link:row.link,readAt:row.read_at,createdAt:row.created_at })), unread:result.rows.filter((row) => !row.read_at).length });
  }
  if (path[0] === 'read-all' && method === 'PUT') { await pool.query('UPDATE notifications SET read_at=coalesce(read_at,now()) WHERE user_id=$1', [session.userId]); return ok({ message:'Notifications marked read' }); }
  if (path[0] && method === 'PUT') { await pool.query('UPDATE notifications SET read_at=coalesce(read_at,now()) WHERE id=$1 AND user_id=$2', [path[0],session.userId]); return ok({ message:'Notification marked read' }); }
  throw new HttpError(405, 'Method not allowed');
}

async function support(request: NextRequest, method: string) {
  const session = await requireSession(request);
  const admin = await pool.query("SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id WHERE ur.role='admin' AND u.is_active=true ORDER BY u.created_at LIMIT 1");
  if (!admin.rowCount) throw new HttpError(503, 'Support is temporarily unavailable');
  const adminId = admin.rows[0].id;
  if (method === 'GET') {
    const result = await pool.query(`SELECT cm.*,u.display_name sender_name,u.email sender_email FROM chat_messages cm JOIN users u ON u.id=cm.sender_id
      WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at`, [session.userId,adminId]);
    await pool.query('UPDATE chat_messages SET read_at=coalesce(read_at,now()) WHERE receiver_id=$1 AND sender_id=$2', [session.userId,adminId]);
    await pool.query("UPDATE notifications SET read_at=coalesce(read_at,now()) WHERE user_id=$1 AND type='support'", [session.userId]);
    return ok({ adminId, messages:result.rows.map(messageJson), unread:result.rows.filter((row) => row.receiver_id === session.userId && !row.read_at).length });
  }
  if (method === 'POST') {
    const data = await body<{ message?: string; mode?:string }>(request); const message = String(data.message || '').trim();
    if (!message || message.length > 4000) throw new HttpError(400, 'Message must be between 1 and 4000 characters');
    const result = await pool.query('INSERT INTO chat_messages(sender_id,receiver_id,message) VALUES($1,$2,$3) RETURNING *', [session.userId,adminId,message]);
    await pool.query("INSERT INTO notifications(user_id,type,title,body,link) VALUES($1,'support','New support message',$2,'/admin/support')", [adminId,message.slice(0,180)]);
    let botReply:ReturnType<typeof messageJson>|null=null;
    if(data.mode==='bot'){
      const lower=message.toLowerCase();
      const answer=lower.includes('template')||lower.includes('format')?'CareerCanvas Assistant: For most applications, use an ATS template. Choose Europass for EU roles and a Photo template only where profile photos are customary. Tailor keywords to the job description.'
        :lower.includes('download')||lower.includes('pdf')?'CareerCanvas Assistant: Open Your CVs and select Download for a print-ready PDF. You can also use Share to create a public PDF link.'
        :lower.includes('save')||lower.includes('draft')?'CareerCanvas Assistant: Your builder changes are saved locally as a draft automatically. Use Save CV when you want a named version in Your CVs.'
        :lower.includes('job')||lower.includes('ats')?'CareerCanvas Assistant: Open Job Match Report, paste the target job description, and align your summary, skills, and experience with its required keywords.'
        :'CareerCanvas Assistant: I can help with CV sections, wording, templates, ATS matching, saving, sharing, and PDF downloads. Tell me the job you are applying for and what you need help with.';
      const reply=await pool.query('INSERT INTO chat_messages(sender_id,receiver_id,message) VALUES($1,$2,$3) RETURNING *',[adminId,session.userId,answer]);
      botReply=messageJson(reply.rows[0]);
    }
    return ok({...messageJson(result.rows[0]),botReply}, 201);
  }
  throw new HttpError(405, 'Method not allowed');
}

async function handler(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    const method = request.method;
    if (path[0] === 'health') return ok({ status: 'ok', runtime: 'nextjs', timestamp: new Date().toISOString() });
    if (path[0] === 'shared-cvs' && path[1] && method === 'GET') {
      const result=await pool.query('SELECT name,cv_data,template_id,updated_at FROM saved_cvs WHERE share_token=$1 AND deleted_at IS NULL',[path[1]]);
      if(!result.rowCount)throw new HttpError(404,'This shared CV link is invalid or no longer available');
      const row=result.rows[0];return ok({name:row.name,cvData:row.cv_data,templateId:row.template_id,updatedAt:row.updated_at});
    }
    if (path[0] === 'auth' && path[1]) return await auth(request, path[1], method);
    if (path[0] === 'cvs' && path[1] && path[2] === 'share' && method === 'POST') {
      const session=await requireSession(request);const token=crypto.randomUUID().replaceAll('-','');
      const result=await pool.query('UPDATE saved_cvs SET share_token=COALESCE(share_token,$1),shared_at=now() WHERE id=$2 AND user_id=$3 AND deleted_at IS NULL RETURNING share_token',[token,path[1],session.userId]);
      if(!result.rowCount)throw new HttpError(404,'CV not found');
      return ok({token:result.rows[0].share_token,path:`/shared-cv/${result.rows[0].share_token}`});
    }
    if (path[0] === 'cvs' && path[1] && path[2] === 'share' && method === 'DELETE') {
      const session=await requireSession(request);const result=await pool.query('UPDATE saved_cvs SET share_token=NULL,shared_at=NULL WHERE id=$1 AND user_id=$2 RETURNING id',[path[1],session.userId]);
      if(!result.rowCount)throw new HttpError(404,'CV not found');return ok({message:'Shared link revoked'});
    }
    if (path[0] === 'cvs') return await cvs(request, path[1], method);
    if (path[0] === 'notifications') return await notifications(request, path.slice(1), method);
    if (path[0] === 'support') return await support(request, method);
    if (path[0] === 'presence' && method === 'PUT') {
      const session = await requireSession(request);
      await pool.query('UPDATE users SET last_seen_at=now() WHERE id=$1', [session.userId]);
      return ok({ online:true, lastSeenAt:new Date().toISOString() });
    }
    if (path[0] === 'admin') return await admin(request, path.slice(1), method);
    throw new HttpError(404, 'API route not found');
  } catch (error) {
    if (error instanceof HttpError) return ok({ error: error.message }, error.status);
    console.error('Next API error:', error);
    return ok({ error: 'Internal server error' }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;

async function admin(request: NextRequest, path: string[], method: string) {
  const adminSession = await requireAdmin(request);
  if (path[0] === 'search' && method === 'GET') {
    const q=(request.nextUrl.searchParams.get('q')||'').trim();
    if(q.length<2)return ok({results:[]});
    const term=`%${q}%`;
    const [users,cvs,messages]=await Promise.all([
      pool.query(`SELECT id,display_name,email FROM users WHERE display_name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT 6`,[term]),
      pool.query(`SELECT sc.id,sc.name,sc.template_id,u.email FROM saved_cvs sc JOIN users u ON u.id=sc.user_id WHERE sc.deleted_at IS NULL AND (sc.name ILIKE $1 OR sc.template_id ILIKE $1 OR u.email ILIKE $1) ORDER BY sc.updated_at DESC LIMIT 6`,[term]),
      pool.query(`SELECT DISTINCT ON (u.id) u.id,u.display_name,u.email,cm.message FROM chat_messages cm JOIN users u ON u.id=CASE WHEN cm.sender_id=$2 THEN cm.receiver_id ELSE cm.sender_id END WHERE (cm.sender_id=$2 OR cm.receiver_id=$2) AND (cm.message ILIKE $1 OR u.email ILIKE $1 OR u.display_name ILIKE $1) ORDER BY u.id,cm.created_at DESC LIMIT 6`,[term,adminSession.userId]),
    ]);
    return ok({results:[...users.rows.map(r=>({type:'User',title:r.display_name||r.email,subtitle:r.email,link:`/admin/users?search=${encodeURIComponent(r.email)}`})),...cvs.rows.map(r=>({type:'CV',title:r.name,subtitle:`${r.template_id} · ${r.email}`,link:`/admin/cvs?search=${encodeURIComponent(r.name||r.email)}`})),...messages.rows.map(r=>({type:'Support',title:r.display_name||r.email,subtitle:r.message,link:`/admin/support?user=${r.id}`}))]});
  }
  if (path[0] === 'stats' && method === 'GET') {
    const [users, onlineUsers, cvs, roleRows, logins] = await Promise.all([
      pool.query('SELECT count(*)::int count FROM users'),
      pool.query("SELECT count(*)::int count FROM users WHERE last_seen_at >= now() - interval '2 minutes'"),
      pool.query('SELECT count(*)::int count FROM saved_cvs WHERE deleted_at IS NULL'),
      pool.query('SELECT role,count(*)::int count FROM user_roles GROUP BY role'),
      pool.query(`SELECT lh.*,u.display_name FROM login_history lh JOIN users u ON u.id=lh.user_id ORDER BY logged_in_at DESC LIMIT 5`),
    ]);
    return ok({
      totalUsers: users.rows[0].count, onlineUsers: onlineUsers.rows[0].count, totalCVs: cvs.rows[0].count,
      roles: Object.fromEntries(roleRows.rows.map((row) => [row.role, row.count])),
      recentLogins: logins.rows.map(loginJson),
    });
  }
  if (path[0] === 'users') return adminUsers(request, path.slice(1), method);
  if (path[0] === 'roles') return adminRoles(request, path.slice(1), method);
  if (path[0] === 'cvs') return adminCvs(request, path[1], method, false);
  if (path[0] === 'recycle-bin') return adminCvs(request, path[1], method, true, path[2]);
  if (path[0] === 'support') return adminSupport(request, path.slice(1), method);
  if (path[0] === 'login-history' && method === 'GET') {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 20));
    const search = request.nextUrl.searchParams.get('search') || '';
    const filter = search ? 'WHERE lh.email ILIKE $1 OR u.display_name ILIKE $1 OR lh.ip_address ILIKE $1' : '';
    const params = search ? [`%${search}%`] : [];
    const [count, rows] = await Promise.all([
      pool.query(`SELECT count(*)::int count FROM login_history lh JOIN users u ON u.id=lh.user_id ${filter}`, params),
      pool.query(`SELECT lh.*,u.display_name FROM login_history lh JOIN users u ON u.id=lh.user_id ${filter}
        ORDER BY logged_in_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, (page - 1) * limit]),
    ]);
    return ok({ entries: rows.rows.map(loginJson), total: count.rows[0].count, page, limit, totalPages: Math.ceil(count.rows[0].count / limit) });
  }
  throw new HttpError(404, 'Admin route not found');
}

async function adminSupport(request: NextRequest, path: string[], method: string) {
  const actor = await requireAdmin(request); const userId = path[0]; const action = path[1];
  if (!userId && method === 'GET') {
    const result = await pool.query(`SELECT u.id,u.display_name,u.email,max(cm.created_at) last_message_at,
      count(*) FILTER (WHERE cm.receiver_id=$1 AND cm.read_at IS NULL)::int unread,
      (array_agg(cm.message ORDER BY cm.created_at DESC))[1] last_message
      FROM chat_messages cm JOIN users u ON u.id=CASE WHEN cm.sender_id=$1 THEN cm.receiver_id ELSE cm.sender_id END
      WHERE cm.sender_id=$1 OR cm.receiver_id=$1 GROUP BY u.id,u.display_name,u.email ORDER BY last_message_at DESC`, [actor.userId]);
    return ok({ threads:result.rows.map((row) => ({ userId:row.id,displayName:row.display_name,email:row.email,lastMessage:row.last_message,lastMessageAt:row.last_message_at,unread:row.unread })) });
  }
  if (userId && method === 'GET') {
    const result = await pool.query(`SELECT cm.*,u.display_name sender_name,u.email sender_email FROM chat_messages cm JOIN users u ON u.id=cm.sender_id
      WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at`, [actor.userId,userId]);
    await pool.query('UPDATE chat_messages SET read_at=coalesce(read_at,now()) WHERE receiver_id=$1 AND sender_id=$2', [actor.userId,userId]);
    return ok({ messages:result.rows.map(messageJson) });
  }
  if (userId && action === 'suggest' && method === 'POST') {
    const result = await pool.query(
      `SELECT message FROM chat_messages
       WHERE sender_id=$1 AND receiver_id=$2
       ORDER BY created_at DESC LIMIT 1`,
      [userId, actor.userId],
    );
    const question = String(result.rows[0]?.message || '').trim();
    if (!question) throw new HttpError(404, 'No user question found for this conversation');
    const lower = question.toLowerCase();
    const guidance = lower.includes('pdf') || lower.includes('download')
      ? 'Please open your saved CV, choose the correct template, and use the Download PDF action. If it still fails, tell us which template and browser you are using.'
      : lower.includes('restore') || lower.includes('deleted')
        ? 'I can check the recycle bin and restore the CV for you. Please confirm the CV name so I can make sure the correct version is restored.'
        : lower.includes('password') || lower.includes('login')
          ? 'Please try the password-reset option on the sign-in page. If you still cannot access the account, confirm the email address you registered with.'
          : lower.includes('ats') || lower.includes('score')
            ? 'Review the Job Match Report and add relevant skills and phrases from the job description naturally. Avoid keyword stuffing, and keep section headings clear.'
            : lower.includes('template') || lower.includes('format')
              ? 'For most applications, the ATS template is the safest choice. Europass works well for EU applications, while visual templates are best when design is valued.'
              : 'Thank you for explaining the issue. I reviewed your question and will help you resolve it. Could you share the exact step where the problem occurs and any error message you see?';
    return ok({ suggestion: `Hi, thank you for contacting CareerCanvas. ${guidance}`, question });
  }
  if (userId && method === 'POST') {
    const data = await body<{ message?: string }>(request); const message = String(data.message || '').trim();
    if (!message || message.length > 4000) throw new HttpError(400, 'Message must be between 1 and 4000 characters');
    const result = await pool.query('INSERT INTO chat_messages(sender_id,receiver_id,message) VALUES($1,$2,$3) RETURNING *', [actor.userId,userId,message]);
    await pool.query("INSERT INTO notifications(user_id,type,title,body,link) VALUES($1,'support','Support replied',$2,'/dashboard')", [userId,message.slice(0,180)]);
    return ok(messageJson(result.rows[0]), 201);
  }
  throw new HttpError(405, 'Method not allowed');
}

async function adminUsers(request: NextRequest, path: string[], method: string) {
  const actor = await requireAdmin(request);
  const id = path[0];
  if (!id && method === 'GET') {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 20));
    const search = request.nextUrl.searchParams.get('search') || '';
    const sortKey = request.nextUrl.searchParams.get('sort') || 'createdAt';
    const sortColumns:Record<string,string>={name:'u.display_name',email:'u.email',status:'u.last_seen_at',lastLogin:'last_login_at',cvs:'cv_count',createdAt:'u.created_at'};
    const sortColumn=sortColumns[sortKey] || sortColumns.createdAt;
    const sortOrder=request.nextUrl.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';
    const filter = search ? 'WHERE u.email ILIKE $1 OR u.display_name ILIKE $1' : '';
    const params = search ? [`%${search}%`] : [];
    const [count, rows] = await Promise.all([
      pool.query(`SELECT count(*)::int count FROM users u ${filter}`, params),
      pool.query(`SELECT u.id,u.email,u.display_name,u.avatar_url,u.phone,u.profile_data,u.is_active,u.created_at,u.updated_at,u.last_seen_at,
        coalesce(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL),'{}') roles,
        (SELECT count(*)::int FROM saved_cvs WHERE user_id=u.id AND deleted_at IS NULL) cv_count,
        (SELECT count(*)::int FROM login_history WHERE user_id=u.id) login_count,
        (SELECT max(logged_in_at) FROM login_history WHERE user_id=u.id) last_login_at,
        (SELECT row_to_json(last_record) FROM (SELECT logged_in_at AS at,ip_address AS ip,country,country_code,city,user_agent FROM login_history WHERE user_id=u.id ORDER BY logged_in_at DESC LIMIT 1) last_record) last_login
        FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id ${filter}
        GROUP BY u.id ORDER BY ${sortColumn} ${sortOrder} NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit]),
    ]);
    return ok({ users: rows.rows.map((row) => ({ id: row.id, email: row.email, displayName: row.display_name,
      avatarUrl: row.avatar_url, phone: row.phone, profileData:row.profile_data || {}, isActive: row.is_active, createdAt: row.created_at, updatedAt:row.updated_at,
      roles: row.roles, cvCount: row.cv_count, loginCount:row.login_count, lastLogin: row.last_login,
      lastSeenAt:row.last_seen_at, online:Boolean(row.last_seen_at && Date.now()-new Date(row.last_seen_at).getTime()<120000) })), total: count.rows[0].count,
      page, limit, totalPages: Math.ceil(count.rows[0].count / limit) });
  }
  if (!id) throw new HttpError(404, 'User route not found');
  if (path[1] === 'login-history' && method === 'GET') {
    const result = await pool.query('SELECT lh.*,u.display_name FROM login_history lh JOIN users u ON u.id=lh.user_id WHERE lh.user_id=$1 ORDER BY logged_in_at DESC LIMIT 100', [id]);
    return ok({ entries:result.rows.map(loginJson) });
  }
  if (path.length === 1 && method === 'GET') {
    const result = await pool.query(`SELECT u.id,u.email,u.display_name,u.avatar_url,u.phone,u.profile_data,u.is_active,u.created_at,u.updated_at,u.last_seen_at,
      coalesce((SELECT array_agg(role) FROM user_roles WHERE user_id=u.id),'{}') roles,
      (SELECT count(*)::int FROM saved_cvs WHERE user_id=u.id AND deleted_at IS NULL) cv_count,
      (SELECT count(*)::int FROM login_history WHERE user_id=u.id) login_count,
      (SELECT row_to_json(last_record) FROM (SELECT logged_in_at AS at,ip_address AS ip,country,country_code,city,user_agent FROM login_history WHERE user_id=u.id ORDER BY logged_in_at DESC LIMIT 1) last_record) last_login
      FROM users u WHERE u.id=$1`, [id]);
    if (!result.rowCount) throw new HttpError(404, 'User not found');
    const row=result.rows[0];
    const [cvs, messages]=await Promise.all([
      pool.query('SELECT id,name,template_id,created_at,updated_at FROM saved_cvs WHERE user_id=$1 AND deleted_at IS NULL ORDER BY updated_at DESC', [id]),
      pool.query(`SELECT cm.*,su.display_name sender_name,su.email sender_email FROM chat_messages cm JOIN users su ON su.id=cm.sender_id WHERE cm.sender_id=$1 OR cm.receiver_id=$1 ORDER BY cm.created_at`, [id]),
    ]);
    return ok({ id:row.id,email:row.email,displayName:row.display_name,avatarUrl:row.avatar_url,phone:row.phone,profileData:row.profile_data||{},isActive:row.is_active,
      createdAt:row.created_at,updatedAt:row.updated_at,lastSeenAt:row.last_seen_at,online:Boolean(row.last_seen_at&&Date.now()-new Date(row.last_seen_at).getTime()<120000),roles:row.roles,
      cvCount:row.cv_count,loginCount:row.login_count,lastLogin:row.last_login,cvs:cvs.rows.map((cv)=>({id:cv.id,name:cv.name,template:cv.template_id,createdAt:cv.created_at,updatedAt:cv.updated_at})),supportMessages:messages.rows.map(messageJson) });
  }
  if (path[1] === 'toggle-active' && method === 'PUT') {
    if (id === actor.userId) throw new HttpError(400, 'Cannot deactivate your own account');
    const result = await pool.query(`UPDATE users SET is_active=NOT is_active,token_version=token_version+1,updated_at=now()
      WHERE id=$1 RETURNING id,email,display_name,is_active`, [id]);
    if (!result.rowCount) throw new HttpError(404, 'User not found');
    const row = result.rows[0];
    return ok({ id: row.id, email: row.email, displayName: row.display_name, isActive: row.is_active });
  }
  if (path[1] === 'reset-password' && method === 'PUT') {
    const { newPassword } = await body<{ newPassword?: string }>(request);
    if (!newPassword || newPassword.length < 6 || newPassword.length > 128) throw new HttpError(400, 'New password must be between 6 and 128 characters');
    const hash = await bcrypt.hash(newPassword, 12);
    const result = await pool.query(`UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=now()
      WHERE id=$2 RETURNING email`, [hash, id]);
    if (!result.rowCount) throw new HttpError(404, 'User not found');
    return ok({ message: `Password reset for ${result.rows[0].email}` });
  }
  if (path.length === 1 && method === 'DELETE') {
    if (id === actor.userId) throw new HttpError(400, 'Cannot delete your own account');
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) throw new HttpError(404, 'User not found');
    return ok({ message: 'User deleted' });
  }
  throw new HttpError(404, 'User route not found');
}

async function adminRoles(request: NextRequest, path: string[], method: string) {
  if (!path[0] && method === 'GET') {
    const result = await pool.query(`SELECT ur.id,ur.user_id,ur.role,ur.created_at,u.email,u.display_name
      FROM user_roles ur JOIN users u ON u.id=ur.user_id ORDER BY ur.created_at DESC`);
    return ok(result.rows.map((row) => ({ id: row.id, userId: row.user_id, role: row.role,
      createdAt: row.created_at, email: row.email, displayName: row.display_name })));
  }
  if (!path[0] && method === 'POST') {
    const { userId, role } = await body<{ userId?: string; role?: string }>(request);
    if (!userId || !role) throw new HttpError(400, 'userId and role are required');
    if (!['admin', 'moderator', 'user'].includes(role)) throw new HttpError(400, 'Invalid role');
    const result = await pool.query(`INSERT INTO user_roles(user_id,role) VALUES($1,$2)
      ON CONFLICT(user_id,role) DO NOTHING RETURNING id,user_id,role,created_at`, [userId, role]);
    return ok(result.rows[0] || { message: 'Role already exists' }, 201);
  }
  if (path[0] && method === 'DELETE') {
    const result = await pool.query('DELETE FROM user_roles WHERE id=$1 RETURNING id', [path[0]]);
    if (!result.rowCount) throw new HttpError(404, 'Role not found');
    return ok({ message: 'Role removed' });
  }
  throw new HttpError(404, 'Role route not found');
}

async function adminCvs(request: NextRequest, id: string | undefined, method: string, recycled: boolean, action?: string) {
  if (!id && method === 'GET') {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 20));
    const search = request.nextUrl.searchParams.get('search') || '';
    const params = search ? [`%${search}%`] : [];
    const filter = `WHERE cv.deleted_at IS ${recycled ? 'NOT ' : ''}NULL${search ? ' AND (cv.name ILIKE $1 OR u.email ILIKE $1 OR u.display_name ILIKE $1)' : ''}`;
    const [count, rows] = await Promise.all([
      pool.query(`SELECT count(*)::int count FROM saved_cvs cv JOIN users u ON u.id=cv.user_id ${filter}`, params),
      pool.query(`SELECT cv.*,u.email user_email,u.display_name user_display_name,d.email deleted_by_email,d.display_name deleted_by_name
        FROM saved_cvs cv JOIN users u ON u.id=cv.user_id LEFT JOIN users d ON d.id=cv.deleted_by ${filter}
        ORDER BY ${recycled ? 'cv.deleted_at' : 'cv.updated_at'} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit]),
    ]);
    return ok({ cvs: rows.rows.map(cvAdminJson), total: count.rows[0].count, page, limit,
      totalPages: Math.ceil(count.rows[0].count / limit) });
  }
  if (!id) throw new HttpError(404, 'CV route not found');
  if (recycled && action === 'restore' && method === 'PUT') {
    const result = await pool.query(`UPDATE saved_cvs SET deleted_at=NULL,deleted_by=NULL,updated_at=now()
      WHERE id=$1 AND deleted_at IS NOT NULL RETURNING id,name,user_id`, [id]);
    if (!result.rowCount) throw new HttpError(404, 'CV not found in recycle bin');
    await pool.query(
      "INSERT INTO notifications(user_id,type,title,body,link) VALUES($1,'cv_restored','CV restored',$2,'/dashboard')",
      [result.rows[0].user_id, `Your CV "${result.rows[0].name}" was restored by a superadmin.`],
    );
    return ok({ message: `CV "${result.rows[0].name}" restored`, id: result.rows[0].id });
  }
  if (method === 'DELETE' && (!recycled || action === 'permanent')) {
    const result = await pool.query(`DELETE FROM saved_cvs WHERE id=$1${recycled ? ' AND deleted_at IS NOT NULL' : ''} RETURNING id`, [id]);
    if (!result.rowCount) throw new HttpError(404, recycled ? 'CV not found in recycle bin' : 'CV not found');
    return ok({ message: 'CV permanently deleted' });
  }
  throw new HttpError(404, 'CV route not found');
}

function cvAdminJson(row: Record<string, unknown>) {
  const personal = ((row.cv_data as Record<string, unknown>)?.personal || {}) as Record<string, string>;
  return { id: row.id, name: row.name, cvData: row.cv_data, templateId: row.template_id,
    createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at,
    deletedBy: row.deleted_by_name || row.deleted_by_email || undefined, userEmail: row.user_email,
    userDisplayName: row.user_display_name, fullName: personal.fullName || '', phone: personal.phone || '',
    email: personal.email || '' };
}

function loginJson(row: Record<string, unknown>) {
  return {
    id: row.id, userId: row.user_id, email: row.email, displayName: row.display_name,
    ipAddress: row.ip_address, country: row.country, countryCode: row.country_code,
    city: row.city, userAgent: row.user_agent, loggedInAt: row.logged_in_at,
  };
}
