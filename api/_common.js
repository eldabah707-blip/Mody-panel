const crypto=require("crypto");
const {neon}=require("@neondatabase/serverless");
function db(){if(!process.env.DATABASE_URL)throw Error("DATABASE_URL is not configured");return neon(process.env.DATABASE_URL);}
function json(res,status,obj){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(obj));}
async function body(req){if(req.body&&typeof req.body==="object")return req.body;let s="";for await(const c of req)s+=c;return s?JSON.parse(s):{};}
function hashPassword(p,s){return crypto.scryptSync(String(p),s,64).toString("hex");}
function sign(data){const secret=process.env.AUTH_SECRET;if(!secret)throw Error("AUTH_SECRET is not configured");const p=Buffer.from(JSON.stringify(data)).toString("base64url");const sig=crypto.createHmac("sha256",secret).update(p).digest("base64url");return p+"."+sig;}
function verifyToken(t){try{const [p,s]=String(t||"").split(".");if(!p||!s)return null;const secret=process.env.AUTH_SECRET;const e=crypto.createHmac("sha256",secret).update(p).digest("base64url");if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(e)))return null;const d=JSON.parse(Buffer.from(p,"base64url").toString());return d.exp>Date.now()?d:null;}catch(e){return null;}}
function auth(req){const h=req.headers.authorization||"";return verifyToken(h.startsWith("Bearer ")?h.slice(7):"");}
function clean(a){return {id:a.id,username:a.username,playerId:a.player_id,email:a.email,avatar:a.avatar||"",blackList:!!a.black_list,createdAt:a.created_at};}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||""));}
function validUsername(v){return /^[\p{L}\p{N}_ .-]{2,30}$/u.test(String(v||"").trim());}
function validPlayerId(v){return /^\d{4,20}$/.test(String(v||""));}
function makeId(){return "MODY-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(4).toString("hex").toUpperCase();}
async function currentAccount(sql,req){const t=auth(req);if(!t)return null;const r=await sql`SELECT * FROM accounts WHERE id=${t.accountId} LIMIT 1`;return r[0]||null;}
module.exports={db,json,body,hashPassword,sign,clean,validEmail,validUsername,validPlayerId,makeId,currentAccount};
