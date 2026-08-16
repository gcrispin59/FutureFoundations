# Membership Counter & Geographic Dashboard Implementation Guide

This document provides technical guidance for implementing the True to the Oath Initiative membership counter and state-by-state visualization system.

## 1. System Architecture Overview

The membership tracking system consists of these core components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Registration   │────▶│   Database &    │────▶│   Dashboard     │
│    System       │     │     API         │     │ Visualization   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components:

1. **Registration System**:
   - Collects user information including state residence and background
   - Validates eligibility criteria
   - Categorizes new members (military, law enforcement, other)

2. **Database & API Layer**:
   - Stores registration data securely
   - Aggregates statistics by state and category
   - Provides secure endpoints for dashboard consumption
   - Caches results to optimize performance

3. **Dashboard Visualization**:
   - Displays real-time counters and progress indicators
   - Renders interactive US map with state-by-state metrics
   - Shows leaderboards and comparative statistics

## 2. Data Schema

### Core Tables

**Members Table**:
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  state_code CHAR(2),
  zip_code VARCHAR(10),
  category VARCHAR(50), -- 'military', 'law_enforcement', 'other'
  status VARCHAR(20),   -- 'pending', 'verified', 'denied'
  registration_date TIMESTAMP,
  verification_date TIMESTAMP,
  oath_status VARCHAR(50)
);
```

**State Targets Table**:
```sql
CREATE TABLE state_targets (
  state_code CHAR(2) PRIMARY KEY,
  state_name VARCHAR(100),
  military_eligible INT,
  law_enforcement_eligible INT,
  other_eligible INT,
  total_eligible INT,
  last_updated TIMESTAMP
);
```

**Statistics Cache Table**:
```sql
CREATE TABLE statistics_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(100),
  cache_value JSONB,
  last_updated TIMESTAMP
);
```

## 3. API Endpoints

### Key API Endpoints:

1. **Overall Statistics**:
   ```
   GET /api/statistics/overall
   ```
   Returns total eligible population, joined members, and completion percentage.

2. **State-Level Data**:
   ```
   GET /api/statistics/states
   ```
   Returns array of all state data with eligible populations, joined counts, and percentages.

3. **Category Breakdown**:
   ```
   GET /api/statistics/categories
   ```
   Returns breakdown of registrations by category (military, law enforcement, other).

4. **Real-time Counter Update**:
   ```
   GET /api/statistics/counter
   ```
   Lightweight endpoint for updating real-time counters.

## 4. Dashboard Integration

### React Component Integration

1. Add required dependencies:
   ```bash
   npm install react-simple-maps d3-scale react-tooltip recharts
   ```

2. Import the membership dashboard component:
   ```jsx
   import MembershipDashboard from './components/MembershipDashboard';
   ```

3. Add to your page:
   ```jsx
   <MembershipDashboard />
   ```

### Configuration Options

The dashboard component accepts these configuration props:

```jsx
<MembershipDashboard 
  refreshInterval={60000}             // Data refresh interval in ms
  targetUrl="/api/statistics/states"  // API endpoint for state data
  showLeaderboard={true}              // Show/hide leaderboard
  mapColorScheme="blue"               // Color scheme (blue, green, red)
  showCategories={true}               // Show category breakdown
/>
```

## 5. Data Initialization

### Initial Eligible Population Data

To initialize the state targets table, use the following estimates based on demographic research:

1. Total eligible population: approximately 24.5 million Americans
2. Distribution by state follows military bases, veteran population, and law enforcement concentration

Use the provided CSV data file (`state_targets_initial.csv`) to populate the database. The file contains:
- State code and name
- Military eligible population
- Law enforcement eligible population
- Other eligible population
- Total eligible population

Example import command:
```bash
psql -c "\copy state_targets FROM 'state_targets_initial.csv' WITH CSV HEADER"
```

## 6. Performance Considerations

### Caching Strategy

1. Implement server-side caching for aggregated statistics:
   - Cache overall statistics with 5-minute refresh
   - Cache state-level data with 10-minute refresh
   - Use Redis or a similar in-memory cache

2. Implement client-side caching:
   - Use local storage for non-sensitive aggregate data
   - Implement conditional fetching with ETags

### Database Optimization

1. Add appropriate indexes:
   ```sql
   CREATE INDEX idx_members_state ON members(state_code);
   CREATE INDEX idx_members_category ON members(category);
   CREATE INDEX idx_members_status ON members(status);
   ```

2. Create materialized views for common queries:
   ```sql
   CREATE MATERIALIZED VIEW state_statistics AS
   SELECT 
     m.state_code,
     st.state_name,
     COUNT(*) as total_joined,
     st.total_eligible,
     (COUNT(*) * 100.0 / st.total_eligible) as percentage
   FROM members m
   JOIN state_targets st ON m.state_code = st.state_code
   WHERE m.status = 'verified'
   GROUP BY m.state_code, st.state_name, st.total_eligible;
   ```

3. Schedule regular view refreshes:
   ```sql
   REFRESH MATERIALIZED VIEW state_statistics;
   ```

## 7. Security Considerations

1. **Secure API Access**:
   - Implement rate limiting to prevent abuse
   - Use appropriate CORS settings for client access
   - Prevent detailed queries that might expose PII

2. **Data Protection**:
   - Only expose aggregate statistics through public APIs
   - Never expose individual member data through the dashboard API
   - Implement proper input validation on all endpoints

3. **Analytics Separation**:
   - Create read-only database role for statistics queries
   - Separate sensitive member data from aggregation tables

## 8. Implementation Sequence

### Phase 1: Foundation (Week 1)
- [ ] Set up database schema
- [ ] Initialize state targets data
- [ ] Implement basic API endpoints

### Phase 2: Visualization (Week 2)
- [ ] Implement React dashboard component
- [ ] Create interactive US map
- [ ] Build counter displays

### Phase 3: Optimization (Week 3)
- [ ] Implement caching strategy
- [ ] Add materialized views
- [ ] Optimize API response times

### Phase 4: Enhancement (Week 4)
- [ ] Add leaderboard functionality
- [ ] Implement category breakdowns
- [ ] Create historical trend visualization

## 9. Maintenance & Updates

### Regular Tasks

1. **Population Data