# 🚀 Future Foundations Deployment Guide

This guide covers deployment strategies for the Future Foundations ecosystem across development, staging, and production environments.

## 📋 Prerequisites

### Required Accounts & Tools
- [Netlify Account](https://netlify.com)
- [Git Repository](https://github.com) (GitHub, GitLab, etc.)
- Node.js 18+ installed locally
- Netlify CLI installed globally

### Initial Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Verify installation
netlify --version
```

## 🏠 Local Development

### First-Time Setup

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd FutureFoundations
npm install
```

2. **Link to Netlify Site**
```bash
# Option A: Link existing site
netlify link

# Option B: Create new site
netlify init
```

3. **Start Development Server**
```bash
netlify dev
```

4. **Set Up Database**
```bash
# In a new terminal while netlify dev is running
npm run db:migrate
```

5. **Verify Setup**
Visit `http://localhost:8888/api/health` - should return `{"healthy": true}`

### Development Workflow

```bash
# Start development
netlify dev

# Run database migrations
npm run db:migrate

# Test API endpoints
curl http://localhost:8888/api/health
curl http://localhost:8888/api/metrics
```

## 🌐 Production Deployment

### Automated Deployment (Recommended)

1. **Configure Git Integration**
```bash
# Connect your repository to Netlify
# This can be done via Netlify dashboard or CLI
netlify sites:create --name future-foundations
```

2. **Set Environment Variables**
```bash
# Netlify will auto-provision NETLIFY_DATABASE_URL
# Add any custom environment variables
netlify env:set FUTURE_FOUNDATIONS_ENV production
netlify env:set AGENCY_PRESERVATION_THRESHOLD 7.0
netlify env:set MANIPULATION_RISK_THRESHOLD 3.0
```

3. **Deploy**
```bash
# Deploy current state
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Manual Deployment

```bash
# Build and deploy in one step
netlify deploy --prod --dir public

# Or deploy specific directory
netlify deploy --prod --functions netlify/functions
```

## 🗄️ Database Management

### Database Provisioning

Netlify automatically provisions your database when you:
1. Install `@netlify/neon` package
2. Run `netlify dev` or deploy to production
3. Have functions that use the `@netlify/neon` import

### Database Claiming

**Important**: Anonymous databases expire in 7 days!

1. Visit your Netlify dashboard
2. Go to: `https://app.netlify.com/projects/{your-site-id}/extensions/neon`
3. Click "Claim Database" to make it permanent
4. Optionally upgrade to paid Neon plan for more features

### Running Migrations

#### Local Development
```bash
# While netlify dev is running
npm run db:migrate
```

#### Production
```bash
# Deploy migration as a one-time function
netlify functions:invoke migrate
```

Or create a build hook:

**netlify.toml**
```toml
[build]
  command = "npm run db:migrate"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
```

### Database Backup & Recovery

```bash
# Export database (requires direct access)
pg_dump $NETLIFY_DATABASE_URL > backup.sql

# Import to new database
psql $NEW_DATABASE_URL < backup.sql
```

## 🔧 Configuration Files

### netlify.toml
```toml
[build]
  functions = "netlify/functions"
  publish = "public"

[functions]
  node_bundler = "esbuild"

[dev]
  framework = "#static"
  targetPort = 3999

[[plugins]]
  package = "@netlify/plugin-functions-core"

# Environment-specific settings
[context.production.environment]
  FUTURE_FOUNDATIONS_ENV = "production"

[context.deploy-preview.environment]
  FUTURE_FOUNDATIONS_ENV = "preview"

[context.branch-deploy.environment]
  FUTURE_FOUNDATIONS_ENV = "branch"
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "netlify dev",
    "build": "echo 'No build step required for static functions'",
    "deploy": "netlify deploy",
    "deploy:prod": "netlify deploy --prod",
    "db:migrate": "node scripts/migrate.js",
    "db:reset": "node scripts/reset.js",
    "test": "node scripts/test-api.js"
  }
}
```

## 🔐 Environment Variables

### Required Variables
- `NETLIFY_DATABASE_URL` - Auto-provisioned by Netlify
- `NETLIFY_DATABASE_URL_UNPOOLED` - Auto-provisioned by Netlify

### Optional Variables
```bash
# Set via CLI
netlify env:set FUTURE_FOUNDATIONS_ENV production
netlify env:set AGENCY_PRESERVATION_THRESHOLD 7.0
netlify env:set MANIPULATION_RISK_THRESHOLD 3.0
netlify env:set LOG_LEVEL info

# Or via Netlify dashboard
# Site Settings > Environment Variables
```

### Environment-Specific Settings

**Development**
```bash
FUTURE_FOUNDATIONS_ENV=development
LOG_LEVEL=debug
AGENCY_PRESERVATION_THRESHOLD=6.0
```

**Production**
```bash
FUTURE_FOUNDATIONS_ENV=production
LOG_LEVEL=info
AGENCY_PRESERVATION_THRESHOLD=8.0
```

## 🏗️ Multi-Environment Setup

### Branch-Based Deployments

```toml
# netlify.toml
[context.production]
  environment = { FUTURE_FOUNDATIONS_ENV = "production" }

[context.deploy-preview]
  environment = { FUTURE_FOUNDATIONS_ENV = "preview" }

[context.branch-deploy]
  environment = { FUTURE_FOUNDATIONS_ENV = "staging" }
```

### Staging Environment

1. **Create staging site**
```bash
netlify sites:create --name future-foundations-staging
```

2. **Deploy staging branch**
```bash
git checkout -b staging
netlify deploy --alias staging
```

## 📊 Monitoring & Observability

### Health Checks

Add to your monitoring system:
```bash
# Primary health check
curl https://your-site.netlify.app/api/health

# Database connectivity
curl https://your-site.netlify.app/api/metrics

# Persona selection test
curl -X POST https://your-site.netlify.app/api/persona \
  -H "Content-Type: application/json" \
  -d '{"project_context":"agency","interaction_type":"test"}'
```

### Netlify Analytics

Enable in dashboard:
- Site Settings > Analytics
- Functions > Usage metrics
- Performance monitoring

### Custom Monitoring

```javascript
// netlify/functions/health-check.js
export async function handler(event, context) {
  try {
    // Check database
    const dbHealth = await healthCheck();
    
    // Check system metrics
    const systemHealth = await getSystemHealthOverview();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        system: systemHealth
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'unhealthy',
        error: error.message
      })
    };
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if database is provisioned
netlify env:get NETLIFY_DATABASE_URL

# Re-provision if needed
netlify db init
```

#### Function Build Errors
```bash
# Check function logs
netlify functions:list
netlify functions:invoke --name api --no-identity

# Local debugging
netlify dev --debug
```

#### Migration Failures
```bash
# Run migration manually
netlify dev
# In another terminal:
node scripts/migrate.js

# Check database status
netlify functions:invoke health
```

### Performance Optimization

#### Function Cold Starts
```javascript
// Keep functions warm
export async function handler(event, context) {
  // Reuse database connections
  if (!global.sqlConnection) {
    global.sqlConnection = neon();
  }
  
  const sql = global.sqlConnection;
  // ... rest of function
}
```

#### Database Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_individuals_agency_score 
ON individuals(agency_score) WHERE agency_score IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_ai_interactions_recent 
ON ai_interactions(interaction_timestamp) 
WHERE interaction_timestamp >= CURRENT_DATE - INTERVAL '30 days';
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Consider read replicas for analytics
- Implement connection pooling for high traffic
- Use database migrations for schema changes

### Function Scaling
- Netlify automatically scales functions
- Monitor execution time and memory usage
- Implement caching for expensive operations
- Consider background job processing for heavy tasks

### Security
- Enable branch protection in Git
- Use environment variables for secrets
- Implement rate limiting for public APIs
- Regular security audits and updates

## 🆘 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Check database expiry warnings
   - Review function execution logs
   - Monitor system health metrics

2. **Monthly**
   - Update dependencies (`npm audit`)
   - Review and claim anonymous databases
   - Performance optimization review

3. **Quarterly**
   - Security audit
   - Backup strategy review
   - Disaster recovery testing

### Getting Help

1. **Netlify Support**
   - [Netlify Documentation](https://docs.netlify.com)
   - [Community Forum](https://answers.netlify.com)
   - Support tickets for paid plans

2. **Database Issues**
   - [Neon Documentation](https://neon.tech/docs)
   - Check Netlify dashboard for database status
   - Database connection string validation

3. **Application Issues**
   - Check `/api/health` endpoint
   - Review function logs in Netlify dashboard
   - Verify environment variables are set

---

**Remember**: Your Future Foundations deployment preserves human agency through strategic technical architecture. Every deployment decision should maintain the core principles of authenticity, autonomy, and beneficial AI collaboration.