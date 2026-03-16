const fs = require('fs');
const { marked } = require('marked');
const HTMLtoDOCX = require('html-to-docx');

async function convert() {
  try {
    const markdown = fs.readFileSync('Log_Analytics_Documentation.md', 'utf8');
    const html = marked.parse(markdown);
    
    // Convert HTML to DOCX
    const docx = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
    
    fs.writeFileSync('Log_Analytics_Documentation.docx', docx);
    console.log('✅ Successfully created Log_Analytics_Documentation.docx');
  } catch (err) {
    console.error('Error generating DOCX:', err);
  }
}

convert();
