(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var TODAY='2026-11-10',MIN=75,DEPT='Electronics & Communication Engineering';
var D=function(iso){return new Date(iso+'T00:00:00Z')};
var fmt=function(iso,o){return iso?D(iso).toLocaleDateString('en-IN',Object.assign({timeZone:'UTC'},o||{day:'numeric',month:'short',year:'numeric'})):'—'};
var dayDiff=function(a,b){return Math.round((D(b)-D(a))/864e5)};
var sum=function(a){return a.reduce(function(x,y){return x+y},0)};
var byId=function(arr,k,id){return arr.filter(function(x){return x[k]===id})[0]};

/* ---------- data (shaped like the ER diagram) ---------- */
var subjects=[
 {subject_id:'SUB101',subject_name:'Signals & Systems',subject_code:'ECE201'},
 {subject_id:'SUB102',subject_name:'Digital Electronics',subject_code:'ECE202'},
 {subject_id:'SUB103',subject_name:'Network Theory',subject_code:'ECE203'},
 {subject_id:'SUB104',subject_name:'Analog Circuits',subject_code:'ECE204'},
 {subject_id:'SUB105',subject_name:'Engineering Mathematics',subject_code:'MAT201'}];
var sections=[
 {section_id:'SEC1',section_name:'1st Year ECE-C',department:DEPT,course:'B.Tech',prefix:'26ECE1',birthYear:2008},
 {section_id:'SEC2',section_name:'2nd Year ECE-B',department:DEPT,course:'B.Tech',prefix:'25ECE2',birthYear:2007},
 {section_id:'SEC3',section_name:'3rd Year ECE-A',department:DEPT,course:'B.Tech',prefix:'24ECE3',birthYear:2006}];
var faculty=[
 {faculty_id:'F101',subject_id:'SUB102',name:'Dr. Anjali Rao',age:41,gender:'Female',email:'anjali.rao@campus.edu',phone:'9848000101',qualification:'Ph.D. (VLSI Design)',designation:'Associate Professor',department:DEPT,experience:14},
 {faculty_id:'F102',subject_id:'SUB101',name:'Prof. Suresh Varma',age:52,gender:'Male',email:'suresh.varma@campus.edu',phone:'9848000102',qualification:'Ph.D. (Signal Processing)',designation:'Professor',department:DEPT,experience:26},
 {faculty_id:'F103',subject_id:'SUB103',name:'Dr. Kavitha Reddy',age:36,gender:'Female',email:'kavitha.reddy@campus.edu',phone:'9848000103',qualification:'Ph.D. (Circuit Theory)',designation:'Assistant Professor',department:DEPT,experience:9},
 {faculty_id:'F104',subject_id:'SUB104',name:'Mr. Imran Sheikh',age:33,gender:'Male',email:'imran.sheikh@campus.edu',phone:'9848000104',qualification:'M.Tech (Microelectronics)',designation:'Assistant Professor',department:DEPT,experience:7},
 {faculty_id:'F105',subject_id:'SUB105',name:'Dr. Lakshmi Prasad',age:45,gender:'Female',email:'lakshmi.prasad@campus.edu',phone:'9848000105',qualification:'Ph.D. (Applied Mathematics)',designation:'Associate Professor',department:DEPT,experience:18}];
var CITY={Hyderabad:'500081',Warangal:'506002',Karimnagar:'505001',Vijayawada:'520010',Guntur:'522002',Nizamabad:'503001'};
var COLONY=['Madhapur','Gandhi Nagar','Ashok Nagar','Srinivasa Colony','Vidya Nagar','Balaji Nagar','Green Park','Shanti Nagar'];
var RAW=[
 ['SEC1','Aarav Sharma','M','Rajesh Sharma','Sunita Sharma','Hyderabad',.95],['SEC1','Diya Patel','F','Mahesh Patel','Kiran Patel','Warangal',.88],
 ['SEC1','Rohan Naidu','M','Venkat Naidu','Padma Naidu','Vijayawada',.82],['SEC1','Sneha Iyer','F','Subramanian Iyer','Lakshmi Iyer','Hyderabad',.70],
 ['SEC1','Karthik Goud','M','Narsimha Goud','Saritha Goud','Karimnagar',.93],['SEC1','Meera Joshi','F','Anil Joshi','Neelam Joshi','Hyderabad',.66],
 ['SEC1','Vikram Singh','M','Harpal Singh','Jaswinder Kaur','Nizamabad',.86],['SEC1','Pooja Das','F','Biswas Das','Rina Das','Guntur',.78],
 ['SEC2','Arjun Reddy','M','Sudhakar Reddy','Vimala Reddy','Hyderabad',.91],['SEC2','Ishita Gupta','F','Manoj Gupta','Rekha Gupta','Hyderabad',.85],
 ['SEC2','Harsha Vardhan','M','Ramana Rao','Jyothi Rao','Guntur',.74],['SEC2','Nikhil Kumar','M','Prasad Kumar','Latha Kumar','Warangal',.96],
 ['SEC2','Priya Menon','F','Gopal Menon','Radha Menon','Vijayawada',.80],['SEC2','Sai Teja','M','Srinivas Rao','Anitha Rao','Karimnagar',.68],
 ['SEC2','Fatima Khan','F','Abdul Khan','Shabana Khan','Hyderabad',.89],['SEC2','Tarun Yadav','M','Dinesh Yadav','Kamala Yadav','Nizamabad',.77],
 ['SEC3','Rahul Verma','M','Sanjay Verma','Anita Verma','Warangal',.90],['SEC3','Ananya Rao','F','Krishna Rao','Madhavi Rao','Hyderabad',.72],
 ['SEC3','Sravani Chowdary','F','Nageswara Chowdary','Durga Chowdary','Vijayawada',.94],['SEC3','Mohit Agarwal','M','Vinod Agarwal','Seema Agarwal','Hyderabad',.83],
 ['SEC3','Lavanya Pillai','F','Mohan Pillai','Geetha Pillai','Guntur',.87],['SEC3','Kiran Kumar','M','Raju Kumar','Bhavani Kumar','Karimnagar',.79],
 ['SEC3','Divya Thakur','F','Ashok Thakur','Meena Thakur','Hyderabad',.92],['SEC3','Yash Mehta','M','Paresh Mehta','Hetal Mehta','Nizamabad',.65]];
var DEMO={student:'24ECE3002',faculty:'F101'};
var students=[];
(function(){var cnt={};RAW.forEach(function(r,i){
  var sec=byId(sections,'section_id',r[0]);cnt[r[0]]=(cnt[r[0]]||0)+1;
  var mo=String(1+(i*5)%12).padStart(2,'0'),dy=String(3+(i*7)%25).padStart(2,'0');
  students.push({student_id:sec.prefix+String(cnt[r[0]]).padStart(3,'0'),section_id:r[0],name:r[1],gender:r[2]==='M'?'Male':'Female',
   date_of_birth:sec.birthYear+'-'+mo+'-'+dy,phone:'98480'+String(10200+i*137),email:r[1].toLowerCase().replace(/ /g,'.')+'@student.campus.edu',
   father_name:r[3],mother_name:r[4],address:'H.No '+(10+i*3)+'-'+(2+i)+'/'+(1+i%4)+', '+COLONY[i%8],city:r[5],pincode:CITY[r[5]],
   department:DEPT,course:'B.Tech',tend:r[6]});});})();
var events=[
 {calendar_id:'CAL01',event_id:'TERM-5',title:'Semester 5',event_type:'Semester',start_date:'2026-08-17',end_date:'2026-12-12',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL02',event_id:'HOL-01',title:'Dussehra holiday',event_type:'Holiday',start_date:'2026-10-20',end_date:'2026-10-20',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL03',event_id:'HOL-02',title:'Diwali holiday',event_type:'Holiday',start_date:'2026-11-08',end_date:'2026-11-08',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL04',event_id:'CT-102',title:'Class test: Digital Electronics',event_type:'Class Test',start_date:'2026-11-12',end_date:'2026-11-12',academic_year:'2026-27',subject_id:'SUB102'},
 {calendar_id:'CAL05',event_id:'EVT-01',title:'Parent-teacher meeting',event_type:'Event',start_date:'2026-11-14',end_date:'2026-11-14',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL06',event_id:'AS-101',title:'Assignment due: Signals & Systems',event_type:'Assignment',start_date:'2026-11-16',end_date:'2026-11-16',academic_year:'2026-27',subject_id:'SUB101'},
 {calendar_id:'CAL07',event_id:'AS-104',title:'Lab record submission',event_type:'Assignment',start_date:'2026-11-18',end_date:'2026-11-18',academic_year:'2026-27',subject_id:'SUB104'},
 {calendar_id:'CAL08',event_id:'CT-103',title:'Class test: Network Theory',event_type:'Class Test',start_date:'2026-11-19',end_date:'2026-11-19',academic_year:'2026-27',subject_id:'SUB103'},
 {calendar_id:'CAL09',event_id:'EX-01',title:'Mid-semester exams',event_type:'Exam',start_date:'2026-11-23',end_date:'2026-11-28',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL10',event_id:'EVT-02',title:'Annual sports meet',event_type:'Event',start_date:'2026-12-03',end_date:'2026-12-04',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL11',event_id:'EVT-03',title:'Technical symposium',event_type:'Event',start_date:'2026-12-10',end_date:'2026-12-10',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL12',event_id:'EX-02',title:'End-semester exams',event_type:'Exam',start_date:'2026-12-21',end_date:'2027-01-05',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL13',event_id:'HOL-03',title:'Christmas',event_type:'Holiday',start_date:'2026-12-25',end_date:'2026-12-25',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL14',event_id:'HOL-04',title:'Sankranti break',event_type:'Holiday',start_date:'2027-01-13',end_date:'2027-01-17',academic_year:'2026-27',subject_id:''},
 {calendar_id:'CAL15',event_id:'HOL-05',title:'Republic Day',event_type:'Holiday',start_date:'2027-01-26',end_date:'2027-01-26',academic_year:'2026-27',subject_id:''}];
var TYPE={'Holiday':'--ok','Exam':'--bad','Class Test':'--warn','Assignment':'--accent','Event':'--event'};

function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var PERIODS=['09:00 – 10:00','10:00 – 11:00','11:00 – 12:00','01:00 – 02:00','02:00 – 03:00'];
function periodOf(secId,subId,iso){var si=sections.map(function(s){return s.section_id}).indexOf(secId),k=subjects.map(function(s){return s.subject_id}).indexOf(subId);return (k+D(iso).getUTCDay()+si)%5}
var rand=rng(2610),days=[],records=[],attSeq=0;
(function(){for(var t=Date.UTC(2026,8,14),end=Date.UTC(2026,10,9);t<=end;t+=864e5){var dt=new Date(t),w=dt.getUTCDay(),iso=dt.toISOString().slice(0,10);if(w&&w<6&&iso!=='2026-10-20')days.push(iso)}})();
var MOD=[0,.04,-.05,.02,-.03];
sections.forEach(function(sec,si){subjects.forEach(function(sub,k){
  var fac=faculty.filter(function(f){return f.subject_id===sub.subject_id})[0];
  var list=students.filter(function(s){return s.section_id===sec.section_id});
  days.forEach(function(day,i){if((i+k+si)%3===0)return;
    list.forEach(function(s){var p=Math.min(.99,Math.max(.4,s.tend+MOD[k]));
      records.push({attendance_id:'ATT'+String(++attSeq).padStart(5,'0'),student_id:s.student_id,faculty_id:fac.faculty_id,section_id:sec.section_id,subject_id:sub.subject_id,calendar_id:'CAL01',attendance_date:day,period:periodOf(sec.section_id,sub.subject_id,day),attendance_status:rand()<p?'Present':'Absent'})})})})});

/* ---------- helpers ---------- */
var state={chartMonth:'all',authInfo:'',pwm:null,stack:[],user:null,tab:'profile',authMode:'login',loginRole:'student',prefill:{id:DEMO.student,pw:'demo123'},authError:'',
  edit:false,formErr:'',pwMsg:null,cal:{y:2026,m:10},calHide:{},att:{subject:'all',month:'all'},
  cls:{sec:null,view:'mark',date:TODAY,marks:{},existing:false,alerts:null},ent:'Attendance',arch:'backend'};
var pws={};
function getPw(id){return pws[id]!=null?pws[id]:'demo123'}
function ageOn(dob){if(!dob)return null;var a=D(TODAY).getUTCFullYear()-D(dob).getUTCFullYear();var m=D(TODAY).getUTCMonth()-D(dob).getUTCMonth();if(m<0||(m===0&&D(TODAY).getUTCDate()<D(dob).getUTCDate()))a--;return a}
function level(p){return p==null?['none','No classes']:p>=80?['ok','Good']:p>=MIN?['warn','Borderline']:['bad','Shortage']}
function pctTxt(p){return p==null?'–':p.toFixed(1)+'%'}
function statsFor(id){var m={};subjects.forEach(function(s){m[s.subject_id]={sub:s,held:0,att:0}});
  records.forEach(function(r){if(r.student_id!==id)return;var x=m[r.subject_id];x.held++;if(r.attendance_status==='Present')x.att++});
  return subjects.map(function(s){var x=m[s.subject_id];x.pct=x.held?x.att/x.held*100:null;return x})}
function subStat(id,sub){var h=0,a=0;records.forEach(function(r){if(r.student_id===id&&r.subject_id===sub){h++;if(r.attendance_status==='Present')a++}});return{held:h,att:a,pct:h?a/h*100:null}}
function secOf(id){return byId(students,'student_id',id).section_id}
function initials(n){return n.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.\s*/,'').split(' ').map(function(w){return w[0]}).slice(0,2).join('').toUpperCase()}
function upcoming(){return events.filter(function(e){return e.event_type!=='Semester'&&e.end_date>=TODAY}).sort(function(a,b){return a.start_date<b.start_date?-1:1})}
var toastT;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},3200)}
function field(name,label,o){o=o||{};return '<div class="fld"><label for="f-'+name+'">'+label+'</label><input id="f-'+name+'" name="'+name+'" type="'+(o.type||'text')+'" value="'+esc(o.value||'')+'"'+(o.req?' required':'')+(o.dis?' disabled':'')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(o.ac?' autocomplete="'+o.ac+'"':'')+(o.max?' max="'+o.max+'"':'')+'></div>'}
function select(name,label,opts,val,attrs){return '<div class="fld"><label for="f-'+name+'">'+label+'</label><select id="f-'+name+'" name="'+name+'" '+(attrs||'')+'>'+opts.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(v===val?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select></div>'}
function kvs(pairs){return '<dl class="kv">'+pairs.map(function(p){return '<dt>'+p[0]+'</dt><dd>'+(p[1]===''||p[1]==null?'—':esc(p[1]))+'</dd>'}).join('')+'</dl>'}
function tabsHtml(list){return '<div class="tabs"><div class="seg" role="tablist">'+list.map(function(t){return '<button type="button" role="tab" aria-selected="'+(state.tab===t[0])+'" data-act="tab" data-v="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div></div>'}

/* ---------- auth ---------- */
function authView(){
  var pf=state.prefill||{},cells='',mode=state.authMode||'login',isS=state.loginRole==='student';
  for(var i=0;i<140;i++){var ab=(i*7+(i>>3)*3)%11===0,op=(.16+((i*37)%10)/20).toFixed(2);cells+='<i class="'+(ab?'a':'p')+'" style="opacity:'+op+'"></i>'}
  var ic=function(d){return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>'};
  var err=state.authError?'<div class="msg bad" role="alert">'+esc(state.authError)+'</div>':'',info=state.authInfo?'<div class="msg ok" role="status">'+esc(state.authInfo)+'</div>':'';
  var userIc=ic('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),lockIc=ic('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
  var inner,BK='<button type="button" class="btn ghost sm back" data-act="mode" data-v="login">\u2039 Back</button>';
  if(mode==='register'){
    inner='<form class="login-card wide" id="regForm" novalidate>'+BK+'<span class="logo">SAMS</span><h2>Create account</h2><div class="seg" role="tablist" aria-label="Register as"><button type="button" role="tab" aria-selected="'+isS+'" data-act="role" data-v="student">I am a student</button><button type="button" role="tab" aria-selected="'+!isS+'" data-act="role" data-v="faculty">I am faculty</button></div><div class="form-grid">'+
     field('name','Full name',{req:1,ac:'name'})+field('email','Email',{type:'email',req:1,ac:'email'})+field('phone','Phone (10 digits)',{req:1,ac:'tel'})+select('gender','Gender',['Female','Male','Other'],'Female')+
     (isS?select('section','Class',sections.map(function(s){return [s.section_id,s.section_name]}),'SEC1'):select('subject','Subject taught',subjects.map(function(s){return [s.subject_id,s.subject_name]}),'SUB101')+select('designation','Designation',['Assistant Professor','Associate Professor','Professor'],'Assistant Professor')+field('qualification','Qualification',{ph:'e.g. M.Tech (VLSI)'}))+
     field('password','Password (8+ characters)',{type:'password',req:1,ac:'new-password'})+'</div>'+err+'<button class="btn big" type="submit">Create account</button><p class="alt">Already have an account? <button type="button" class="link" data-act="mode" data-v="login">Sign in</button></p></form>'}
  else if(mode==='forgot'){
    inner='<form class="login-card" id="forgotForm" novalidate>'+BK+'<span class="logo">SAMS</span><h2>Forgot password</h2><p class="muted" style="font-size:.92rem">Enter your ID or email. We will send a reset link to the email on your account.</p><div class="lf"><label for="f-ident">ID or email</label><div class="inp">'+userIc+'<input id="f-ident" name="ident" type="text" required autocomplete="username"></div></div>'+err+info+'<button class="btn big" type="submit">Send reset link</button><p class="alt"><button type="button" class="link" data-act="mode" data-v="login">‹ Back to sign in</button></p></form>'}
  else{
    inner='<form class="login-card" id="loginForm" novalidate><span class="logo">SAMS</span><h2>Welcome back</h2>'+
     '<div class="lf"><label for="f-ident">ID or email</label><div class="inp">'+userIc+'<input id="f-ident" name="ident" type="text" value="'+esc(pf.id||'')+'" required autocomplete="username"></div></div>'+
     '<div class="lf"><label for="f-password">Password</label><div class="inp">'+lockIc+'<input id="f-password" name="password" type="password" value="'+esc(pf.pw||'')+'" required autocomplete="current-password"><button class="eye" type="button" data-act="togglepw" aria-label="Show password" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>'+
     '<div class="alt-row"><button type="button" class="link" data-act="forgot">Forgot password?</button></div>'+err+'<button class="btn big" type="submit">Sign in</button><p class="alt">New here? <button type="button" class="link" data-act="mode" data-v="register">Register</button></p></form>'}
  return '<div class="login-stage"><div class="stage-wm" aria-hidden="true"></div>'+inner+'</div>'}
function loginAs(role,id){state.stack=[];state.pwm=null;state.user={role:role,id:id};state.tab='profile';state.edit=false;state.formErr='';state.pwMsg=null;state.cls.sec=null;state.authError='';state.att={subject:'all',month:'all'}}

/* ---------- student ---------- */
function ring(p){var r=46,c=2*Math.PI*r,v=p==null?0:p,l=level(p)[0];
  return '<svg class="ring '+l+'" viewBox="0 0 120 120" role="img" aria-label="Overall attendance '+pctTxt(p)+'"><circle class="track" cx="60" cy="60" r="46"/><circle class="val" style="--c:var(--'+(l==='none'?'mut':l)+')" cx="60" cy="60" r="46" stroke-dasharray="'+(c*v/100)+' '+c+'" transform="rotate(-90 60 60)"/><text class="rv" x="60" y="62" text-anchor="middle">'+(p==null?'–':Math.round(p)+'%')+'</text><text class="rl" x="60" y="80" text-anchor="middle">overall</text></svg>'}
function studentView(){
  var s=byId(students,'student_id',state.user.id),st=statsFor(s.student_id),held=sum(st.map(function(x){return x.held})),att=sum(st.map(function(x){return x.att}));
  var body=state.tab==='attendance'?attView(s,st,held,att):state.tab==='calendar'?calView():profView(s);
  return hero('Student',s.name,[s.student_id,secName(s.section_id),s.course])+tabsHtml([['profile','Profile'],['attendance','Attendance'],['calendar','Academic calendar']])+body}
function secName(id){var s=byId(sections,'section_id',id);return s?s.section_name:''}
function profView(s){
  if(state.edit)return editStudent(s);
  return '<div class="row" style="justify-content:flex-end;margin-bottom:12px"><button class="btn ghost sm" type="button" data-act="edit">Edit details</button></div><div class="grid2">'+
   '<div class="card"><h3>Personal</h3>'+kvs([['Name',s.name],['Gender',s.gender],['Date of birth',s.date_of_birth?fmt(s.date_of_birth)+' ('+ageOn(s.date_of_birth)+' years)':''],['Father',s.father_name],['Mother',s.mother_name]])+'</div>'+
   '<div class="card"><h3>Contact</h3>'+kvs([['Phone',s.phone],['Email',s.email],['Address',s.address],['City',s.city],['Pincode',s.pincode]])+'</div>'+
   '<div class="card"><h3>Academic</h3>'+kvs([['Student ID',s.student_id],['Class',secName(s.section_id)],['Department',s.department],['Course',s.course]])+'</div></div>'+pwCard()}
function editStudent(s){
  return '<form class="card stack" id="profileForm" novalidate><h3>Edit details</h3><div class="form-grid">'+
   field('date_of_birth','Date of birth',{type:'date',value:s.date_of_birth,max:TODAY})+field('father_name','Father',{value:s.father_name})+field('mother_name','Mother',{value:s.mother_name})+
   field('phone','Phone',{value:s.phone,req:1})+field('email','Email',{type:'email',value:s.email,req:1})+field('address','Address',{value:s.address})+field('city','City',{value:s.city})+field('pincode','Pincode',{value:s.pincode})+'</div>'+
   '<p class="muted" style="font-size:.85rem">Name, ID, class, department and course are set by the college office.</p>'+(state.formErr?'<div class="msg bad" role="alert">'+esc(state.formErr)+'</div>':'')+
   '<div class="row"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" data-act="canceledit">Cancel</button></div></form>'}
function pwCard(){return '<div class="card row" style="margin-top:16px;justify-content:space-between"><div><h3>Password</h3><p class="muted" style="font-size:.9rem">Change it in three short steps.</p></div><button class="btn" type="button" data-act="pwopen">Change password</button></div>'}
function modalHtml(){var m=state.pwm;if(!m)return '';
  var L=[['Enter your current password','Current password'],['Choose a new password','New password (8+ characters)'],['Confirm your new password','Confirm new password']][m.step-1];
  return '<div class="modal-bg"><form class="modal" id="pwStep" role="dialog" aria-modal="true" aria-label="Change password" novalidate><div class="steps" aria-hidden="true">'+[1,2,3].map(function(i){return '<i class="'+(i<=m.step?'on':'')+'"></i>'}).join('')+'</div><div><span class="muted" style="font-size:.8rem">Step '+m.step+' of 3</span><h3>'+L[0]+'</h3></div>'+field('val',L[1],{type:'password',req:1,ac:m.step===1?'current-password':'new-password'})+(m.err?'<div class="msg bad" role="alert">'+esc(m.err)+'</div>':'')+'<div class="row" style="justify-content:space-between">'+(m.step>1?'<button class="btn ghost" type="button" data-act="pwback">Back</button>':'<button class="btn ghost" type="button" data-act="pwclose">Cancel</button>')+'<button class="btn" type="submit">'+(m.step===3?'Update password':'Continue')+'</button></div></form></div>'}
function hero(kind,name,chips){return '<div class="hero"><div class="hero-in"><div class="avatar big" aria-hidden="true">'+esc(initials(name))+'</div><div class="grow"><span class="eyebrow">'+kind+' portal</span><h2>'+esc(name)+'</h2><div class="hchips">'+chips.map(function(c){return '<span>'+esc(c)+'</span>'}).join('')+'</div></div><button class="btn light sm" type="button" data-act="logout">Sign out</button></div></div>'}
function miniRing(p){var r=30,c=2*Math.PI*r,l=level(p)[0],col='var(--'+(l==='none'?'mut':l)+')';return '<svg class="mring" viewBox="0 0 76 76" role="img" aria-label="'+pctTxt(p)+'"><circle cx="38" cy="38" r="30" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="38" cy="38" r="30" fill="none" stroke="'+col+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(c*(p||0)/100)+' '+c+'" transform="rotate(-90 38 38)"/><text x="38" y="43" text-anchor="middle" style="font:700 15px var(--f-head);fill:var(--ink)">'+(p==null?'–':Math.round(p)+'%')+'</text></svg>'}
function filterRow(months){
  return '<div class="filterbar">'+
   select('att-month','Month',[['all','All months']].concat(months.map(function(m){return [m,fmt(m+'-01',{month:'long',year:'numeric'})]})),state.att.month,'data-change="attmon"')+
   select('att-subject','Subject',[['all','All subjects']].concat(subjects.map(function(x){return [x.subject_id,x.subject_name]})),state.att.subject,'data-change="attsub"')+'</div>'}
function chartHtml(st,sid){
  var ticks=[0,25,50,75,100],sel=state.att.subject,mon=state.att.month;
  var months=[];records.forEach(function(r){if(r.student_id===sid){var m=r.attendance_date.slice(0,7);if(months.indexOf(m)<0)months.push(m)}});months.sort();
  if(mon!=='all'&&months.indexOf(mon)<0)mon='all';
  var mname=function(m){return fmt(m+'-01',{month:'long',year:'numeric'})};
  var count=function(subId,m){var h=0,a=0;records.forEach(function(r){if(r.student_id===sid&&r.subject_id===subId&&(!m||r.attendance_date.slice(0,7)===m)){h++;if(r.attendance_status==='Present')a++}});return {held:h,att:a,pct:h?a/h*100:null}};
  var rows,title,subtitle;
  if(sel==='all'){
    title='Attendance by subject';
    if(mon==='all'){rows=st.map(function(x){return {name:x.sub.subject_name,held:x.held,att:x.att,pct:x.pct,mode:'all'}});subtitle='Share of classes attended since the start of the term. The line marks the '+MIN+'% minimum for exams.'}
    else{rows=subjects.map(function(b){var c=count(b.subject_id,mon);return {name:b.subject_name,held:c.held,att:c.att,pct:c.pct,mode:'month'}});subtitle='Share of classes attended in '+mname(mon)+'. Exam eligibility uses the all-months figure.'}
  }else{
    var sb=byId(subjects,'subject_id',sel);title='Attendance in '+sb.subject_name;
    rows=(mon==='all'?months:[mon]).map(function(m){var c=count(sel,m);return {name:mname(m),held:c.held,att:c.att,pct:c.pct,mode:'month'}});
    if(mon==='all'){var c0=count(sel,null);rows.push({name:'All months',held:c0.held,att:c0.att,pct:c0.pct,mode:'all'});subtitle='Share of classes attended in each month, and overall. The "All months" bar decides exam eligibility.'}
    else subtitle='Share of classes attended in '+mname(mon)+'. Exam eligibility uses the all-months figure.'
  }
  var hasAll=rows.some(function(r){return r.mode==='all'}),hasMon=rows.some(function(r){return r.mode==='month'});
  var badTxt=hasAll&&!hasMon?'not eligible for exam':!hasAll?'below the minimum this month':'below the minimum (exam eligibility uses "All months")';
  var out='<div class="card chart" id="subjChart"><div class="chart-head"><div><h3>'+esc(title)+'</h3><p class="muted">'+esc(subtitle)+'</p></div></div>'+
   '<div class="viz-key"><span><i class="k ok"></i>'+MIN+'% or above</span><span><i class="k bad"></i>Below '+MIN+'% <b class="ic" aria-hidden="true">✕</b> '+badTxt+'</span></div>';
  out+='<div class="vchart" role="figure" aria-label="Bar chart of attendance percentage"><div class="vplot" aria-hidden="true">'+ticks.map(function(t){return '<i class="gl'+(t===MIN?' min':'')+'" style="left:'+t+'%"></i>'}).join('')+'</div>'+
   rows.map(function(x){var bad=x.held&&x.pct<MIN,p=x.pct==null?0:x.pct;
     var verdict=x.mode==='all'?(bad?'not eligible for exam':'eligible for exam'):(bad?'below 75 percent this month':'75 percent or above this month');
     var lbl=esc(x.name)+': '+(x.held?Math.round(p)+' percent, '+x.att+' of '+x.held+' classes, '+verdict:'no classes yet');
     return '<div class="vrow'+(x.mode==='all'&&sel!=='all'?' total':'')+'" tabindex="0" aria-label="'+lbl+'" data-name="'+esc(x.name)+'" data-att="'+x.att+'" data-held="'+x.held+'" data-pct="'+p.toFixed(1)+'" data-bad="'+(bad?1:0)+'" data-mode="'+x.mode+'"><span class="vlab">'+esc(x.name)+'</span><div class="vtrack">'+(x.held?'<i class="vfill '+(bad?'bad':'ok')+'" style="width:'+p+'%"></i><span class="vval" style="left:calc('+p+'% + 8px)"><b>'+Math.round(p)+'%</b>'+(bad?' <b class="ic" aria-hidden="true">✕</b>':'')+'</span>':'<span class="vval muted" style="left:8px">No classes</span>')+'</div></div>'}).join('')+
   '<div class="vaxis" aria-hidden="true">'+ticks.map(function(t){return '<span class="'+(t===MIN?'min':'')+'" style="left:'+t+'%">'+(t===MIN?MIN+'% min':t+'%')+'</span>'}).join('')+'</div><div class="vtip" role="tooltip" hidden></div></div>';
  return out+'</div>'}
function subjectDetail(s,x){
  var f=faculty.filter(function(f){return f.subject_id===x.sub.subject_id})[0],lv=level(x.pct),bad=x.held&&x.pct<MIN,note='No classes yet';
  if(x.held){var need=Math.max(0,Math.ceil(3*x.held-4*x.att)),skip=Math.max(0,Math.floor((4*x.att-3*x.held)/3));note=x.pct<MIN?'Attend the next '+need+' in a row to reach '+MIN+'%':(skip?'You can miss '+skip+' more and stay at '+MIN+'%':'No spare classes left')}
  var hours=['Mon','Tue','Wed','Thu','Fri'].map(function(d,i){var iso='2026-11-'+String(9+i).padStart(2,'0');return '<li><b>'+d+'</b><span>'+PERIODS[periodOf(s.section_id,x.sub.subject_id,iso)]+'</span></li>'}).join('');
  return '<div class="card subj-detail" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div><h3>Subject details</h3><p class="muted" style="font-size:.86rem">'+esc(x.sub.subject_name)+' · '+esc(secName(s.section_id))+'</p></div><span class="chip '+lv[0]+'">'+lv[1]+'</span></div>'+
   '<div class="sd-grid"><div class="sd-ring">'+ring(x.pct)+'<div>'+(x.held?(bad?'<div class="elig bad"><b>✕</b> Not eligible for exam</div>':'<div class="elig ok"><b>✓</b> Eligible for exam</div>'):'')+'<p class="note muted" style="margin-top:8px;font-size:.88rem">'+note+'</p></div></div>'+
   '<div>'+kvs([['Subject code',x.sub.subject_code],['Faculty',f?f.name:''],['Designation',f?f.designation:''],['Email',f?f.email:''],['Classes held',x.held],['Attended',x.att],['Absent',x.held-x.att]])+'</div>'+
   '<div><h4 class="hrs-h">Usual class hour</h4><ul class="hours">'+hours+'</ul></div></div></div>'}
function showTip(row,ev){
  var card=$('#subjChart'),tip=$('.vtip',card);if(!tip)return;
  var bad=row.getAttribute('data-bad')==='1',held=+row.getAttribute('data-held');
  tip.textContent='';
  var v=document.createElement('div');v.className='tv';v.textContent=held?Math.round(+row.getAttribute('data-pct'))+'%':'–';
  var n=document.createElement('div');n.className='tn';n.textContent=row.getAttribute('data-name');
  var c=document.createElement('div');c.className='tc';
  var k=document.createElement('i');k.className='tk '+(bad?'bad':'ok');c.appendChild(k);
  c.appendChild(document.createTextNode(held?row.getAttribute('data-att')+' of '+held+' classes attended':'No classes yet'));
  tip.appendChild(v);tip.appendChild(n);tip.appendChild(c);
  if(held){var s=document.createElement('div');s.className='ts '+(bad?'bad':'ok');var mm=row.getAttribute('data-mode')==='month';s.textContent=mm?(bad?'✕ Below 75% this month':'✓ 75% or above this month'):(bad?'✕ Not eligible for exam':'✓ Eligible for exam');tip.appendChild(s)}
  tip.hidden=false;
  var cr=tip.offsetParent.getBoundingClientRect(),rr=row.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
  var x=(ev&&ev.clientX!=null?ev.clientX:rr.left+rr.width/2)-cr.left+14,y=rr.top-cr.top-h-6;
  if(y<0)y=rr.bottom-cr.top+6;y=Math.min(y,cr.height-h-8);
  x=Math.max(8,Math.min(x,cr.width-w-8));
  tip.style.left=x+'px';tip.style.top=y+'px'}
function hideTip(){var t=$('#subjChart .vtip');if(t)t.hidden=true}
function attView(s,st,held,att){
  var overall=held?att/held*100:null,short=st.filter(function(x){return x.pct!=null&&x.pct<MIN});
  var nx=upcoming()[0];
  var out='<div class="card overview">'+ring(overall)+'<div class="facts"><div><b class="num">'+att+' / '+held+'</b><span>classes attended</span></div><div><b class="num" style="color:var(--'+(short.length?'bad':'ok')+')">'+short.length+'</b><span>subjects below '+MIN+'%</span></div>'+
   (nx?'<div><b>'+fmt(nx.start_date,{day:'numeric',month:'short'})+'</b><span>'+esc(nx.title)+'</span></div>':'')+'</div></div>';
  if(short.length)out+='<div class="msg bad" style="margin-top:16px" role="status">You are below '+MIN+'% in '+short.map(function(x){return esc(x.sub.subject_name)}).join(', ')+', so you are not eligible for the exam in '+(short.length>1?'those subjects':'that subject')+' yet. The cards below show how many classes you need to attend in a row.</div>';
  var months=[];records.forEach(function(r){if(r.student_id===s.student_id){var m=r.attendance_date.slice(0,7);if(months.indexOf(m)<0)months.push(m)}});months.sort();
  var sel=state.att.subject;
  out+=filterRow(months);
  out+=chartHtml(st,s.student_id);
  if(sel==='all'){
  var okN=st.filter(function(x){return x.held&&x.pct>=MIN}).length;
  out+='<div class="row" style="justify-content:space-between;margin:26px 0 12px"><h3>By subject</h3><span class="chip '+(short.length?'bad':'ok')+'">Exam eligible in '+okN+' of '+st.length+' subjects</span></div><div class="subj-grid">'+st.map(function(x){var lv=level(x.pct),f=faculty.filter(function(f){return f.subject_id===x.sub.subject_id})[0],note='No classes yet';
   if(x.held){var need=Math.max(0,Math.ceil(3*x.held-4*x.att)),skip=Math.max(0,Math.floor((4*x.att-3*x.held)/3));note=x.pct<MIN?'Attend the next '+need+' in a row to reach '+MIN+'%':(skip?'You can miss '+skip+' more and stay at '+MIN+'%':'No spare classes left')}
   return '<article class="subj" style="--c:var(--'+(lv[0]==='none'?'mut':lv[0])+')"><header><div><h4>'+esc(x.sub.subject_name)+'</h4><span class="muted">'+esc(x.sub.subject_code)+' · '+esc(f?f.name:'')+'</span></div><span class="chip '+lv[0]+'">'+lv[1]+'</span></header><div class="subj-body">'+miniRing(x.pct)+'<div class="subj-nums"><b class="num">'+x.att+' of '+x.held+'</b><span>classes attended</span></div></div><div class="bar"><i style="width:'+(x.pct||0)+'%"></i><b></b></div><p class="note">'+note+'</p>'+(x.held?(x.pct<MIN?'<div class="elig bad"><b>\u2715</b> Not eligible for exam</div>':'<div class="elig ok"><b>\u2713</b> Eligible for exam</div>'):'')+'</article>'}).join('')+'</div>';
  }else{out+=subjectDetail(s,st.filter(function(x){return x.sub.subject_id===sel})[0])}
  var log=records.filter(function(r){return r.student_id===s.student_id&&(state.att.subject==='all'||r.subject_id===state.att.subject)&&(state.att.month==='all'||r.attendance_date.slice(0,7)===state.att.month)}).sort(function(a,b){return a.attendance_date<b.attendance_date?1:a.attendance_date>b.attendance_date?-1:0});
  out+='<div class="row" style="justify-content:space-between;margin:26px 0 10px"><h3>Hourly record</h3><span class="chip" style="--c:var(--accent)">'+esc((sel==='all'?'All subjects':byId(subjects,'subject_id',sel).subject_name)+' \u00b7 '+(state.att.month==='all'?'All months':fmt(state.att.month+'-01',{month:'long',year:'numeric'})))+'</span></div>';
  var dates=[];log.forEach(function(r){if(dates.indexOf(r.attendance_date)<0)dates.push(r.attendance_date)});var shown=dates.slice(0,12);
  var cell={};log.forEach(function(r){cell[r.attendance_date+'|'+r.period]=r});
  out+=dates.length?'<div class="tbl"><table class="hourly"><thead><tr><th>Date</th>'+PERIODS.map(function(p){return '<th>'+p+'</th>'}).join('')+'</tr></thead><tbody>'+shown.map(function(d){return '<tr><td><b>'+fmt(d,{weekday:'short',day:'numeric',month:'short'})+'</b></td>'+PERIODS.map(function(p,i){var r=cell[d+'|'+i];if(!r)return '<td class="empty">–</td>';var ab=r.attendance_status==='Absent';return '<td class="slot '+(ab?'absent':'present')+'"><span class="sn">'+esc(byId(subjects,'subject_id',r.subject_id).subject_name)+'</span><span class="chip '+(ab?'bad':'ok')+'">'+r.attendance_status+'</span></td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+(dates.length>12?'<p class="muted" style="margin-top:8px;font-size:.85rem">Showing the latest 12 days of '+dates.length+'.</p>':''):'<div class="card muted">No classes recorded yet for this selection.</div>';
  return out}
function evsOn(iso){return events.filter(function(e){return e.event_type!=='Semester'&&!state.calHide[e.event_type]&&e.start_date<=iso&&iso<=e.end_date})}
function rel(e){if(e.end_date<TODAY)return 'Past';if(e.start_date<=TODAY)return 'Today';var n=dayDiff(TODAY,e.start_date);return n===1?'Tomorrow':'In '+n+' days'}
function calView(){
  var y=state.cal.y,m=state.cal.m,first=new Date(Date.UTC(y,m,1)),lead=(first.getUTCDay()+6)%7,dim=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  var cells='',names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];names.forEach(function(n){cells+='<div class="dow">'+n+'</div>'});
  var total=Math.ceil((lead+dim)/7)*7;
  for(var i=0;i<total;i++){var day=i-lead+1;
    if(day<1||day>dim){cells+='<div class="cell out"></div>';continue}
    var iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),ev=evsOn(iso),we=(i%7)>4;
    cells+='<div class="cell'+(we?' we':'')+(iso===TODAY?' today':'')+'"><span class="d">'+day+'</span><div class="dots">'+ev.slice(0,4).map(function(e){return '<i style="--c:var('+TYPE[e.event_type]+')" title="'+esc(e.title)+'"></i>'}).join('')+'</div>'+ev.slice(0,2).map(function(e){return '<span class="ev" style="--c:var('+TYPE[e.event_type]+')" title="'+esc(e.title)+'">'+esc(e.title)+'</span>'}).join('')+'</div>'}
  var f1=y+'-'+String(m+1).padStart(2,'0')+'-01',fl=y+'-'+String(m+1).padStart(2,'0')+'-'+String(dim).padStart(2,'0');
  var list=events.filter(function(e){return e.event_type!=='Semester'&&!state.calHide[e.event_type]&&e.start_date<=fl&&e.end_date>=f1}).sort(function(a,b){return a.start_date<b.start_date?-1:1});
  var term=events[0];
  return '<p class="term">'+esc(term.title)+' · '+fmt(term.start_date,{day:'numeric',month:'short'})+' to '+fmt(term.end_date)+' · Academic year '+term.academic_year+'</p>'+
   '<div class="cal-head"><h3>'+fmt(f1,{month:'long',year:'numeric'})+'</h3><div class="row"><button class="btn ghost sm" type="button" data-act="calprev" aria-label="Previous month">‹ Prev</button><button class="btn ghost sm" type="button" data-act="caltoday">Today</button><button class="btn ghost sm" type="button" data-act="calnext" aria-label="Next month">Next ›</button></div></div>'+
   '<div class="legend" style="margin-bottom:12px">'+Object.keys(TYPE).map(function(t){return '<button type="button" style="--c:var('+TYPE[t]+')" aria-pressed="'+!state.calHide[t]+'" data-act="calfilter" data-v="'+t+'"><i></i>'+t+'</button>'}).join('')+'</div>'+
   '<div class="cal">'+cells+'</div><div class="evlist">'+(list.length?list.map(function(e){var sub=e.subject_id?byId(subjects,'subject_id',e.subject_id):null,same=e.start_date===e.end_date;
     return '<div class="evrow" style="--c:var('+TYPE[e.event_type]+')"><div class="dt num">'+fmt(e.start_date,{day:'numeric',month:'short'})+(same?'':' – '+fmt(e.end_date,{day:'numeric',month:'short'}))+'</div><div class="t">'+esc(e.title)+'<small>'+e.event_type+(sub?' · '+esc(sub.subject_name):'')+'</small></div><span class="chip '+(rel(e)==='Past'?'none':'')+'" style="--c:var('+TYPE[e.event_type]+')">'+rel(e)+'</span></div>'}).join(''):'<div class="card muted">Nothing scheduled this month for the selected types.</div>')+'</div>'}

/* ---------- faculty ---------- */
function facultyView(){
  var f=byId(faculty,'faculty_id',state.user.id),sub=byId(subjects,'subject_id',f.subject_id);
  var body=state.tab==='classes'?(state.cls.sec?classView(f,sub):classList(f,sub)):facProfile(f,sub);
  return hero('Faculty',f.name,[f.faculty_id,f.designation,sub.subject_name])+tabsHtml([['profile','Profile'],['classes','Classes attending']])+body}
function facProfile(f,sub){
  if(state.edit)return '<form class="card stack" id="profileForm" novalidate><h3>Edit contact details</h3><div class="form-grid">'+field('phone','Phone',{value:f.phone,req:1})+field('email','Email',{type:'email',value:f.email,req:1})+'</div>'+(state.formErr?'<div class="msg bad" role="alert">'+esc(state.formErr)+'</div>':'')+'<div class="row"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" data-act="canceledit">Cancel</button></div></form>';
  return '<div class="row" style="justify-content:flex-end;margin-bottom:12px"><button class="btn ghost sm" type="button" data-act="edit">Edit contact</button></div><div class="grid2"><div class="card"><h3>Personal</h3>'+kvs([['Name',f.name],['Gender',f.gender],['Age',f.age+' years'],['Email',f.email],['Phone',f.phone]])+'</div>'+
   '<div class="card"><h3>Professional</h3>'+kvs([['Faculty ID',f.faculty_id],['Designation',f.designation],['Qualification',f.qualification],['Experience',f.experience+' years'],['Department',f.department],['Subject',sub.subject_name+' ('+sub.subject_code+')']])+'</div></div>'+pwCard()}
function classStats(sec,subId){var list=students.filter(function(s){return s.section_id===sec});var h=0,a=0,low=0;list.forEach(function(s){var x=subStat(s.student_id,subId);h+=x.held;a+=x.att;if(x.pct!=null&&x.pct<MIN)low++});return{n:list.length,pct:h?a/h*100:null,low:low}}
function classList(f,sub){
  var yr=['1st year','2nd year','3rd year'];
  return '<p class="muted" style="margin-bottom:14px">You teach <b>'+esc(sub.subject_name)+'</b>. Open a class to take attendance or see its students.</p><div class="classes">'+sections.map(function(sec,i){var c=classStats(sec.section_id,sub.subject_id),lv=level(c.pct);
   return '<button type="button" class="class-card g'+i+'" data-act="openclass" data-v="'+sec.section_id+'"><div class="cc-top"><span class="yr">'+yr[i]+'</span><h3>'+esc(sec.section_name)+'</h3><span>'+c.n+' students</span></div><div class="cc-body">'+miniRing(c.pct)+'<div class="subj-nums"><b>Class average</b><span class="chip '+lv[0]+'">'+lv[1]+'</span></div></div><div class="cc-foot">'+(c.low?'<span class="chip bad">'+c.low+' below '+MIN+'%</span>':'<span class="chip ok">All above '+MIN+'%</span>')+'<span class="go">Open class ›</span></div></button>'}).join('')+'</div>'}
function loadMarks(sec,subId){var m={},found=false;students.filter(function(s){return s.section_id===sec}).forEach(function(s){var r=records.filter(function(x){return x.student_id===s.student_id&&x.subject_id===subId&&x.attendance_date===state.cls.date})[0];if(r)found=true;m[s.student_id]=r?r.attendance_status:'Present'});state.cls.marks=m;state.cls.existing=found}
function classView(f,sub){
  var sec=byId(sections,'section_id',state.cls.sec),list=students.filter(function(s){return s.section_id===sec.section_id}),c=state.cls;
  var head='<div class="row" style="justify-content:space-between;margin-bottom:14px"><div><h2>'+esc(sec.section_name)+'</h2><p class="muted">'+esc(sub.subject_name)+' · '+list.length+' students</p></div><div class="seg" role="tablist"><button type="button" role="tab" aria-selected="'+(c.view==='mark')+'" data-act="clsview" data-v="mark">Attendance update</button><button type="button" role="tab" aria-selected="'+(c.view==='list')+'" data-act="clsview" data-v="list">Student list</button></div></div>';
  if(c.view==='list'){
    return head+'<div class="tbl"><table><thead><tr><th>Student ID</th><th>Name</th><th>Phone</th><th class="n">Held</th><th class="n">Attended</th><th class="n">Attendance</th><th>Status</th></tr></thead><tbody>'+list.map(function(s){var x=subStat(s.student_id,sub.subject_id),lv=level(x.pct);
      return '<tr class="'+(lv[0]==='bad'?'short':'')+'"><td class="num">'+esc(s.student_id)+'</td><td><b>'+esc(s.name)+'</b></td><td class="num">'+esc(s.phone)+'</td><td class="n">'+x.held+'</td><td class="n">'+x.att+'</td><td class="n"><b>'+pctTxt(x.pct)+'</b></td><td><span class="chip '+lv[0]+'">'+lv[1]+'</span></td></tr>'}).join('')+'</tbody></table></div>'}
  var d=D(c.date).getUTCDay(),we=d===0||d===6;
  var out=head+'<div class="toolbar">'+field('date','Class date',{type:'date',value:c.date,max:TODAY})+'<button class="btn ghost sm" type="button" data-act="markall" data-v="Present">Mark all present</button><button class="btn ghost sm" type="button" data-act="markall" data-v="Absent">Mark all absent</button></div>'+
   '<div class="msg '+(c.existing?'warn':'none')+'" style="margin-bottom:12px" id="dateNote">'+(c.existing?'Attendance for this date is already saved. Saving again replaces it.':'No attendance saved for this date yet.')+(we?' This date is a weekend.':'')+'</div>'+
   '<div class="list-card" id="markList">'+list.map(function(s){var st=c.marks[s.student_id];return markRow(s,st)}).join('')+'</div>'+
   '<div class="row" style="justify-content:space-between;margin-top:14px"><span id="markSummary" class="muted"></span><button class="btn" type="button" data-act="save">Save attendance</button></div>';
  if(c.alerts)out+='<div class="card" style="margin-top:18px"><h3>Shortage alerts queued</h3>'+(c.alerts.length?'<p class="muted" style="margin:6px 0 10px;font-size:.88rem">These students are now below '+MIN+'% in '+esc(sub.subject_name)+'. In the live system the Notifications module would email them. Nothing is sent from this demo.</p><div class="tags">'+c.alerts.map(function(a){return '<span class="chip bad">'+esc(a.name)+' · '+a.pct.toFixed(1)+'%</span>'}).join('')+'</div>':'<p class="muted" style="margin-top:6px">Everyone in this class is at or above '+MIN+'%.</p>')+'</div>';
  return out}
function markRow(s,st){return '<div class="mark-row" data-stu="'+s.student_id+'"><span class="id">'+esc(s.student_id)+'</span><b>'+esc(s.name)+'</b><div class="seg"><button type="button" class="p" aria-pressed="'+(st==='Present')+'" data-act="mark" data-id="'+s.student_id+'" data-v="Present">Present</button><button type="button" class="a" aria-pressed="'+(st==='Absent')+'" data-act="mark" data-id="'+s.student_id+'" data-v="Absent">Absent</button></div></div>'}
function updateMarkUI(){
  $$('#markList .mark-row').forEach(function(row){var st=state.cls.marks[row.getAttribute('data-stu')];$$('button',row).forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-v')===st))})});
  var v=Object.keys(state.cls.marks).map(function(k){return state.cls.marks[k]}),p=v.filter(function(x){return x==='Present'}).length,el=$('#markSummary');
  if(el)el.textContent=p+' present · '+(v.length-p)+' absent'}
function saveAttendance(){
  var f=byId(faculty,'faculty_id',state.user.id),sub=f.subject_id,sec=state.cls.sec,c=state.cls;
  if(!c.date||c.date>TODAY){toast('Choose a class date on or before today.');return}
  Object.keys(c.marks).forEach(function(id){
    var r=records.filter(function(x){return x.student_id===id&&x.subject_id===sub&&x.attendance_date===c.date})[0];
    if(r){r.attendance_status=c.marks[id];r.faculty_id=f.faculty_id}
    else records.push({attendance_id:'ATT'+String(++attSeq).padStart(5,'0'),student_id:id,faculty_id:f.faculty_id,section_id:sec,subject_id:sub,calendar_id:'CAL01',attendance_date:c.date,period:periodOf(sec,sub,c.date),attendance_status:c.marks[id]})});
  c.alerts=[];students.filter(function(s){return s.section_id===sec}).forEach(function(s){var x=subStat(s.student_id,sub);if(x.pct!=null&&x.pct<MIN)c.alerts.push({name:s.name,pct:x.pct})});
  c.existing=true;toast('Attendance saved for '+fmt(c.date)+'.');renderPortal()}

/* ---------- portal render & events ---------- */
function snap(){state.stack.push({tab:state.tab,sec:state.cls.sec,view:state.cls.view,edit:state.edit})}
function backBtn(){return '<button class="btn ghost sm back" type="button" data-act="back">‹ '+(state.stack.length?'Back':'Back to sign in')+'</button>'}
function renderPortal(){var el=$('#portal');if(state.user&&state.user.role==='faculty')document.documentElement.setAttribute('data-role','faculty');else document.documentElement.removeAttribute('data-role');el.innerHTML=!state.user?authView():backBtn()+(state.user.role==='student'?studentView():facultyView())+modalHtml();if(state.user&&state.user.role==='faculty'&&state.tab==='classes'&&state.cls.sec&&state.cls.view==='mark')updateMarkUI();var af=$('#f-val');if(af)af.focus()}
function openClass(sec){state.tab='classes';state.cls.sec=sec;state.cls.view='mark';state.cls.date=TODAY;state.cls.alerts=null;loadMarks(sec,byId(faculty,'faculty_id',state.user.id).subject_id)}
var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
$('#portal').addEventListener('click',function(e){
  if(e.target.classList&&e.target.classList.contains('modal-bg')){state.pwm=null;renderPortal();return}
  var t=e.target.closest('[data-act]');if(!t)return;var a=t.getAttribute('data-act'),v=t.getAttribute('data-v');
  if(a==='role'){state.loginRole=v;state.authError='';state.prefill=null}
  else if(a==='mode'){state.authMode=v;state.authError='';state.authInfo=''}
  else if(a==='demo'){state.loginRole=v;state.authMode='login';state.authError='';state.prefill={id:v==='student'?DEMO.student:DEMO.faculty,pw:'demo123'}}
  else if(a==='forgot'){state.authMode='forgot';state.authError='';state.authInfo=''}
  else if(a==='logout'){state.stack=[];state.user=null;state.authError='';state.prefill=null}
  else if(a==='togglepw'){var pi=$('#f-password');pi.type=pi.type==='password'?'text':'password';t.setAttribute('aria-pressed',String(pi.type==='text'));t.setAttribute('aria-label',pi.type==='text'?'Hide password':'Show password');return}
  else if(a==='chartmonth'){state.chartMonth=v}
  else if(a==='pwopen'){state.pwm={step:1,cur:'',next:'',err:''}}
  else if(a==='pwclose'){state.pwm=null}
  else if(a==='pwback'){state.pwm.step--;state.pwm.err=''}
  else if(a==='back'){var p=state.stack.pop();if(!p){state.user=null;state.authError='';state.prefill=null}else{state.tab=p.tab;state.cls.sec=p.sec;state.cls.view=p.view;state.edit=p.edit;state.formErr='';state.pwMsg=null;if(p.sec&&p.view==='mark'){state.cls.date=TODAY;state.cls.alerts=null;loadMarks(p.sec,byId(faculty,'faculty_id',state.user.id).subject_id)}}}
  else if(a==='tab'){if(v!==state.tab||state.cls.sec||state.edit)snap();state.tab=v;state.edit=false;state.formErr='';state.pwMsg=null;state.cls.sec=null}
  else if(a==='edit'){snap();state.edit=true;state.formErr=''}
  else if(a==='canceledit'){state.edit=false;state.formErr=''}
  else if(a==='calprev'){state.cal.m--;if(state.cal.m<0){state.cal.m=11;state.cal.y--}}
  else if(a==='calnext'){state.cal.m++;if(state.cal.m>11){state.cal.m=0;state.cal.y++}}
  else if(a==='caltoday'){state.cal={y:2026,m:10}}
  else if(a==='calfilter'){state.calHide[v]=!state.calHide[v]}
  else if(a==='openclass'){snap();openClass(v)}
  else if(a==='closeclass'){state.cls.sec=null}
  else if(a==='clsview'){if(v!==state.cls.view)snap();state.cls.view=v}
  else if(a==='mark'){state.cls.marks[t.getAttribute('data-id')]=v;updateMarkUI();return}
  else if(a==='markall'){Object.keys(state.cls.marks).forEach(function(k){state.cls.marks[k]=v});updateMarkUI();return}
  else if(a==='save'){saveAttendance();return}
  renderPortal()});
$('#portal').addEventListener('pointermove',function(e){var r=e.target.closest&&e.target.closest('.vrow');if(r)showTip(r,e);else hideTip()});
$('#portal').addEventListener('pointerleave',hideTip);
$('#portal').addEventListener('focusin',function(e){var r=e.target.closest&&e.target.closest('.vrow');if(r)showTip(r,null)});
$('#portal').addEventListener('focusout',hideTip);
$('#portal').addEventListener('change',function(e){
  var t=e.target,k=t.getAttribute('data-change');
  if(k==='attsub'){state.att.subject=t.value;renderPortal();var e1=$('#'+t.id);if(e1)e1.focus();return}
  if(k==='attmon'){state.att.month=t.value;renderPortal();var e2=$('#'+t.id);if(e2)e2.focus();return}
  if(t.id==='f-date'&&state.user&&state.user.role==='faculty'){state.cls.date=t.value||TODAY;loadMarks(state.cls.sec,byId(faculty,'faculty_id',state.user.id).subject_id);renderPortal()}});
$('#portal').addEventListener('submit',function(e){
  e.preventDefault();var f=e.target,el=f.elements;
  if(f.id==='forgotForm'){
    var q=el.ident.value.trim().toLowerCase();
    if(!q){state.authError='Enter your ID or email.';state.authInfo='';renderPortal();return}
    state.authError='';state.authInfo='If an account matches, a reset link has been sent to its email. This demo sends no email, and every sample password is still demo123.';renderPortal();return}
  if(f.id==='loginForm'){
    var idv=el.ident.value.trim().toLowerCase(),role='student',key='student_id';
    var u=students.filter(function(x){return x.student_id.toLowerCase()===idv||x.email.toLowerCase()===idv})[0];
    if(!u){u=faculty.filter(function(x){return x.faculty_id.toLowerCase()===idv||x.email.toLowerCase()===idv})[0];role='faculty';key='faculty_id'}
    state.prefill={id:el.ident.value,pw:el.password.value};
    if(!u||getPw(u[key])!==el.password.value){state.authError='ID or password is incorrect.';renderPortal();return}
    loginAs(role,u[key]);toast('Signed in as '+u.name+'.');renderPortal();return}
  if(f.id==='regForm'){
    var name=el.name.value.trim(),email=el.email.value.trim(),phone=el.phone.value.trim(),pw=el.password.value,isS2=state.loginRole==='student';
    var all=students.concat(faculty);
    var err=name.length<2?'Enter your full name.':!emailRe.test(email)?'Enter a valid email address.':!/^\d{10}$/.test(phone)?'Phone must be 10 digits.':pw.length<8?'Password needs at least 8 characters.':all.some(function(x){return x.email.toLowerCase()===email.toLowerCase()})?'That email is already registered.':'';
    if(err){state.authError=err;renderPortal();return}
    var id;
    if(isS2){var sec=byId(sections,'section_id',el.section.value);var n=students.filter(function(s){return s.section_id===sec.section_id}).length+1;id=sec.prefix+String(n).padStart(3,'0');
      students.push({student_id:id,section_id:sec.section_id,name:name,gender:el.gender.value,date_of_birth:'',phone:phone,email:email,father_name:'',mother_name:'',address:'',city:'',pincode:'',department:DEPT,course:'B.Tech',tend:.85})}
    else{id='F'+(101+faculty.length);faculty.push({faculty_id:id,subject_id:el.subject.value,name:name,age:'',gender:el.gender.value,email:email,phone:phone,qualification:el.qualification.value.trim(),designation:el.designation.value,department:DEPT,experience:0})}
    pws[id]=pw;loginAs(state.loginRole,id);toast('Account created. Your ID is '+id+'.');renderPortal();return}
  if(f.id==='profileForm'){
    var isStu=state.user.role==='student',rec=isStu?byId(students,'student_id',state.user.id):byId(faculty,'faculty_id',state.user.id);
    var ph=el.phone.value.trim(),em=el.email.value.trim(),pin=isStu?el.pincode.value.trim():'';
    var er=!/^\d{10}$/.test(ph)?'Phone must be 10 digits.':!emailRe.test(em)?'Enter a valid email address.':(isStu&&pin&&!/^\d{6}$/.test(pin))?'Pincode must be 6 digits.':'';
    if(er){state.formErr=er;renderPortal();return}
    rec.phone=ph;rec.email=em;
    if(isStu){['date_of_birth','father_name','mother_name','address','city','pincode'].forEach(function(k){rec[k]=el[k].value.trim()})}
    state.edit=false;state.formErr='';toast('Details saved.');renderPortal();return}
  if(f.id==='pwStep'){
    var m=state.pwm,val=el.val.value,uid2=state.user.id;
    if(m.step===1){if(getPw(uid2)!==val)m.err='Current password is incorrect.';else{m.cur=val;m.step=2;m.err=''}}
    else if(m.step===2){if(val.length<8)m.err='New password needs at least 8 characters.';else if(val===m.cur)m.err='Choose a password different from your current one.';else{m.next=val;m.step=3;m.err=''}}
    else{if(val!==m.next)m.err='The passwords do not match. Try again.';else{pws[uid2]=m.next;state.pwm=null;toast('Password updated.')}}
    renderPortal();return}
  if(f.id==='pwForm'){
    var uid=state.user.id,cur=el.current.value,nx=el.next.value,cf=el.confirm.value;
    state.pwMsg=getPw(uid)!==cur?{ok:0,text:'Current password is incorrect.'}:nx.length<8?{ok:0,text:'New password needs at least 8 characters.'}:nx!==cf?{ok:0,text:'The two new passwords do not match.'}:null;
    if(!state.pwMsg){pws[uid]=nx;state.pwMsg={ok:1,text:'Password updated.'}}
    renderPortal()}});

/* ---------- flowchart ---------- */
function nodeBox(x,y,w,h,title,lines,kind,go){var cx=x+w/2,lh=15,start=y+h/2-(lines.length*lh)/2+4;
  var t='<text class="nt" x="'+cx+'" y="'+start+'" text-anchor="middle">'+esc(title)+'</text>';
  lines.forEach(function(l,i){t+='<text class="nl" x="'+cx+'" y="'+(start+(i+1)*lh)+'" text-anchor="middle">'+esc(l)+'</text>'});
  return '<g class="node '+kind+'" data-go="'+go+'" tabindex="0" role="link" aria-label="'+esc(title)+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12"/>'+t+'</g>'}
function diamond(cx,cy,hw,hh,title,lines,go){var lh=14,start=cy-(lines.length*lh)/2+4;
  var t='<text class="nt" x="'+cx+'" y="'+start+'" text-anchor="middle">'+esc(title)+'</text>';
  lines.forEach(function(l,i){t+='<text class="nl" x="'+cx+'" y="'+(start+(i+1)*lh)+'" text-anchor="middle">'+esc(l)+'</text>'});
  return '<g class="node dec" data-go="'+go+'" tabindex="0" role="link" aria-label="'+esc(title)+'"><polygon points="'+cx+','+(cy-hh)+' '+(cx+hw)+','+cy+' '+cx+','+(cy+hh)+' '+(cx-hw)+','+cy+'"/>'+t+'</g>'}
function renderFlow(){
  var e=function(d){return '<path class="edge" d="'+d+'" marker-end="url(#arr)"/>'};
  var s='<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs>'+
   e('M210 285H237V150H265')+e('M210 315H237V440H265')+
   e('M415 150H478V80H540')+e('M415 150H478V190H540')+e('M415 150H478V280H540')+
   e('M415 440H478V395H540')+e('M415 440H478V520H540')+
   e('M750 520H775V410H800')+e('M750 520H800')+e('M750 520H775V630H800')+
   nodeBox(20,240,190,120,'Login / Landing page',['Register','Email','Password','Sign in','Forgot password'],'login','login')+
   diamond(340,150,75,62,'Student',['Profile','Attendance','Calendar'],'student:profile')+
   diamond(340,440,75,62,'Faculty',['Profile','Classes'],'faculty:profile')+
   nodeBox(540,30,210,100,'Profile',['Name, gender, date of birth','Contact, address, city','Parents, department, course','Change password'],'stu','student:profile')+
   nodeBox(540,150,210,80,'Attendance',['Subject-wise percentage','Daily record, 75% rule'],'stu','student:attendance')+
   nodeBox(540,250,210,60,'Academic calendar',['Exams, tests, holidays'],'stu','student:calendar')+
   nodeBox(540,350,210,90,'Profile',['Name, designation, ID','Qualification, experience','Contact, subject'],'fac','faculty:profile')+
   nodeBox(540,470,210,100,'Classes attending',['1st Year ECE-C','2nd Year ECE-B','3rd Year ECE-A'],'fac','faculty:classes')+
   nodeBox(800,375,180,70,'1st Year ECE-C',['Student list','Attendance update'],'cls','faculty:class:SEC1')+
   nodeBox(800,485,180,70,'2nd Year ECE-B',['Student list','Attendance update'],'cls','faculty:class:SEC2')+
   nodeBox(800,595,180,70,'3rd Year ECE-A',['Student list','Attendance update'],'cls','faculty:class:SEC3');
  $('#flowSvg').innerHTML=s}
function goFlow(t){
  if(t==='login'){state.user=null;state.authMode='login';state.prefill={id:DEMO.student,pw:'demo123'};state.authError=''}
  else{var p=t.split(':'),role=p[0];loginAs(role,role==='student'?DEMO.student:DEMO.faculty);state.tab=p[1];
    if(p[1]==='class')openClass(p[2])}
  if(location.hash!=='#portal')location.hash='#portal';else route();
  renderPortal();window.scrollTo(0,0)}
$('#flowSvg').addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g)goFlow(g.getAttribute('data-go'))});
$('#flowSvg').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var g=e.target.closest('[data-go]');if(g){e.preventDefault();goFlow(g.getAttribute('data-go'))}}});

/* ---------- architecture ---------- */
var ARCH={
 users:{t:'Users',tag:'Student and Faculty',c:'u',body:'Two kinds of people sign in. The role in their account decides which screens they see after login.',tables:['Student','Faculty'],api:[]},
 frontend:{t:'Login, registration and dashboards',tag:'React.js + TypeScript · Tailwind CSS',c:'fe',body:'The browser app. It shows the login and registration pages, then the student or faculty dashboard. Every screen loads its data through the REST API.',tables:[],api:['POST /api/auth/login','POST /api/auth/register']},
 auth:{t:'Authentication',tag:'Spring Security + JWT',c:'sec',body:'Checks credentials and issues a signed token that the frontend sends with each request. Verification and password-reset emails go out through Resend or SendGrid.',tables:['Student','Faculty'],api:['POST /api/auth/refresh','POST /api/auth/forgot-password']},
 backend:{t:'Backend API',tag:'Java + Spring Boot',c:'be',body:'One Spring Boot service exposes the REST endpoints, applies the role rules and talks to the database. It is split into six modules, shown below.',tables:[],api:[]},
 student:{t:'Student management',tag:'Profiles',c:'mod',body:'Create, read and update student profiles. Students can edit their own contact details; the office manages ID, class and course.',tables:['Student','Section'],api:['GET /api/students/{id}','PUT /api/students/{id}']},
 faculty:{t:'Faculty management',tag:'Profiles',c:'mod',body:'Faculty profiles and the subject each faculty member teaches.',tables:['Faculty','Subject'],api:['GET /api/faculty/{id}','PUT /api/faculty/{id}']},
 attendance:{t:'Attendance management',tag:'Mark and report',c:'mod',body:'Faculty submit attendance for a class and date. Students read their totals and percentage per subject. Percentage is attended classes divided by classes held.',tables:['Attendance','Student','Faculty','Section','Subject','Academic_Calendar'],api:['POST /api/classes/{sectionId}/attendance','GET /api/students/{id}/attendance']},
 calendar:{t:'Academic calendar',tag:'Dates and events',c:'mod',body:'Exams, class tests, assignments and holidays for the academic year, optionally tied to a subject.',tables:['Academic_Calendar','Subject'],api:['GET /api/calendar?year=2026-27']},
 classes:{t:'Class and subject management',tag:'Sections and subjects',c:'mod',body:'Defines the sections (for example 2nd Year ECE-B) and the subjects taught, and which class each faculty member attends.',tables:['Section','Subject','Faculty'],api:['GET /api/sections','GET /api/faculty/{id}/classes']},
 notify:{t:'Notifications',tag:'Shortage alerts',c:'mod',body:'Watches attendance and prepares an alert when a student falls below 75% in a subject. Alerts are handed to the email service.',tables:['Attendance','Student'],api:['POST /api/notifications/shortage']},
 email:{t:'Email service',tag:'Resend or SendGrid',c:'sec',body:'Delivers verification, password-reset and attendance shortage emails.',tables:[],api:[]},
 db:{t:'Database',tag:'PostgreSQL (Supabase)',c:'db',body:'Stores all six tables from the data model. The Data model tab has the schema ready to copy.',tables:['Student','Faculty','Subject','Section','Attendance','Academic_Calendar'],api:[]}};
function anode(id){var a=ARCH[id];return '<button type="button" class="anode '+a.c+'" data-arch="'+id+'" aria-pressed="'+(state.arch===id)+'"><b>'+a.t+'</b><small>'+a.tag+'</small></button>'}
function renderArch(){
  var conn=function(l){return '<div class="conn">'+l+'</div>'};
  $('#archMap').innerHTML='<div class="layer">'+anode('users')+'</div>'+conn('signs in')+'<div class="layer single">'+anode('frontend')+'</div>'+conn('REST requests and responses')+
   '<div class="layer single">'+anode('auth')+'</div>'+conn('verified token')+'<div class="layer single">'+anode('backend')+'</div>'+conn('')+
   '<div class="layer">'+['student','faculty','attendance','calendar','classes','notify'].map(anode).join('')+'</div>'+conn('queries')+
   '<div class="layer single">'+anode('db')+'</div>'+'<div class="conn" style="margin-top:6px">Notifications also call</div><div class="layer single">'+anode('email')+'</div>';
  var a=ARCH[state.arch];
  $('#archDetail').innerHTML='<h3>'+a.t+'</h3><div class="muted" style="font-size:.86rem">'+a.tag+'</div><p>'+a.body+'</p>'+
   (a.tables.length?'<h4>Tables</h4><div class="tags">'+a.tables.map(function(t){return '<span class="tag">'+t+'</span>'}).join('')+'</div>':'')+
   (a.api.length?'<h4>Suggested endpoints</h4><div class="tags">'+a.api.map(function(t){return '<span class="tag">'+t+'</span>'}).join('')+'</div>':'')}
$('#archMap').addEventListener('click',function(e){var b=e.target.closest('[data-arch]');if(!b)return;state.arch=b.getAttribute('data-arch');renderArch();
  if(window.matchMedia('(max-width:940px)').matches)$('#archDetail').scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})});

/* ---------- ER ---------- */
var ER={
 Student:{x:40,y:60,w:220,f:[['PK','student_id'],['FK','section_id'],['','name'],['','age'],['','gender'],['','date_of_birth'],['','phone'],['','email'],['','father_name'],['','mother_name'],['','address'],['','city'],['','pincode'],['','department'],['','course']]},
 Faculty:{x:940,y:60,w:220,f:[['PK','faculty_id'],['FK','subject_id'],['','name'],['','age'],['','gender'],['','email'],['','phone'],['','qualification'],['','designation'],['','department'],['','experience']]},
 Subject:{x:490,y:40,w:240,f:[['PK','subject_id'],['','subject_name'],['','subject_code']]},
 Section:{x:40,y:480,w:220,f:[['PK','section_id'],['','section_name'],['','department'],['','course']]},
 Attendance:{x:490,y:250,w:240,f:[['PK','attendance_id'],['FK','student_id'],['FK','faculty_id'],['FK','section_id'],['FK','subject_id'],['FK','calendar_id'],['','attendance_date'],['','attendance_status'],['','total_classes_held'],['','attended_classes'],['','attendance_percentage']]},
 Academic_Calendar:{x:490,y:600,w:240,f:[['PK','calendar_id'],['','event_id'],['','event_type'],['','start_date'],['','end_date'],['','academic_year'],['FK','subject_id']]}};
var FKE={section_id:'Section',subject_id:'Subject',student_id:'Student',faculty_id:'Faculty',calendar_id:'Academic_Calendar'};
var RELS=[['Section','Student','has'],['Section','Attendance','has'],['Student','Attendance','has'],['Faculty','Attendance','marks'],['Subject','Attendance','for'],['Academic_Calendar','Attendance','scheduled in'],['Subject','Faculty','taught by (Faculty.subject_id)'],['Subject','Academic_Calendar','linked to (Academic_Calendar.subject_id)']];
function counts(){return{Student:students.length,Faculty:faculty.length,Subject:subjects.length,Section:sections.length,Attendance:records.length,Academic_Calendar:events.length}}
function erLine(pts,a,b,la){
  var s='<polyline class="rel" points="'+pts.map(function(p){return p.join(',')}).join(' ')+'"/>',f=pts[0],l=pts[pts.length-1],fw=f[0]<l[0];
  s+='<text class="card-n" x="'+(f[0]+(fw?8:-8))+'" y="'+(f[1]-6)+'" text-anchor="'+(fw?'start':'end')+'">'+a+'</text>';
  s+='<text class="card-n" x="'+(l[0]+(fw?-8:8))+'" y="'+(l[1]-6)+'" text-anchor="'+(fw?'end':'start')+'">'+b+'</text>';
  var m=la[1];s+='<g class="pill"><rect x="'+(m[0]-34)+'" y="'+(m[1]-11)+'" width="68" height="20" rx="10"/><text x="'+m[0]+'" y="'+(m[1]+4)+'" text-anchor="middle">'+la[0]+'</text></g>';return s}
function renderER(){
  var s=erLine([[260,330],[490,330]],'1','N',['has',[375,330]])+erLine([[260,420],[150,420],[150,480]],'N','1',['belongs to',[150,450]])+
   erLine([[260,540],[380,540],[380,470],[490,470]],'1','N',['has',[380,505]])+erLine([[940,230],[835,230],[835,330],[730,330]],'1','N',['marks',[835,280]])+
   erLine([[610,136],[610,250]],'1','N',['for',[610,193]])+erLine([[610,600],[610,522]],'1','N',['scheduled in',[610,561]]);
  Object.keys(ER).forEach(function(n){var e=ER[n],h=34,r=24,H=h+e.f.length*r;
    s+='<g class="ent'+(state.ent===n?' sel':'')+'" data-ent="'+n+'" tabindex="0" role="button" aria-label="'+n+' table"><rect class="box" x="'+e.x+'" y="'+e.y+'" width="'+e.w+'" height="'+H+'" rx="8"/>'+
     '<path class="hd" d="M'+e.x+' '+(e.y+h)+'V'+(e.y+8)+'a8 8 0 0 1 8 -8H'+(e.x+e.w-8)+'a8 8 0 0 1 8 8V'+(e.y+h)+'z"/><text class="title" x="'+(e.x+e.w/2)+'" y="'+(e.y+22)+'" text-anchor="middle">'+n+'</text>';
    e.f.forEach(function(q,i){var y=e.y+h+i*r+16;
      s+='<text class="k '+(q[0]==='PK'?'pk':'fk')+'" x="'+(e.x+12)+'" y="'+y+'">'+q[0]+'</text><text class="col'+(q[0]==='PK'?' pk':'')+'" x="'+(e.x+40)+'" y="'+y+'">'+q[1]+'</text>';
      if(i)s+='<line class="sep" x1="'+e.x+'" x2="'+(e.x+e.w)+'" y1="'+(e.y+h+i*r)+'" y2="'+(e.y+h+i*r)+'"/>'});
    s+='</g>'});
  $('#erSvg').innerHTML=s;
  var e=ER[state.ent],rels=RELS.filter(function(r){return r[0]===state.ent||r[1]===state.ent});
  $('#erPanel').innerHTML='<div class="row" style="justify-content:space-between"><h3>'+state.ent+'</h3><span class="chip" style="--c:var(--accent)">'+counts()[state.ent]+' rows in demo</span></div>'+
   '<div class="tbl" style="margin-top:12px"><table style="min-width:0"><thead><tr><th>Column</th><th>Key</th><th>References</th></tr></thead><tbody>'+e.f.map(function(q){return '<tr><td style="font-family:var(--f-mono);font-size:.85rem">'+q[1]+'</td><td>'+(q[0]?'<span class="kb '+(q[0]==='PK'?'pk-b':'fk-b')+'">'+q[0]+'</span>':'')+'</td><td>'+(q[0]==='FK'?FKE[q[1]]:'')+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<h4 style="margin:16px 0 0;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--mut)">Relationships</h4><ul class="rels">'+rels.map(function(r){return '<li><b>'+r[0].replace('_',' ')+'</b> 1 → N <b>'+r[1].replace('_',' ')+'</b> <span class="muted">'+r[2]+'</span></li>'}).join('')+'</ul>'}
function sqlText(){
  var order=['Subject','Section','Faculty','Student','Academic_Calendar','Attendance'],dates=['date_of_birth','attendance_date','start_date','end_date'],ints=['age','experience','total_classes_held','attended_classes'];
  return order.map(function(n){var cols=ER[n].f.map(function(q){var c=q[1],t=dates.indexOf(c)>=0?'date':ints.indexOf(c)>=0?'integer':c==='attendance_percentage'?'numeric(5,2)':c==='pincode'?'char(6)':'text';
      if(c==='attendance_status')t="text check (attendance_status in ('Present','Absent'))";
      return '  '+c+' '+t+(q[0]==='PK'?' primary key':'')+(q[0]==='FK'?' references '+FKE[c].toLowerCase()+'('+c+')':'')});
    if(n==='Academic_Calendar')cols.splice(3,0,'  event_name text -- added for display; not in the diagram');
    return 'create table '+n.toLowerCase()+' (\n'+cols.join(',\n')+'\n);'}).join('\n\n')}
$('#erSvg').addEventListener('click',function(e){var g=e.target.closest('[data-ent]');if(g){state.ent=g.getAttribute('data-ent');renderER()}});
$('#erSvg').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var g=e.target.closest('[data-ent]');if(g){e.preventDefault();state.ent=g.getAttribute('data-ent');renderER()}}});
$('#copySql').addEventListener('click',function(){var txt=$('#sqlOut').textContent;
  function fb(){var r=document.createRange();r.selectNodeContents($('#sqlOut'));var s=window.getSelection();s.removeAllRanges();s.addRange(r);toast('Selected. Press Ctrl or Cmd + C to copy.')}
  try{navigator.clipboard.writeText(txt).then(function(){toast('Schema copied.')},fb)}catch(x){fb()}});

/* ---------- theme & routing ---------- */
$('#themeBtn').addEventListener('click',function(){var r=document.documentElement,cur=r.getAttribute('data-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');r.setAttribute('data-theme',cur==='dark'?'light':'dark')});
var VIEWS=['portal','flowchart','architecture','data-model'];
function route(){var v=location.hash.slice(1);if(VIEWS.indexOf(v)<0)v='portal';
  VIEWS.forEach(function(k){$('#v-'+k).hidden=k!==v});
  $$('nav a').forEach(function(a){if(a.getAttribute('data-v')===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(v==='data-model')renderER()}
window.addEventListener('hashchange',function(){route();window.scrollTo(0,0)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&state.pwm){state.pwm=null;renderPortal()}});
$('#sqlOut').textContent=sqlText();
renderPortal();renderFlow();renderArch();renderER();route();
})();
