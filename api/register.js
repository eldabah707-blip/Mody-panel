const crypto=require("crypto");
const {db,json,body,hashPassword,sign,validEmail,validUsername,validPlayerId,makeId}=require("./_common");
module.exports=async(req,res)=>{
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
 try{
  const b=await body(req),username=String(b.username||"").trim(),playerId=String(b.playerId||"").trim(),email=String(b.email||"").trim().toLowerCase(),password=String(b.password||""),avatar=String(b.avatar||"");
  if(!validUsername(username)||!validPlayerId(playerId)||!validEmail(email)||password.length<6||password.length>200)return json(res,400,{error:"بيانات التسجيل غير صالحة."});
  if(avatar.length>2200000)return json(res,400,{error:"الصورة كبيرة جدًا."});
  const sql=db(), exists=await sql`SELECT id FROM accounts WHERE lower(email)=${email} OR player_id=${playerId} LIMIT 1`;
  if(exists.length)return json(res,409,{error:"البريد الإلكتروني أو Free Fire ID مستخدم بالفعل."});
  const salt=crypto.randomBytes(16).toString("hex"),id=makeId(),blackList=playerId==="2149137612";
  await sql`INSERT INTO accounts(id,username,player_id,email,avatar,password_hash,password_salt,black_list) VALUES(${id},${username},${playerId},${email},${avatar},${hashPassword(password,salt)},${salt},${blackList})`;
  const account={id,username,playerId,email,avatar,blackList,createdAt:new Date().toISOString()};
  return json(res,201,{token:sign({accountId:id,exp:Date.now()+2592000000}),account});
 }catch(e){console.error(e);return json(res,500,{error:"تعذر إنشاء الحساب."});}
};
