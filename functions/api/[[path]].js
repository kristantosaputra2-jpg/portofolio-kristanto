import {handle} from '../../backend/service.mjs';
export async function onRequest({request,env}) {
 if (!env.MRK_DB) return Response.json({error:'Penyimpanan belum dihubungkan. Hubungkan MRK_DB terlebih dahulu.'},{status:503});
 const db={
  async all(sql,args=[]) { return (await env.MRK_DB.prepare(sql).bind(...args).all()).results; },
  async first(sql,args=[]) { return env.MRK_DB.prepare(sql).bind(...args).first(); },
  async run(sql,args=[]) { return env.MRK_DB.prepare(sql).bind(...args).run(); },
  async batch(queries) { return env.MRK_DB.batch(queries.map(([sql,args])=>env.MRK_DB.prepare(sql).bind(...args))); }
 };
 return handle(request,db,{email:env.ADMIN_EMAIL,salt:env.ADMIN_SALT,hash:env.ADMIN_HASH,rounds:6,origin:env.SITE_ORIGIN},request.headers.get('CF-Connecting-IP') || 'unknown');
}
