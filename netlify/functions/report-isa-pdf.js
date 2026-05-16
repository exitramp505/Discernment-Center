const PDFDocument = require('pdfkit');
function safe(v){return String(v??'')}
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const data = JSON.parse(event.body || '{}');
    const candidate = data.candidate || {};
    const scores = data.scores || {};
    const doc = new PDFDocument({ size: 'LETTER', margin: 48 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    const done = new Promise(resolve => doc.on('end', resolve));
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#172033').text('Ministry Readiness Inventory Report');
    doc.moveDown(.4).fontSize(10).font('Helvetica').fillColor('#5b667a').text('Discernment Center candidate assessment summary');
    doc.moveDown(1);
    doc.roundedRect(48, doc.y, 500, 88, 12).fillAndStroke('#f8fafc','#dbe3ef');
    const y=doc.y+16;
    doc.fillColor('#172033').fontSize(14).font('Helvetica-Bold').text(safe(candidate.name),64,y);
    doc.fontSize(10).font('Helvetica').fillColor('#5b667a').text(`${safe(candidate.email)}  |  ${safe(candidate.phone)}`,64,y+22);
    doc.text(`${safe(candidate.state)} / ${safe(candidate.region)} Region`,64,y+38);
    doc.fillColor('#2a9d8f').fontSize(28).font('Helvetica-Bold').text(`${safe(scores.overall)}%`,430,y,{width:90,align:'center'});
    doc.fontSize(10).fillColor('#5b667a').text(safe(scores.overallLabel),430,y+34,{width:90,align:'center'});
    doc.y = y+92;
    doc.fillColor('#172033').fontSize(16).font('Helvetica-Bold').text('Readiness Profile');
    doc.moveDown(.3).fontSize(10).font('Helvetica').fillColor('#5b667a').text('This report summarizes practical ministry experience and leadership readiness across four areas. Candidate scores are compared with benchmark and median references from the ISA-style model.');
    doc.moveDown(.8);
    (scores.categories||[]).forEach(cat=>{
      if(doc.y>690) doc.addPage();
      const y0=doc.y;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#172033').text(safe(cat.name),48,y0,{width:160});
      doc.roundedRect(210,y0+2,230,10,5).fill('#e8edf5');
      doc.roundedRect(210,y0+2,Math.max(4,230*(Number(cat.score)||0)/100),10,5).fill('#2a9d8f');
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#172033').text(`${safe(cat.score)}%`,455,y0-1,{width:45,align:'right'});
      doc.fontSize(8).font('Helvetica').fillColor('#5b667a').text(`Benchmark: ${safe(cat.benchmark)}%   Median: ${safe(cat.median)}%`,210,y0+18);
      doc.y=y0+40;
    });
    doc.moveDown(.8).fontSize(16).font('Helvetica-Bold').fillColor('#172033').text('Category Descriptions');
    doc.moveDown(.5);
    (scores.categories||[]).forEach(cat=>{
      if(doc.y>650) doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#172033').text(`${safe(cat.name)} — ${safe(cat.score)}% (${safe(cat.label)})`);
      doc.fontSize(10).font('Helvetica').fillColor('#475569').text(safe(cat.description),{lineGap:2});
      doc.moveDown(.8);
    });
    doc.end(); await done;
    const buffer = Buffer.concat(chunks);
    return { statusCode:200, headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="ministry-readiness-report.pdf"'}, body:buffer.toString('base64'), isBase64Encoded:true };
  } catch(e) { return { statusCode:500, body:e.message||'Could not generate PDF' }; }
};
