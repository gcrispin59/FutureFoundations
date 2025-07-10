-- Future Foundations Database Schema
-- Run this after getting your NETLIFY_DATABASE_URL

-- Core Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_project_id INTEGER REFERENCES projects(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users/Individuals in the system
CREATE TABLE individuals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE, -- external auth system ID
    email VARCHAR(255),
    anonymous_id VARCHAR(100), -- for privacy-preserving tracking
    agency_score DECIMAL(5,2),
    authenticity_index DECIMAL(5,2),
    resiliency_rating DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MAGGie - Individual Responsibility Data
CREATE TABLE individual_assessments (
    id SERIAL PRIMARY KEY,
    individual_id INTEGER REFERENCES individuals(id),
    assessment_type VARCHAR(50), -- 'agency', 'journey', 'resiliency'
    assessment_data JSONB,
    score DECIMAL(5,2),
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journey Mapping
CREATE TABLE journeys (
    id SERIAL PRIMARY KEY,
    individual_id INTEGER REFERENCES individuals(id),
    journey_name VARCHAR(200),
    goals JSONB,
    milestones JSONB,
    progress_metrics JSONB,
    adaptive_adjustments JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Political Candidates (for PCC)
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    office VARCHAR(100),
    party_affiliation VARCHAR(100),
    election_cycle VARCHAR(20),
    oath_framework_score DECIMAL(5,2),
    integrity_rating DECIMAL(5,2),
    policy_positions JSONB,
    virtue_metrics JSONB,
    transparency_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- True to the Oath - Accountability Tracking
CREATE TABLE oath_assessments (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    assessment_period VARCHAR(50), -- 'campaign', 'quarterly', 'annual'
    oath_adherence_score DECIMAL(5,2),
    virtue_breakdown JSONB,
    accountability_metrics JSONB,
    transparency_data JSONB,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ARTI Scale - Threat Assessment
CREATE TABLE arti_assessments (
    id SERIAL PRIMARY KEY,
    assessment_scope VARCHAR(100), -- 'individual', 'institutional', 'systemic'
    target_id INTEGER, -- references individuals, candidates, or institutions
    target_type VARCHAR(50), -- 'individual', 'candidate', 'institution'
    threat_level INTEGER CHECK (threat_level >= 0 AND threat_level <= 10),
    threat_categories JSONB,
    risk_factors JSONB,
    mitigation_strategies JSONB,
    monitoring_alerts JSONB,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-Human Interaction Tracking
CREATE TABLE ai_interactions (
    id SERIAL PRIMARY KEY,
    individual_id INTEGER REFERENCES individuals(id),
    project_context VARCHAR(50),
    interaction_type VARCHAR(50), -- 'assistance', 'assessment', 'recommendation'
    ai_persona VARCHAR(50),
    interaction_data JSONB,
    agency_preservation_score DECIMAL(5,2),
    manipulation_risk_score DECIMAL(5,2),
    positive_sum_indicator BOOLEAN,
    interaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross-Project Relationships
CREATE TABLE project_relationships (
    id SERIAL PRIMARY KEY,
    source_project_id INTEGER REFERENCES projects(id),
    target_project_id INTEGER REFERENCES projects(id),
    relationship_type VARCHAR(50), -- 'feeds_into', 'informs', 'coordinates_with'
    relationship_strength DECIMAL(3,2), -- 0.0 to 1.0
    data_flow_direction VARCHAR(20), -- 'bidirectional', 'source_to_target', 'target_to_source'
    integration_points JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared Metrics Across Projects
CREATE TABLE shared_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50), -- 'human_flourishing', 'agency_preservation', 'institutional_integrity'
    calculation_method TEXT,
    current_value DECIMAL(10,4),
    historical_values JSONB,
    projects_contributing TEXT[], -- array of project slugs
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intervention Points and Free Will Preservation
CREATE TABLE intervention_points (
    id SERIAL PRIMARY KEY,
    project_context VARCHAR(50),
    intervention_type VARCHAR(100), -- 'persona_selection', 'feedback_calibration', 'risk_threshold'
    trigger_conditions JSONB,
    human_choice_preservation JSONB,
    automated_vs_human_control VARCHAR(20), -- 'automated', 'human_in_loop', 'human_controlled'
    activation_history JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Loops and Coordination
CREATE TABLE feedback_loops (
    id SERIAL PRIMARY KEY,
    source_project VARCHAR(50),
    target_project VARCHAR(50),
    loop_type VARCHAR(50), -- 'reinforcing', 'balancing', 'cascading'
    data_elements JSONB,
    loop_strength DECIMAL(3,2),
    health_indicators JSONB,
    last_cycle_completion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy-Preserving Analytics
CREATE TABLE anonymized_insights (
    id SERIAL PRIMARY KEY,
    insight_category VARCHAR(100),
    aggregation_level VARCHAR(50), -- 'individual', 'cohort', 'population'
    insight_data JSONB,
    privacy_protection_level VARCHAR(20), -- 'k_anonymous', 'differential_private', 'federated'
    contributing_projects TEXT[],
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Health and Risk Monitoring
CREATE TABLE system_health (
    id SERIAL PRIMARY KEY,
    component VARCHAR(100), -- specific project or integration point
    health_metrics JSONB,
    risk_indicators JSONB,
    cascade_failure_risk DECIMAL(3,2),
    emergence_indicators JSONB,
    goodhart_law_violations JSONB,
    last_health_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_individuals_anonymous_id ON individuals(anonymous_id);
CREATE INDEX idx_individual_assessments_type_date ON individual_assessments(assessment_type, assessment_date);
CREATE INDEX idx_candidates_election_cycle ON candidates(election_cycle);
CREATE INDEX idx_arti_assessments_threat_level ON arti_assessments(threat_level);
CREATE INDEX idx_ai_interactions_project_context ON ai_interactions(project_context);
CREATE INDEX idx_shared_metrics_type ON shared_metrics(metric_type);
CREATE INDEX idx_feedback_loops_projects ON feedback_loops(source_project, target_project);

-- Insert Core Projects
INSERT INTO projects (name, slug, description, parent_project_id) VALUES
('Future Foundations', 'future-foundations', 'Root project for AI safety and human flourishing', NULL),
('True to the Oath', 'true-to-oath', 'Institutional integrity and accountability framework', 1),
('Political Candidate Covenant', 'political-candidate-covenant', 'Candidate assessment and voter matching system', 1),
('Individual Responsibility MAGGie', 'individual-responsibility', 'Personal empowerment and decision-making tools', 1),
('Agency', 'agency', 'Self-identity and wellbeing systems', 4),
('Journey', 'journey', 'Personal mapping and goal management', 5),
('Resiliency', 'resiliency', 'Stress systems and antifragility development', 5),
('ARTI Scale', 'arti-scale', 'AI threat assessment and risk modeling', 1),
('AI for Better Humanity', 'ai-better-humanity', 'Human-AI collaboration and ethical safeguards', 8);

-- Insert Initial Shared Metrics
INSERT INTO shared_metrics (metric_name, metric_type, calculation_method, current_value, projects_contributing) VALUES
('Human Flourishing Index', 'human_flourishing', 'Aggregate of agency, authenticity, and wellbeing scores', 0.0, ARRAY['individual-responsibility', 'agency', 'journey']),
('Agency Preservation Score', 'agency_preservation', 'Individual sovereignty maintenance across all interactions', 0.0, ARRAY['agency', 'ai-better-humanity']),
('Institutional Integrity Rating', 'institutional_integrity', 'Trust and accountability metrics for governance', 0.0, ARRAY['true-to-oath', 'political-candidate-covenant']),
('Risk Delta Tracking', 'risk_assessment', 'Change in existential threat levels over time', 0.0, ARRAY['arti-scale']),
('Positive-Sum Indicator', 'system_health', 'Frequency of win-win outcomes across all projects', 0.0, ARRAY['future-foundations']);