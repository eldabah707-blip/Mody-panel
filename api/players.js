const {db,json,clean}=require("./_common");
module.exports=async(req,res)=>{
 try{const r=await db()`SELECT id,username,player_id,email,avatar,black_list,created_at FROM accounts ORDER BY created_at DESC`;return json(res,200,{accounts:r.map(clean)});}
 catch(e){return json(res,500,{error:"تعذر تحميل اللاعبين."});}
};
