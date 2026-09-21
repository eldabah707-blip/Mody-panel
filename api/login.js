const {db,json,body,hashPassword,sign,clean}=require("./_common");
module.exports=async(req,res)=>{
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
 try{
  const b=await body(req),email=String(b.email||"").trim().toLowerCase(),password=String(b.password||""),sql=db(),r=await sql`SELECT * FROM accounts WHERE lower(email)=${email} LIMIT 1`,a=r[0];
  if(!a||hashPassword(password,a.password_salt)!==a.password_hash)return json(res,401,{error:"البريد الإلكتروني أو كلمة المرور غير صحيحة."});
  return json(res,200,{token:sign({accountId:a.id,exp:Date.now()+2592000000}),account:clean(a)});
 }catch(e){return json(res,500,{error:"تعذر تسجيل الدخول."});}
};
