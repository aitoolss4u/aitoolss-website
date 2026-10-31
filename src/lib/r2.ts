import "server-only";
import {DeleteObjectCommand,GetObjectCommand,HeadObjectCommand,PutObjectCommand,S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
export type R2ObjectInfo={key:string;size:number;contentType:string;etag:string|null};
export function isR2Configured(){return Boolean(process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY&&process.env.R2_BUCKET_NAME&&(process.env.R2_S3_ENDPOINT||process.env.R2_ACCOUNT_ID)&&process.env.R2_PUBLIC_BASE_URL);}
function required(name:string){const value=process.env[name]?.trim();if(!value)throw new Error("Missing server environment variable: "+name);return value;}
export function getR2Bucket(){return required("R2_BUCKET_NAME");}
export function getR2PublicUrl(key:string){const base=required("R2_PUBLIC_BASE_URL").replace(/\/+$/u,"");if(!/^https:\/\//iu.test(base))throw new Error("R2_PUBLIC_BASE_URL must use HTTPS.");return base+"/"+key.split("/").map(encodeURIComponent).join("/");}
let client:S3Client|null=null;
export function getR2Client(){if(client)return client;const id=process.env.R2_ACCOUNT_ID?.trim();const endpoint=process.env.R2_S3_ENDPOINT?.trim()||(id?"https://"+id+".r2.cloudflarestorage.com":"");if(!endpoint||!/^https:\/\//iu.test(endpoint))throw new Error("R2_S3_ENDPOINT must be a valid HTTPS URL.");client=new S3Client({region:"auto",endpoint,credentials:{accessKeyId:required("R2_ACCESS_KEY_ID"),secretAccessKey:required("R2_SECRET_ACCESS_KEY")}});return client;}
export async function createR2UploadUrl(key:string,contentType:string,sizeBytes:number){const command=new PutObjectCommand({Bucket:getR2Bucket(),Key:key,ContentType:contentType,ContentLength:sizeBytes,CacheControl:"public, max-age=31536000, immutable"});return {url:await getSignedUrl(getR2Client(),command,{expiresIn:300}),publicUrl:getR2PublicUrl(key),expiresIn:300};}
export async function headR2Object(key:string):Promise<R2ObjectInfo>{const result=await getR2Client().send(new HeadObjectCommand({Bucket:getR2Bucket(),Key:key}));return {key,size:Number(result.ContentLength??0),contentType:result.ContentType??"application/octet-stream",etag:result.ETag??null};}
export async function deleteR2Objects(keys:string[]){const unique=[...new Set(keys.filter(Boolean))];if(!unique.length||!isR2Configured())return;await Promise.all(unique.map(Key=>getR2Client().send(new DeleteObjectCommand({Bucket:getR2Bucket(),Key}))));}
export function isAllowedR2Key(key:string,purpose:"gallery"|"category"){if(key.length>512||key.startsWith("/")||key.includes("..")||key.includes("\\"))return false;if(purpose==="category")return /^categories\/[0-9a-f-]{36}\/(?:original|optimized)\/[a-f0-9-]+\.(?:jpe?g|png|webp)$/iu.test(key);return /^gallery\/(?:images\/(?:original|optimized|thumbnails)|videos\/(?:original|posters))\/[a-f0-9-]+\.(?:jpe?g|png|webp|gif|mp4|webm)$/iu.test(key);}

function hasSignature(type:string,b:Uint8Array){
 const ascii=(start:number,end:number)=>String.fromCharCode(...b.slice(start,end));
 if(type==="image/jpeg")return b.length>=3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
 if(type==="image/png")return b.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
 if(type==="image/webp")return b.length>=12&&ascii(0,4)==="RIFF"&&ascii(8,12)==="WEBP";
 if(type==="image/gif")return b.length>=6&&(ascii(0,6)==="GIF87a"||ascii(0,6)==="GIF89a");
 if(type==="video/mp4")return b.length>=12&&ascii(4,8)==="ftyp";
 if(type==="video/webm")return b.length>=4&&b[0]===0x1a&&b[1]===0x45&&b[2]===0xdf&&b[3]===0xa3;
 return false;
}
export async function verifyR2ObjectContent(key:string):Promise<R2ObjectInfo>{
 const info=await headR2Object(key);
 if(info.size<=0)throw new Error("Uploaded object is empty.");
 const result=await getR2Client().send(new GetObjectCommand({Bucket:getR2Bucket(),Key:key,Range:"bytes=0-31"}));
 if(!result.Body)throw new Error("Could not read uploaded object header.");
 const bytes=await result.Body.transformToByteArray();
 if(!hasSignature(info.contentType,bytes))throw new Error("Uploaded file content does not match its declared MIME type.");
 return info;
}
