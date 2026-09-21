const {db,json,currentAccount,clean}=require("./_common");
module.exports=async(req,res)=>{
 try{const a=await currentAccount(db(),req);if(!a)return json(res,401,{error:"غير مسجل الدخول."});return json(res,200,{account:clean(a)});}
 catch(e){return json(res,500,{error:"تعذر تحميل الحساب."});}
};
