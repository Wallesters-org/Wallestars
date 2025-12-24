const { chromium } = require('playwright');

let browser = null;

async function openChatGPT() {
  console.log('Launching browser...');
  
  // Launch browser
  browser = await chromium.launch({
    headless: false // Open visible browser window
  });
  
  console.log('Creating new page...');
  const page = await browser.newPage();
  
  console.log('Navigating to ChatGPT.com...');
  await page.goto('https://chatgpt.com', {
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  });
  
  console.log('Successfully opened ChatGPT.com!');
  console.log('Browser will remain open. Press Ctrl+C to close.');
  
  // Keep the browser open
  // User can close manually or press Ctrl+C
}

// Handle graceful shutdown
async function cleanup() {
  if (browser) {
    console.log('\nClosing browser...');
    await browser.close();
    console.log('Browser closed.');
  }
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run the function
openChatGPT().catch(error => {
  console.error('Error:', error);
  cleanup();
});
