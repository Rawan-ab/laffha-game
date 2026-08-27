import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const URL='https://ntklwkzrozyfgzwwkvfr.supabase.co';
const KEY='sb_publishable_FBTPjHlnOBumsqw340LF3Q_KGhmYCDp';
const client=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:auth,error:authError}=await client.auth.signInAnonymously();
if(authError||!auth?.user)throw authError||new Error('Anonymous auth failed');

const bank=JSON.parse(fs.readFileSync('migration/question-bank-export.json','utf8')).questions;
const mcq=bank.find(q=>q.questionType==='mcq'&&q.correctAnswer&&Array.isArray(q.wrongAnswers)&&q.wrongAnswers.length);
if(!mcq)throw new Error('No MCQ test question');

async function verify(questionId,answer){
  const {data,error}=await client.functions.invoke('laffha-answer',{body:{questionId,answer,teamNo:1,roomId:null,revision:null,mode:'answer'}});
  if(error)throw error;if(data?.error)throw new Error(data.error);return data;
}
const yes=await verify(mcq.questionID,mcq.correctAnswer);
if(yes.correct!==true)throw new Error('Server rejected correct MCQ answer');
const no=await verify(mcq.questionID,'__LAFFHA_DEFINITELY_WRONG__');
if(no.correct!==false)throw new Error('Server accepted wrong MCQ answer');

const apple=bank.find(q=>q.questionID==='vis54-le01');
if(apple){const ar=await verify(apple.questionID,'ابل');if(ar.correct!==true)throw new Error('Arabic visual alias failed');}

console.log('SECURE_SERVER_INTEGRATION_OK',{question:mcq.questionID,visualAlias:!!apple});
