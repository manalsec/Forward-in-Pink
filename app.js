
const FORM = 'https://forms.cloud.microsoft/r/5mVY7VFniV?origin=lprLink'
const app = document.querySelector('#app')

const quizQuestions = [
  {
    text:'سرطان الثدي يصيب النساء فقط',
    answer:false,
    feedback:'يمكن أن يصيب سرطان الثدي الرجال أيضًا لكن الغالبية العظمى من الحالات تحدث لدى النساء'
  },
  {
    text:'كل كتلة في الثدي تعني وجود سرطان',
    answer:false,
    feedback:'معظم كتل الثدي ليست سرطانية لكن ظهور كتلة أو تغير غير معتاد يستحق التقييم الطبي'
  },
  {
    text:'قد يحدث سرطان الثدي حتى دون وجود تاريخ عائلي معروف',
    answer:true,
    feedback:'صحيح فغياب التاريخ العائلي لا يعني انعدام احتمالية الإصابة'
  }
]

const myths = [
  {
    text:'وجود كتلة غير مؤلمة يعني أنها لا تحتاج إلى تقييم',
    answer:false,
    feedback:'شائعة فالتغير غير المعتاد يستحق التقييم الطبي حتى لو لم يكن مؤلمًا'
  },
  {
    text:'قد تكون تغيرات الجلد أو الحلمة من العلامات التي تستحق الانتباه',
    answer:true,
    feedback:'معلومة فهناك تغيرات متعددة قد تستحق الانتباه وليس وجود الكتلة وحده'
  },
  {
    text:'الكشف المبكر يساعد على تحسين فرص العلاج',
    answer:true,
    feedback:'معلومة فالتشخيص في مرحلة مبكرة يتيح بدء الرعاية والعلاج في وقت أبكر'
  }
]

const signs = [
  'كتلة أو سماكة غير معتادة',
  'تغير في حجم أو شكل الثدي',
  'تغير في الجلد مثل التنقّر أو الاحمرار',
  'تغير في مظهر الحلمة أو اتجاهها',
  'إفراز غير معتاد أو دموي من الحلمة'
]

let state = {stage:0,index:0,seenSigns:new Set()}

function metric(name, params={}){
  // نسخة محلية احتياطية للاختبار على نفس الجهاز
  try{
    const key='darbikMetrics'
    const d=JSON.parse(localStorage.getItem(key)||'{}')
    d[name]=(d[name]||0)+1
    localStorage.setItem(key,JSON.stringify(d))
  }catch(e){}

  // القياس المركزي الحقيقي عند إضافة معرّف GA4
  if(typeof window.gtag === 'function'){
    window.gtag('event', name, {
      experience_name:'darbik_wardi_2026',
      ...params
    })
  }
}

function markUniqueVisit(){
  try{
    if(!localStorage.getItem('darbikUniqueVisitor')){
      localStorage.setItem('darbikUniqueVisitor','1')
      metric('local_unique_visit')
    }
  }catch(e){}
}

function focusApp(){
  window.scrollTo({top:0,behavior:'smooth'})
  setTimeout(()=>app.focus({preventScroll:true}),120)
}

function progress(n){
  return `
    <div class="progress-wrap">
      <div class="progress-top"><span>دربك وردي</span><span>${n} من 5</span></div>
      <div class="progress">${[1,2,3,4,5].map(x=>`<i class="${x<=n?'on':''}"></i>`).join('')}</div>
    </div>`
}

function note(){
  return `<p class="notice">هذه التجربة للتوعية العامة ولا تستخدم للتشخيص ولا تغني عن استشارة المختصين</p>`
}

function sourceBadge(label='وزارة الصحة السعودية'){
  return `<a class="source-badge" href="https://www.moh.gov.sa/healthawareness/educationalcontent/diseases/cancer/pages/breastcancer.aspx" target="_blank" rel="noopener" aria-label="فتح المصدر الرسمي من وزارة الصحة السعودية">↗ المصدر | ${label}</a>`
}

function sources(){
  return `
    <section class="references" aria-labelledby="references-title">
      <div class="eyebrow">المصادر والمراجع</div>
      <h3 id="references-title">معلومات موثوقة من وزارة الصحة السعودية</h3>
      <p>يمكنك الرجوع للمصادر الرسمية وقراءة التفاصيل مباشرة</p>
      <div class="reference-list">
        <a href="https://www.moh.gov.sa/healthawareness/educationalcontent/diseases/cancer/pages/breastcancer.aspx" target="_blank" rel="noopener">
          <strong>مرض سرطان الثدي</strong>
          <span>الأعراض والتشخيص والمفاهيم الخاطئة والأسئلة الشائعة ↗</span>
        </a>
        <a href="https://www.moh.gov.sa/healthawareness/educationalcontent/wh/breast-cancer/pages/default.aspx" target="_blank" rel="noopener">
          <strong>التوعية بسرطان الثدي</strong>
          <span>الأعراض وأهمية الكشف المبكر بالماموغرام ↗</span>
        </a>
        <a href="https://www.moh.gov.sa/healthawareness/educationalcontent/wh/breast-cancer/pages/001.aspx" target="_blank" rel="noopener">
          <strong>أشعة الماموغرام</strong>
          <span>ما هو الماموغرام ولماذا يستخدم في الكشف المبكر ↗</span>
        </a>
      </div>
      <p class="reference-note">المحتوى داخل التجربة توعوي ومبسّط ولا يُعد تشخيصًا طبيًا</p>
    </section>`
}

function home(){
  state={stage:0,index:0,seenSigns:new Set()}
  app.innerHTML=`
    <section class="screen hero">
      <img src="darbik-wardi-logo-hq.png" class="official-campaign-logo" alt="دربك وردي Forward in Pink">
      <p class="intro">رحلة تفاعلية قصيرة للوعي بسرطان الثدي<br>كل خطوة وعي تقرّبنا من الاطمئنان</p>
      <button class="btn" onclick="startExperience()">ابدأ الدرب ←</button>
      <div class="hero-meta">
        <span class="pill">5 مراحل</span>
        <span class="pill">دقائق قليلة</span>
        <span class="pill">معلومة تستحق المشاركة</span>
      </div>
    </section>`
  focusApp()
}

function startExperience(){
  metric('experience_start')
  state.stage=1
  metric('stage_view',{stage_number:1,stage_name:'وش تعرف'})
  state.index=0
  renderQuiz()
}

function renderQuiz(){
  const x=quizQuestions[state.index]
  app.innerHTML=`
    <section class="screen">
      ${progress(1)}
      <div class="card">
        <div class="eyebrow">01 | وش تعرف؟</div>
        <h2>خلّنا نكتشف وش نعرف فعلًا</h2>
        <p class="lead">اختر صح أو خطأ وشوف المعلومة مباشرة</p>
        <div class="counter">السؤال ${state.index+1} من ${quizQuestions.length}</div>
        <div class="question">${x.text}</div>
        <div class="choices">
          <button class="choice" onclick="answerQuiz(true)">صح</button>
          <button class="choice" onclick="answerQuiz(false)">خطأ</button>
        </div>
        <div id="feedback" class="feedback hidden" aria-live="polite"></div>
        ${sourceBadge()}${note()}
      </div>
    </section>`
  focusApp()
}

function answerQuiz(value){
  const x=quizQuestions[state.index]
  document.querySelectorAll('.choice').forEach(b=>b.disabled=true)
  const f=document.querySelector('#feedback')
  f.classList.remove('hidden')
  f.innerHTML=`
    <strong>${value===x.answer?'أحسنت 🌷':'قريبة 💗'}</strong><br>
    ${x.feedback}
    <div class="actions">
      <button class="btn" onclick="nextQuiz()">${state.index===quizQuestions.length-1?'أكمل الدرب ←':'السؤال التالي ←'}</button>
    </div>`
}

function nextQuiz(){
  state.index++
  if(state.index<quizQuestions.length) renderQuiz()
  else renderSigns()
}

function renderSigns(){
  state.stage=2
  metric('stage_view',{stage_number:2,stage_name:'لاحظ التغيير'})
  state.seenSigns=new Set()
  app.innerHTML=`
    <section class="screen">
      ${progress(2)}
      <div class="card">
        <div class="eyebrow">02 | لاحظ التغيير</div>
        <h2>معرفة التغيرات جزء من الوعي</h2>
        <p class="lead">اضغط على البطاقات واكتشف تغيرات تستحق الانتباه</p>
        <div class="tags">
          ${signs.map((s,i)=>`<button class="tag" id="sign-${i}" onclick="seeSign(${i})">${s}</button>`).join('')}
        </div>
        <div id="sign-feedback" class="feedback hidden" aria-live="polite"></div>
        <div class="actions">
          <button id="sign-next" class="btn secondary" onclick="renderMyths()">أكمل الدرب ←</button>
        </div>
        ${sourceBadge()}${note()}
      </div>
    </section>`
  focusApp()
}

function seeSign(i){
  state.seenSigns.add(i)
  document.querySelector(`#sign-${i}`).classList.add('seen')

  const f = document.querySelector('#sign-feedback')
  f.classList.remove('hidden')

  f.innerHTML = state.seenSigns.size === signs.length
    ? `<strong>🌷 اكتشفت كل التغيّرات</strong><br>
       وجود أي تغيّر لا يعني بالضرورة وجود سرطان، وعند ملاحظة أي تغيّرات يُنصح بأخذ استشارة طبية 🩺`
    : `تغيّر لا يعني بالضرورة وجود سرطان لكنه يستحق الانتباه والتقييم عند الحاجة<br>
       تم اكتشاف ${state.seenSigns.size} من ${signs.length}`
}

function renderMyths(){
  state.stage=3
  metric('stage_view',{stage_number:3,stage_name:'معلومة أو شائعة'})
  state.index=0
  renderMythQuestion()
}

function renderMythQuestion(){
  const x=myths[state.index]
  app.innerHTML=`
    <section class="screen">
      ${progress(3)}
      <div class="card">
        <div class="eyebrow">03 | معلومة أو شائعة؟</div>
        <h2>الشائعة تتوقف عندك</h2>
        <p class="lead">اختر التصنيف الأقرب ثم اكتشف الحقيقة</p>
        <div class="counter">البطاقة ${state.index+1} من ${myths.length}</div>
        <div class="question">${x.text}</div>
        <div class="choices">
          <button class="choice" onclick="answerMyth(true)">معلومة</button>
          <button class="choice" onclick="answerMyth(false)">شائعة</button>
        </div>
        <div id="feedback" class="feedback hidden" aria-live="polite"></div>
        ${sourceBadge()}${note()}
      </div>
    </section>`
  focusApp()
}

function answerMyth(value){
  const x=myths[state.index]
  document.querySelectorAll('.choice').forEach(b=>b.disabled=true)
  const f=document.querySelector('#feedback')
  f.classList.remove('hidden')
  f.innerHTML=`
    <strong>${value===x.answer?'اختيار صحيح 🌷':'خلّنا نصححها معًا 💗'}</strong><br>
    ${x.feedback}
    <div class="actions">
      <button class="btn" onclick="nextMyth()">${state.index===myths.length-1?'التالي ←':'البطاقة التالية ←'}</button>
    </div>`
}

function nextMyth(){
  state.index++
  if(state.index<myths.length) renderMythQuestion()
  else renderAction()
}

function renderAction(){
  state.stage=4
  metric('stage_view',{stage_number:4,stage_name:'وش خطوتك'})
  app.innerHTML=`
    <section class="screen">
      ${progress(4)}
      <div class="card">
        <div class="eyebrow">04 | وش خطوتك؟</div>
        <h2>لاحظت تغيرًا جديدًا ومستمرًا</h2>
        <p class="lead">المعرفة تصبح أقوى عندما تتحول إلى خطوة مناسبة</p>
        <div class="question">وش التصرف الأنسب؟</div>
        <div class="choices">
          <button class="choice" onclick="answerAction(true)">أطلب المشورة الطبية</button>
          <button class="choice" onclick="answerAction(false)">أتجاهله ما دام ما يؤلمني</button>
        </div>
        <div id="feedback" class="feedback hidden" aria-live="polite"></div>
        ${sourceBadge()}${note()}
      </div>
    </section>`
  focusApp()
}

function answerAction(ok){
  document.querySelectorAll('.choice').forEach(b=>b.disabled=true)
  const f=document.querySelector('#feedback')
  f.classList.remove('hidden')
  f.innerHTML=`
    <strong>${ok?'اختيار واعٍ 🌷':'الأفضل عدم تجاهل التغير 💗'}</strong><br>
    التغير الجديد أو غير المعتاد يستحق التقييم الطبي حتى لو لم يكن مؤلمًا
    <div class="actions"><button class="btn" onclick="renderGift()">خذني للخطوة الأخيرة ←</button></div>`
}

function renderGift(){
  state.stage=5
  metric('stage_view',{stage_number:5,stage_name:'لمن تهدي الوعي'})
  app.innerHTML=`
    <section class="screen">
      ${progress(5)}
      <div class="card">
        <div class="eyebrow">05 | لمن تهدي الوعي؟</div>
        <h2>معلومة منك قد تصل لشخص تحبه</h2>
        <p class="lead">اختر الشخص الذي تتمنى أن تصل إليه رسالة الوعي</p>
        <div class="tags">
          ${['أمي','أختي','ابنتي','صديقتي','زوجتي','شخص عزيز','لنفسي'].map(x=>`<button class="tag" onclick="finish('${x}')">${x}</button>`).join('')}
        </div>
      </div>
    </section>`
  focusApp()
}

function finish(who){
  metric('experience_complete')
  app.innerHTML=`
    <section class="screen">
      <div class="card">
        <div class="share-card">
          <div class="badge-ribbon">🎀</div>
          <div class="eyebrow">دربك وردي 2026</div>
          <h2>شكرًا لمشاركتك</h2>
          <p>الوعي يبدأ بمعلومة وقد يمتد أثرها إلى ${who}</p>
          <strong>أكملت تجربة التوعية بسرطان الثدي</strong>
          <div class="college">الكلية التقنية الرقمية للبنات بتبوك</div>
        </div>

        <div class="evaluation">
          <div>
            <div class="eyebrow">قياس الأثر</div>
            <h2>ساعدنا نقيس أثر التجربة</h2>
            <p class="lead">رأيك يساعدنا نعرف أثر دربك وردي ونطور تجاربنا القادمة</p>
            <div class="actions">
              <a class="btn" href="${FORM}" target="_blank" rel="noopener" onclick="metric('evaluation_open')">قيّم تجربتك الآن ↗</a>
              <button class="btn secondary" onclick="home()">ابدأ من جديد</button>
            </div>
            <p class="notice">يمكن فتح نموذج التقييم مباشرة أو مسح رمز QR من جهاز آخر</p>
          </div>
          <div class="qr-wrap">
            <img class="qr" src="evaluation-qr.png" alt="رمز QR لفتح نموذج تقييم التجربة">
          </div>
        </div>
        ${sources()}
      </div>
    </section>`
  focusApp()
}

markUniqueVisit()
metric('site_view')
home()


// أداة فحص محلية للمطورة فقط
// يمكن كتابة darbikLocalMetrics() في Console أثناء الاختبار
window.darbikLocalMetrics = function(){
  try{
    return JSON.parse(localStorage.getItem('darbikMetrics') || '{}')
  }catch(e){
    return {}
  }
}
