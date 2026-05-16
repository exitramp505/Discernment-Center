const PDFDocument = require('pdfkit');

function safe(v){ return String(v ?? ''); }
function num(v){ return Number(v) || 0; }
function labelFor(p){ if(p>=85)return 'Very Strong'; if(p>=70)return 'Strong'; if(p>=50)return 'Developing'; return 'Needs Development'; }
function groupName(g){ return ({P:'Church Planting',E:'Entrepreneurial Leadership',M:'Ministry Experience',R:'Relational Evangelism'}[g] || g || ''); }
function overallColor(v){ if(v >= 85) return '#6c9f3f'; if(v >= 70) return '#9bbf2f'; if(v >= 50) return '#e0b83e'; return '#b44b4b'; }
function categoryColor(v){ if(v >= 70) return '#34d848'; if(v >= 50) return '#f3d421'; return '#e21d2f'; }
function wrapText(text, max){ const s=safe(text); return s.length>max ? s.slice(0,max-3)+'...' : s; }

function drawFooter(doc, page, title){
  const y = 724;
  doc.font('Helvetica').fontSize(8).fillColor('#7b8494').text(title || 'Ministry Readiness Inventory Report', 48, y, {width:360});
  doc.text(`Page ${page}`, 500, y, {width:60, align:'right'});
}

function drawLogo(doc){
  doc.roundedRect(48, 42, 76, 34, 6).fill('#eaf5df');
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#79b943').text('DC', 58, 49);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#334155').text('DISCERNMENT', 128, 47);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#334155').text('CENTER', 128, 60);
}

function drawHeader(doc, candidate, scores){
  drawLogo(doc);
  doc.font('Helvetica-Bold').fontSize(24).fillColor('#1e88c9').text(`${safe(candidate.name || 'Candidate')} ISA-Style Score`, 48, 108, {width:500});
  doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Completed: ${new Date().toLocaleString()}`, 48, 140);

  const overall = num(scores.overall);
  const c = overallColor(overall);
  doc.roundedRect(48, 180, 492, 58, 0).fill('#f5f7ed');
  doc.rect(48, 180, 92, 58).fill('#fff7df');
  doc.font('Helvetica').fontSize(33).fillColor('#000000').text(`${overall}%`, 56, 191, {width:72, align:'center'});

  // simple human figure echoing the ISA report visual
  doc.circle(156, 190, 7).fill(c);
  doc.roundedRect(149, 199, 14, 32, 6).fill(c);
  doc.rect(147, 231, 7, 18).fill(c);
  doc.rect(158, 231, 7, 18).fill(c);
  doc.rect(136, 203, 12, 6).fill(c);
  doc.rect(164, 203, 12, 6).fill(c);

  const cats = scores.categories || [];
  const x0 = 195;
  const w = 82;
  cats.forEach((cat, i)=>{
    const x = x0 + (i*w);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#111827').text(wrapText(cat.name, 24), x, 191, {width:w-4, align:'center'});
    doc.circle(x+16, 218, 4).fill(categoryColor(num(cat.score)));
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#374151').text(`${cat.score}%`, x+24, 214, {width:40});
  });
  doc.rect(48, 248, 92, 14).fill('#fff7df');
}

function drawComparisonChart(doc, scores){
  const cats = scores.categories || [];
  const tableX=48, tableY=306;
  const widths = [88, 102, 102, 102, 102];
  const headers = ['Profiles', ...cats.map(c=>c.name)];
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1f334f').text('Comparison Chart', tableX, 282);

  // Header
  let x = tableX;
  headers.forEach((h,i)=>{ doc.rect(x, tableY, widths[i], 30).fill('#404040'); doc.font('Helvetica-Bold').fontSize(7.5).fillColor('white').text(h, x+5, tableY+8, {width:widths[i]-10}); x += widths[i]; });

  const rows = [
    {name:'Planter', key:'score', bg:'#f8f8f8'},
    {name:'Benchmark', key:'benchmark', bg:'#ffffff'},
    {name:'Median', key:'median', bg:'#eeeeee'}
  ];
  rows.forEach((row,ri)=>{
    const y = tableY + 30 + (ri*24);
    doc.rect(tableX, y, widths.reduce((a,b)=>a+b,0), 24).fill(row.bg);
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(row.name, tableX+5, y+8, {width:78});
    cats.forEach((cat,ci)=>{
      const val = num(row.key==='score' ? cat.score : cat[row.key]);
      const xbar = tableX + widths[0] + (ci*102) + 6;
      const ybar = y + 9;
      doc.rect(xbar, ybar, 64, 6).fill('#e5e7eb');
      doc.rect(xbar, ybar, Math.max(2, 64*val/100), 6).fill(categoryColor(val));
      doc.font('Helvetica').fontSize(7).fillColor('#374151').text(`${val}%`, xbar+68, y+7, {width:25});
    });
  });
}

function drawIntroNotes(doc, scores){
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1f334f').text('Readiness Snapshot', 48, 415);
  doc.font('Helvetica').fontSize(9.5).fillColor('#475569').text('This report summarizes practical ministry readiness across four areas: church planting exposure, entrepreneurial leadership, ministry experience, and relational evangelism. Scores are shown against benchmark and median reference points so reviewers can quickly see where the candidate is above, near, or below the model.', 48, 436, {width:500, lineGap:2});
}

function drawCategoryDescriptions(doc, scores, pageRef){
  let y = 468;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1f334f').text('Category Interpretation', 48, y);
  y += 22;
  (scores.categories||[]).forEach((cat)=>{
    if(y > 680){ doc.addPage(); pageRef.page++; drawFooter(doc, pageRef.page, 'Ministry Readiness Inventory Report'); y=60; }
    const c = categoryColor(num(cat.score));
    doc.roundedRect(48, y, 492, 54, 8).fillAndStroke('#ffffff','#d6dde8');
    doc.rect(48, y, 6, 54).fill(c);
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#111827').text(`${cat.name} - ${cat.score}% (${cat.label || labelFor(num(cat.score))})`, 64, y+12, {width:290});
    doc.font('Helvetica').fontSize(7.7).fillColor('#475569').text(wrapText(safe(cat.description), 145), 64, y+28, {width:350, lineGap:0});
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#334155').text(`Benchmark ${cat.benchmark}%`, 438, y+16, {width:80, align:'right'});
    doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text(`Median ${cat.median}%`, 438, y+30, {width:80, align:'right'});
    y += 61;
  });
}

function normalizeAnswers(answers){
  const list = Object.keys(answers||{}).map(k=>({id:Number(k), ...(answers[k]||{})})).filter(x=>x.id);
  list.sort((a,b)=>a.id-b.id);
  return list;
}

function drawInDepthTable(doc, answers, pageRef, startY){
  const rows = normalizeAnswers(answers);
  let y = startY || 48;
  if(!startY){ doc.addPage(); pageRef.page++; drawFooter(doc, pageRef.page, 'Ministry Readiness Inventory Report'); }
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1f334f').text('ISA in Depth', 48, y);
  y += 24;

  const drawTableHeader = () => {
    doc.rect(48, y, 36, 22).fill('#404040');
    doc.rect(84, y, 338, 22).fill('#404040');
    doc.rect(422, y, 72, 22).fill('#404040');
    doc.rect(494, y, 46, 22).fill('#404040');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('white').text('No.',54,y+7,{width:24});
    doc.text('Question',90,y+7,{width:320});
    doc.text('Answer',428,y+7,{width:60});
    doc.text('Group',500,y+7,{width:34});
    y += 22;
  };
  drawTableHeader();

  rows.forEach((r,idx)=>{
    const q = safe(r.question);
    const rowH = Math.max(28, doc.heightOfString(q, {width:318}) + 12);
    if(y + rowH > 730){ doc.addPage(); pageRef.page++; drawFooter(doc, pageRef.page, 'Ministry Readiness Inventory Report'); y=48; drawTableHeader(); }
    doc.rect(48,y,492,rowH).fill(idx%2?'#eeeeee':'#f8f8f8');
    doc.strokeColor('#d1d5db').lineWidth(.5).moveTo(84,y).lineTo(84,y+rowH).stroke();
    doc.moveTo(422,y).lineTo(422,y+rowH).stroke();
    doc.moveTo(494,y).lineTo(494,y+rowH).stroke();
    doc.font('Helvetica').fontSize(7.4).fillColor('#374151').text(String(r.id),54,y+8,{width:24});
    doc.text(q,90,y+7,{width:318,lineGap:1});
    doc.text(safe(r.answer),428,y+7,{width:60});
    doc.text(safe(r.group),507,y+7,{width:22,align:'center'});
    y += rowH;
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const data = JSON.parse(event.body || '{}');
    const candidate = data.candidate || {};
    const scores = data.scores || {};
    const answers = data.answers || {};
    const doc = new PDFDocument({ size: 'LETTER', margin: 48, bufferPages:false });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    const done = new Promise(resolve => doc.on('end', resolve));
    const pageRef = {page:1};

    drawHeader(doc, candidate, scores);
    drawComparisonChart(doc, scores);
    drawInDepthTable(doc, answers, pageRef, 430);
    drawFooter(doc, pageRef.page, 'Ministry Readiness Inventory Report');

    doc.end();
    await done;
    const buffer = Buffer.concat(chunks);
    return { statusCode:200, headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="ministry-readiness-report.pdf"'}, body:buffer.toString('base64'), isBase64Encoded:true };
  } catch(e) { return { statusCode:500, headers:{'Content-Type':'application/json'}, body:JSON.stringify({error:e.message||'Could not generate PDF'}) }; }
};
