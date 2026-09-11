/**
 * Manual test script for AIVerificationService (Google Gemini AI)
 * Usage: node src/services/aiVerificationService.test-manual.js [imagePath] [questType]
 * 
 * Example:
 * node src/services/aiVerificationService.test-manual.js ./sample-bill.jpg electricity
 * node src/services/aiVerificationService.test-manual.js ./start-bike.jpg cycling ./end-bike.jpg
 * node src/services/aiVerificationService.test-manual.js ./plant.jpg plant_care
 * node src/services/aiVerificationService.test-manual.js ./bus.jpg public_transport
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const aiVerificationService = require('./aiVerificationService');

async function runManualTest() {
  const args = process.argv.slice(2);
  const imagePath = args[0] || './sample-image.jpg';
  const questType = args[1] || 'electricity';
  const secondImagePath = args[2] || imagePath;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  console.log('==================================================');
  console.log('🤖 AI Verification Service (Gemini AI) - Manual Test Runner');
  console.log(`📷 Primary Image Path: ${imagePath}`);
  console.log(`🎯 Quest Type: ${questType}`);
  if (questType === 'cycling') {
    console.log(`📷 Secondary Image Path: ${secondImagePath}`);
  }
  console.log(`🔑 GEMINI_API_KEY configured: ${apiKey ? 'YES (Key present)' : 'NO (Key missing)'}`);
  console.log('==================================================\n');

  let result;

  switch (questType) {
    case 'electricity':
      console.log('▶ Executing extractElectricityBill()...');
      result = await aiVerificationService.extractElectricityBill(imagePath);
      break;

    case 'cycling':
      console.log('▶ Executing verifyBicycleConsistency()...');
      result = await aiVerificationService.verifyBicycleConsistency(imagePath, secondImagePath);
      break;

    case 'plant_care':
      console.log('▶ Executing verifyPlantCareAction()...');
      result = await aiVerificationService.verifyPlantCareAction(imagePath);
      break;

    case 'public_transport':
      console.log('▶ Executing verifyTransportContext()...');
      result = await aiVerificationService.verifyTransportContext(imagePath);
      break;

    default:
      console.log(`Unknown quest type "${questType}". Running all 4 checks as sanity test...`);
      result = {
        electricity: await aiVerificationService.extractElectricityBill(imagePath),
        cycling: await aiVerificationService.verifyBicycleConsistency(imagePath, secondImagePath),
        plantCare: await aiVerificationService.verifyPlantCareAction(imagePath),
        publicTransport: await aiVerificationService.verifyTransportContext(imagePath)
      };
      break;
  }

  console.log('\n📥 RESULT OUTPUT:');
  console.log(JSON.stringify(result, null, 2));
  console.log('==================================================');
}

runManualTest();
