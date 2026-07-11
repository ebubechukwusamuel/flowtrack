state.page = context.pages()[0];
await state.page.goto('https://supabase.com/dashboard/project/bdnpxugxdigtjgsdtdud/database/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log('URL:', state.page.url());
await new Promise(r => setTimeout(r, 5000));
try {
  const connString = await state.page.evaluate(() => {
    const els = document.querySelectorAll('*');
    for (const el of els) {
      if (el.textContent && el.textContent.includes('postgresql://')) {
        return el.textContent;
      }
    }
    return null;
  });
  if (connString) {
    const match = connString.match(/postgresql:\/\/[^\s"']+/);
    console.log('FOUND:', match ? match[0] : 'no match');
    console.log('Full text:', connString.substring(0, 500));
  } else {
    console.log('Connection string not found in DOM');
    console.log('Page title:', document.title);
    const text = document.body.innerText;
    console.log('Body text (first 2000 chars):', text.substring(0, 2000));
  }
} catch (e) {
  console.log('Error:', e.message);
}
