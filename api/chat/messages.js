const crypto=require("crypto");
const {db,json,body,currentAccount}=require("../_common");
module.exports=async(req,res)=>{
 try{
  const sql=db(),a=await currentAccount(sql,req);if(!a)return json(res,401,{error:"سجل الدخول أولًا."});
  if(req.method==="GET"){
   const r=await sql`SELECT id,account_id,username,text,created_at FROM chat_messages ORDER BY created_at DESC LIMIT 200`;
   return json(res,200,{messages:r.reverse().map(x=>({id:x.id,accountId:x.account_id,username:x.username,text:x.text,createdAt:x.created_at}))});
  }
  if(req.method==="POST"){
   const b=await body(req),text=String(b.text||"").trim();if(!text)return json(res,400,{error:"الرسالة فارغة."});if(text.length>300)return json(res,400,{error:"الرسالة طويلة جدًا."});
   const id=crypto.randomUUID();await sql`INSERT INTO chat_messages(id,account_id,username,text) VALUES(${id},${a.id},${a.username},${text})`;
   return json(res,201,{message:{id,accountId:a.id,username:a.username,text,createdAt:new Date().toISOString()}});
  }
  return json(res,405,{error:"Method not allowed"});
 }catch(e){console.error(e);return json(res,500,{error:"تعذر التعامل مع الشات."});}
};
