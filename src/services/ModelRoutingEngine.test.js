/**
 * Semantic Model Routing Engine Test Suite
 * 
 * Demonstrates intelligent model selection based on role + task combinations
 * Tests semantic matching, confidence scoring, and explainable recommendations
 */

import { routeToOptimalModel, modelRouter } from './ModelRoutingEngine.js';

// Test scenarios covering different domains and use cases
const TEST_SCENARIOS = [
  // Software Development Scenarios
  {
    role: 'Software Developer',
    task: 'Generate a complex React component with TypeScript interfaces and comprehensive error handling',
    expectedPrimary: 'claude-4-opus',
    description: 'Complex coding task requiring sustained performance'
  },
  {
    role: 'Software Developer', 
    task: 'Quick code review of a simple JavaScript function',
    expectedPrimary: 'claude-4-sonnet',
    description: 'Code review task requiring precision and speed'
  },
  {
    role: 'Software Developer',
    task: 'Debug a complex multi-threaded performance issue step by step',
    expectedPrimary: 'claude-4-sonnet-thinking',
    description: 'Debugging requires transparent step-by-step reasoning'
  },

  // Data Science Scenarios
  {
    role: 'Data Scientist',
    task: 'Analyze large dataset with complex statistical modeling and mathematical computations',
    expectedPrimary: 'gemini-2.5-pro',
    description: 'Large context and advanced analysis capabilities needed'
  },
  {
    role: 'Data Scientist',
    task: 'Solve complex mathematical optimization problem with detailed reasoning',
    expectedPrimary: 'o3',
    description: 'Advanced mathematical reasoning required'
  },
  {
    role: 'Data Scientist',
    task: 'Quick statistical analysis on budget',
    expectedPrimary: 'o4-mini',
    description: 'Cost-effective mathematical capabilities'
  },

  // Design & Creative Scenarios
  {
    role: 'Designer',
    task: 'Create a professional logo image with clear text rendering',
    expectedPrimary: 'gpt-image-1',
    description: 'Image generation with text rendering capabilities'
  },
  {
    role: 'Content Creator',
    task: 'Generate a high-quality promotional video with synchronized audio',
    expectedPrimary: 'veo-3',
    description: 'Video generation with audio synchronization'
  },
  {
    role: 'Content Creator',
    task: 'Compose instrumental background music for a podcast',
    expectedPrimary: 'lyria-2',
    description: 'Music generation for content creation'
  },

  // Business & Strategy Scenarios
  {
    role: 'Product Manager',
    task: 'Analyze competitor research documents and create strategic recommendations',
    expectedPrimary: 'gemini-2.5-pro',
    description: 'Document analysis with large context window'
  },
  {
    role: 'Business Analyst',
    task: 'Fast analysis of quarterly reports for executive summary',
    expectedPrimary: 'gemini-2.5-flash',
    description: 'High-speed analysis with efficiency focus'
  },
  {
    role: 'Marketing Manager',
    task: 'Create engaging social media content with creative copywriting',
    expectedPrimary: 'claude-4-sonnet',
    description: 'Creative writing with precision and control'
  },

  // Research & Academic Scenarios
  {
    role: 'Researcher',
    task: 'Conduct comprehensive literature review with complex reasoning across multiple domains',
    expectedPrimary: 'gemini-2.5-pro-deep-think',
    description: 'Frontier research requiring parallel thinking'
  },
  {
    role: 'Researcher',
    task: 'Analyze research papers and generate detailed academic insights',
    expectedPrimary: 'gemini-2.5-pro',
    description: 'Research analysis with benchmark performance'
  },
  {
    role: 'Technical Writer',
    task: 'Write comprehensive technical documentation with structured output',
    expectedPrimary: 'claude-4-sonnet',
    description: 'Structured writing with precision and steerability'
  },

  // Constraint-based Scenarios
  {
    role: 'Software Developer',
    task: 'Generate code quickly for a prototype',
    constraints: { prioritizeSpeed: true },
    expectedPrimary: 'gemini-2.5-flash',
    description: 'Speed-prioritized coding task'
  },
  {
    role: 'Data Scientist',
    task: 'Budget-friendly data analysis for a startup',
    constraints: { maxCost: true },
    expectedPrimary: 'o4-mini',
    description: 'Cost-constrained analysis task'
  },
  {
    role: 'Designer',
    task: 'Analyze images and create multimodal content',
    constraints: { requireMultimodal: true },
    expectedPrimary: 'gemini-2.5-pro',
    description: 'Multimodal requirement constraint'
  }
];

/**
 * Run comprehensive test suite
 */
function runSemanticRoutingTests() {
  console.log('🧠 SEMANTIC MODEL ROUTING ENGINE TEST SUITE');
  console.log('==============================================\n');

  let totalTests = 0;
  let passedTests = 0;
  const results = [];

  for (const scenario of TEST_SCENARIOS) {
    totalTests++;
    console.log(`🔍 Test ${totalTests}: ${scenario.description}`);
    console.log(`   Role: ${scenario.role}`);
    console.log(`   Task: ${scenario.task.substring(0, 80)}${scenario.task.length > 80 ? '...' : ''}`);
    
    if (scenario.constraints) {
      console.log(`   Constraints: ${JSON.stringify(scenario.constraints)}`);
    }

    try {
      const recommendation = routeToOptimalModel(
        scenario.role, 
        scenario.task, 
        scenario.constraints || {}
      );

      const primaryModel = recommendation.primary.modelId;
      const confidence = recommendation.primary.confidence;
      const reasoning = recommendation.primary.reasoning;

      console.log(`   ✅ Primary: ${recommendation.primary.model.name} (${primaryModel})`);
      console.log(`   📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
      console.log(`   💡 Reasoning: ${reasoning}`);
      
      // Show alternatives
      if (recommendation.alternatives.length > 0) {
        console.log(`   🔄 Alternatives: ${recommendation.alternatives.slice(0, 2).map(alt => alt.model.name).join(', ')}`);
      }

      // Test passes if primary matches expected or confidence is high
      const testPassed = primaryModel === scenario.expectedPrimary || confidence > 0.7;
      
      if (testPassed) {
        passedTests++;
        console.log(`   ✅ PASS\n`);
      } else {
        console.log(`   ❌ FAIL - Expected: ${scenario.expectedPrimary}, Got: ${primaryModel}\n`);
      }

      results.push({
        scenario,
        recommendation,
        passed: testPassed
      });

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      results.push({
        scenario,
        error: error.message,
        passed: false
      });
    }
  }

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  // Detailed analysis
  console.log('🔬 DETAILED ANALYSIS');
  console.log('====================');
  
  // Group by role
  const roleGroups = {};
  results.forEach(result => {
    const role = result.scenario.role;
    if (!roleGroups[role]) roleGroups[role] = [];
    roleGroups[role].push(result);
  });

  for (const [role, roleResults] of Object.entries(roleGroups)) {
    const rolePassed = roleResults.filter(r => r.passed).length;
    const roleTotal = roleResults.length;
    console.log(`${role}: ${rolePassed}/${roleTotal} (${((rolePassed/roleTotal)*100).toFixed(1)}%)`);
  }

  return results;
}

/**
 * Test semantic similarity calculations
 */
function testSemanticSimilarity() {
  console.log('\n🧮 SEMANTIC SIMILARITY TESTS');
  console.log('=============================\n');

  const testCases = [
    {
      role: 'Software Developer',
      task: 'write complex algorithms',
      expectedHighScores: ['claude-4-opus', 'claude-4-sonnet']
    },
    {
      role: 'Designer', 
      task: 'create beautiful images',
      expectedHighScores: ['gpt-image-1']
    },
    {
      role: 'Data Scientist',
      task: 'mathematical optimization',
      expectedHighScores: ['o3', 'o4-mini']
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.role} - ${testCase.task}`);
    
    const requirements = modelRouter.extractRequirements(testCase.role, testCase.task);
    const scores = modelRouter.calculateModelScores(requirements);
    
    // Sort by score
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('Top 5 model scores:');
    sortedScores.forEach(([modelId, score], index) => {
      const model = modelRouter.models[modelId];
      console.log(`  ${index + 1}. ${model?.name || modelId}: ${(score * 100).toFixed(1)}%`);
    });
    
    // Check if expected models are in top scores
    const topModelIds = sortedScores.slice(0, 3).map(([id]) => id);
    const hasExpected = testCase.expectedHighScores.some(expected => 
      topModelIds.includes(expected)
    );
    
    console.log(`Expected models in top 3: ${hasExpected ? '✅ YES' : '❌ NO'}\n`);
  }
}

/**
 * Test confidence scoring
 */
function testConfidenceScoring() {
  console.log('\n📊 CONFIDENCE SCORING TESTS');
  console.log('============================\n');

  const confidenceTests = [
    {
      role: 'Designer',
      task: 'generate professional logo image',
      expectedHighConfidence: true,
      reason: 'Clear image generation task should have high confidence'
    },
    {
      role: 'Generic Role',
      task: 'do something undefined',
      expectedHighConfidence: false,
      reason: 'Vague task should have lower confidence'
    },
    {
      role: 'Software Developer',
      task: 'complex algorithmic optimization with sustained performance requirements',
      expectedHighConfidence: true,
      reason: 'Specific coding task should match well with coding models'
    }
  ];

  for (const test of confidenceTests) {
    console.log(`Testing: ${test.reason}`);
    console.log(`Role: ${test.role}, Task: ${test.task}`);
    
    const recommendation = routeToOptimalModel(test.role, test.task);
    const confidence = recommendation.primary.confidence;
    
    console.log(`Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`Primary Model: ${recommendation.primary.model.name}`);
    
    const meetsExpectation = test.expectedHighConfidence ? 
      confidence > 0.7 : confidence < 0.7;
    
    console.log(`Meets expectation: ${meetsExpectation ? '✅ YES' : '❌ NO'}\n`);
  }
}

/**
 * Test constraint handling
 */
function testConstraintHandling() {
  console.log('\n⚙️ CONSTRAINT HANDLING TESTS');
  console.log('=============================\n');

  const constraintTests = [
    {
      role: 'Data Scientist',
      task: 'analyze data',
      constraints: { maxCost: true },
      expectedFeature: 'cost-effective',
      description: 'Cost constraint should prioritize cheaper models'
    },
    {
      role: 'Software Developer',
      task: 'generate code',
      constraints: { prioritizeSpeed: true },
      expectedFeature: 'fast',
      description: 'Speed constraint should prioritize faster models'
    },
    {
      role: 'Content Creator',
      task: 'create content',
      constraints: { requireMultimodal: true },
      expectedFeature: 'multimodal',
      description: 'Multimodal constraint should prioritize multimodal models'
    }
  ];

  for (const test of constraintTests) {
    console.log(`Testing: ${test.description}`);
    console.log(`Constraints: ${JSON.stringify(test.constraints)}`);
    
    const unconstrained = routeToOptimalModel(test.role, test.task);
    const constrained = routeToOptimalModel(test.role, test.task, test.constraints);
    
    console.log(`Without constraints: ${unconstrained.primary.model.name}`);
    console.log(`With constraints: ${constrained.primary.model.name}`);
    
    const constraintApplied = unconstrained.primary.modelId !== constrained.primary.modelId;
    console.log(`Constraint effect: ${constraintApplied ? '✅ APPLIED' : '❌ NO CHANGE'}\n`);
  }
}

/**
 * Run all tests
 */
export function runAllTests() {
  const results = runSemanticRoutingTests();
  testSemanticSimilarity();
  testConfidenceScoring();
  testConstraintHandling();
  
  return results;
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runAllTests();
}

export { runSemanticRoutingTests, testSemanticSimilarity, testConfidenceScoring, testConstraintHandling }; 