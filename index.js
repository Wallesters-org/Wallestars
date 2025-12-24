const { chromium } = require('playwright');
const { AirtopClient } = require('@airtop/sdk');

let browser = null;
let airtopSession = null;
let airtopWindow = null;
let airtopClient = null;

async function openChatGPT() {
  console.log('Initializing Airtop client...');
  
  // Initialize Airtop client with API key from environment
  const apiKey = process.env.AIRTOP_API_KEY;
  if (!apiKey) {
    throw new Error('AIRTOP_API_KEY environment variable is required');
  }
  
  airtopClient = new AirtopClient({ apiKey });
  
  console.log('Creating Airtop session...');
  airtopSession = await airtopClient.sessions.create({
    configuration: {
      timeoutMinutes: 30
    }
  });
  console.log(`Session created: ${airtopSession.id}`);
  
  console.log('Creating Airtop window...');
  airtopWindow = await airtopClient.windows.create(airtopSession.id, {
    url: 'https://chatgpt.com'
  });
  console.log(`Window created: ${airtopWindow.id}`);
  console.log(`Live View URL: ${airtopWindow.liveViewUrl}`);
  
  console.log('Connecting Playwright to Airtop browser...');
  browser = await chromium.connectOverCDP(airtopWindow.cdpUrl);
  
  // Get the default context and first page
  const contexts = browser.contexts();
  if (contexts.length === 0) {
    throw new Error('No browser contexts available');
  }
  
  const pages = contexts[0].pages();
  if (pages.length === 0) {
    throw new Error('No pages available in browser context');
  }
  
  console.log('Successfully connected to Airtop browser!');
  console.log('ChatGPT.com is loading...');
  console.log(`You can view the browser at: ${airtopWindow.liveViewUrl}`);
  console.log('Browser will remain open. Press Ctrl+C to close.');
  
  // Keep the browser open
  // User can close manually or press Ctrl+C
}

// Handle graceful shutdown
async function cleanup() {
  try {
    if (browser) {
      console.log('\nClosing browser connection...');
      await browser.close();
      console.log('Browser connection closed.');
    }
    
    if (airtopWindow) {
      console.log('Closing Airtop window...');
      // Note: Window will be closed when session terminates
    }
    
    if (airtopSession && airtopSession.id && airtopClient) {
      console.log('Terminating Airtop session...');
      try {
        await airtopClient.sessions.terminate(airtopSession.id);
        console.log('Airtop session terminated.');
      } catch (sessionError) {
        console.error('Error terminating session:', sessionError.message);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
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
