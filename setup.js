#!/usr/bin/env node
// setup.js - Setup script for Future Foundations

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const REQUIRED_PACKAGES = [
  '@netlify/neon'
];

async function setupProject() {
  console.log('🚀 Setting up Future Foundations ecosystem...\n');
  
  try {
    // 1. Check if we're in a Netlify project
    await checkNetlifySetup();
    
    // 2. Install required packages
    await installPackages();
    
    // 3. Create directory structure
    await createDirectoryStructure();
    
    // 4. Create configuration files
    await createConfigFiles();
    
    // 5. Set up database
    await setupDatabase();
    
    console.log('\n✅ Future Foundations setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: netlify dev');
    console.log('2. Visit: http://localhost:8888/api/health');
    console.log('3. Start building your agency-preserving AI systems!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function checkNetlifySetup() {
  console.log('📋 Checking Netlify setup...');
  
  try {
    // Check if netlify CLI is available
    execSync('netlify --version', { stdio: 'ignore' });
    console.log('✓ Netlify CLI found');
    
    // Check if site is linked
    try {
      const siteInfo = execSync('netlify status', { encoding: 'utf8' });
      if (siteInfo.includes('Not linked')) {
        console.log('⚠️  Site not linked to Netlify. Run "netlify link" first.');
        process.exit(1);
      }
      console.log('✓ Site linked to Netlify');
    } catch {
      console.log('⚠️  Unable to check site status. Make sure you\'re logged in: netlify login');
    }
    
  } catch {
    console.log('❌ Netlify CLI not found. Install it first: npm install -g netlify-cli');
    process.exit(1);
  }
}

async function installPackages() {
  console.log('\n📦 Installing required packages...');
  
  for (const pkg of REQUIRED_PACKAGES) {
    try {
      console.log(`Installing ${pkg}...`);
      execSync(`npm install ${pkg}`, { stdio: 'inherit' });
      console.log(`✓ ${pkg} installed`);
    } catch (error) {
      throw new Error(`Failed to install ${pkg}: ${error.message}`);
    }
  }
}

async function createDirectoryStructure() {
  console.log('\n📁 Creating directory structure...');
  
  const dirs = [
    'netlify/functions',
    'utils',
    'scripts',
    'public',
    'src/components',
    'src/pages',
    'src/services'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✓ Created ${dir}/`);
  }
}

async function createConfigFiles() {
  console.log('\n⚙️  Creating configuration files...');
  
  // Package.json scripts
  const packageJsonPath = 'package.json';
  let packageJson = {};
  
  try {
    const packageContent = await fs.readFile(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageContent);
  } catch {
    packageJson = { name: 'future-foundations', version: '1.0.0' };
  }
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'dev': 'netlify dev',
    'build': 'netlify build',
    'db:migrate': 'node scripts/migrate.js',
    'db:setup': 'npm run db:migrate'
  };
  
  packageJson.type = 'module';
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✓ Updated package.json');
  
  // Netlify.toml
  const netlifyToml = `[build]
  functions = "netlify/functions"
  
[functions]
  node_bundler = "esbuild"
  
[[plugins]]
  package = "@netlify/plugin-functions-core"`;
  
  await fs.writeFile('netlify.toml', netlifyToml);
  console.log('✓ Created netlify.toml');
  
  // .gitignore
  const gitignore = `# Dependencies
node_modules/

# Netlify
.netlify/

# Environment variables
.env
.env.local

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Build outputs
dist/
build/`;
  
  await fs.writeFile('.gitignore', gitignore);
  console.log('✓ Created .gitignore');
  
  // Environment example
  const envExample = `# Netlify will automatically provide these when using Netlify DB
NETLIFY_DATABASE_URL=postgresql://...

# Optional: Custom configuration
FUTURE_FOUNDATIONS_ENV=development
AGENCY_PRESERVATION_THRESHOLD=7.0
MANIPULATION_RISK_THRESHOLD=3.0`;
  
  await fs.writeFile('.env.example', envExample);
  console.log('✓ Created .env.example');
}

async function setupDatabase() {
  console.log('\n💾 Setting up database...');
  
  try {
    // Try to run migration
    console.log('Running database migration...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✓ Database migration completed');
  } catch (error) {
    console.log('⚠️  Database migration failed. You may need to run it manually after starting netlify dev');
    console.log('   Command: npm run db:migrate');
  }
}

// Create a simple index.html for testing
async function createIndexHtml() {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Future Foundations</title>
    <style>
        body { 
            font-family: system-ui, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem; 
            line-height: 1.6; 
        }
        .status { padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .loading { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .project-card { 
            border: 1px solid #e0e0e0; 
            border-radius: 0.5rem; 
            padding: 1.5rem; 
            margin: 1rem 0; 
            background: #fafafa; 
        }
        .metric { 
            display: inline-block; 
            background: #007bff; 
            color: white; 
            padding: 0.25rem 0.5rem; 
            border-radius: 0.25rem; 
            margin: 0.25rem; 
            font-size: 0.875rem; 
        }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 0.5rem 1rem; 
            border-radius: 0.25rem; 
            cursor: pointer; 
            margin: 0.25rem; 
        }
        button:hover { background: #0056b3; }
        .api-test { margin: 2rem 0; }
        pre { background: #f8f9fa; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚀 Future Foundations</h1>
    <p><em>AI Safety & Human Flourishing Research Platform</em></p>

    <div id="status" class="status loading">
        <strong>Loading...</strong> Checking system status...
    </div>

    <div class="info">
        <h3>Mission</h3>
        <p>Using AI for the benefit of humanity while preserving human agency, authenticity, and liberty through strategic risk assessment, behavioral economics, and multi-agent coordination systems.</p>
    </div>

    <div class="project-card">
        <h3>Project Ecosystem</h3>
        <div>
            <span class="metric">True to the Oath</span>
            <span class="metric">Political Candidate Covenant</span>
            <span class="metric">Individual Responsibility (MAGGie)</span>
            <span class="metric">ARTI Scale</span>
        </div>
        <p>Integrated multi-project system for preserving human sovereignty in an AI-accelerated world.</p>
    </div>

    <div class="api-test">
        <h3>API Status</h3>
        <button onclick="testAPI()">Test Database Connection</button>
        <button onclick="testMetrics()">Check Shared Metrics</button>
        <button onclick="testPersona()">Test Persona Selection</button>
        
        <div id="api-results"></div>
    </div>

    <div class="info">
        <h3>Core Principles</h3>
        <ul>
            <li><strong>Human Autonomy:</strong> All systems preserve and enhance individual choice</li>
            <li><strong>Authentic Self-Expression:</strong> Resistance to manipulative optimization</li>
            <li><strong>Beneficial AI Development:</strong> Positive-sum human-AI collaboration</li>
            <li><strong>Strategic Risk Assessment:</strong> Proactive threat identification and mitigation</li>
        </ul>
    </div>

    <script>
        // Check system status on load
        window.addEventListener('load', checkStatus);

        async function checkStatus() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                const statusDiv = document.getElementById('status');
                if (data.healthy) {
                    statusDiv.className = 'status success';
                    statusDiv.innerHTML = '<strong>✅ System Healthy</strong> All systems operational.';
                } else {
                    statusDiv.className = 'status error';
                    statusDiv.innerHTML = '<strong>❌ System Error</strong> ' + (data.error || 'Unknown error');
                }
            } catch (error) {
                const statusDiv = document.getElementById('status');
                statusDiv.className = 'status error';
                statusDiv.innerHTML = '<strong>❌ Connection Failed</strong> Cannot reach API. Make sure netlify dev is running.';
            }
        }

        async function testAPI() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<div class="status loading">Testing database connection...</div>';
            
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                resultsDiv.innerHTML = \`
                    <div class="status success">
                        <strong>Database Test Successful</strong>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="status error">
                        <strong>Database Test Failed</strong>
                        <pre>\${error.message}</pre>
                    </div>
                \`;
            }
        }

        async function testMetrics() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<div class="status loading">Loading shared metrics...</div>';
            
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                
                resultsDiv.innerHTML = \`
                    <div class="status success">
                        <strong>Shared Metrics</strong>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="status error">
                        <strong>Metrics Test Failed</strong>
                        <pre>\${error.message}</pre>
                    </div>
                \`;
            }
        }

        async function testPersona() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<div class="status loading">Testing persona selection...</div>';
            
            try {
                const response = await fetch('/api/persona', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_context: 'agency',
                        user_context: { expertise_level: 'beginner' },
                        interaction_type: 'identity-discovery'
                    })
                });
                const data = await response.json();
                
                resultsDiv.innerHTML = \`
                    <div class="status success">
                        <strong>Persona Selection Test</strong>
                        <p>Recommended Persona: <strong>\${data.recommended_persona}</strong></p>
                        <p>This demonstrates the strategic persona selection matrix in action.</p>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="status error">
                        <strong>Persona Test Failed</strong>
                        <pre>\${error.message}</pre>
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>`;

  await fs.writeFile('public/index.html', indexHtml);
  console.log('✓ Created public/index.html');
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProject().then(() => {
    createIndexHtml();
  });
}