// Quick verification script - run in browser console on localhost:5173

console.log('=== SwipeSleuth Setup Verification ===\n');

// Check 1: Extension API
if (window.swipesleuthAPI) {
  console.log('✅ Extension API is available');
  console.log('   Methods:', Object.keys(window.swipesleuthAPI));
} else {
  console.log('❌ Extension API not found');
  console.log('   Make sure:');
  console.log('   1. Extension is installed and enabled');
  console.log('   2. Page is loaded at http://localhost:5173');
  console.log('   3. Content script has injected');
}

// Check 2: Test API call
if (window.swipesleuthAPI) {
  console.log('\n📡 Testing API call...');
  window.swipesleuthAPI.requestExamples()
    .then(examples => {
      console.log('✅ API call successful!');
      console.log(`   Received ${examples.length} examples`);
      if (examples.length > 0) {
        console.log('   First example:', examples[0].title);
      }
    })
    .catch(error => {
      console.log('❌ API call failed:', error.message);
      console.log('   Check extension service worker');
    });
}

// Check 3: Content Script
setTimeout(() => {
  const scripts = Array.from(document.scripts);
  const hasContentScript = scripts.some(s => s.textContent.includes('swipesleuthAPI'));
  if (hasContentScript) {
    console.log('\n✅ Content script detected');
  } else {
    console.log('\n⚠️  Content script injection not detected');
    console.log('   This might be normal if script already ran');
  }
}, 1000);

console.log('\n=== Verification Complete ===');
console.log('Check the messages above for any issues.');

