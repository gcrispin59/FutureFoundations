-- Future Foundations PAC Database Schema
-- Civic covenant platform: True to the Oath, Political Candidate Covenant
-- MAGGie and ARTI Scale are separate products (see SEPARATION.md)

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

-- Political Candidates (PCC)
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

-- True to the Oath — Accountability Tracking
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

-- AI-Human Interaction Tracking (TTO / PCC contexts)
CREATE TABLE ai_interactions (
    id SERIAL PRIMARY KEY,
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

-- Shared Metrics Across PAC Programs
CREATE TABLE shared_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50), -- 'institutional_integrity', 'covenant_compliance'
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
    intervention_type VARCHAR(100), -- 'persona_selection', 'feedback_calibration'
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
    aggregation_level VARCHAR(50), -- 'cohort', 'population'
    insight_data JSONB,
    privacy_protection_level VARCHAR(20), -- 'k_anonymous', 'differential_private', 'federated'
    contributing_projects TEXT[],
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Health Monitoring
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
CREATE INDEX idx_candidates_election_cycle ON candidates(election_cycle);
CREATE INDEX idx_ai_interactions_project_context ON ai_interactions(project_context);
CREATE INDEX idx_shared_metrics_type ON shared_metrics(metric_type);
CREATE INDEX idx_feedback_loops_projects ON feedback_loops(source_project, target_project);

-- Insert Core PAC Projects
INSERT INTO projects (name, slug, description, parent_project_id) VALUES
('Future Foundations PAC', 'future-foundations', 'Civic covenant and institutional integrity platform', NULL),
('True to the Oath', 'true-to-oath', 'Institutional integrity and accountability framework', 1),
('Political Candidate Covenant', 'political-candidate-covenant', 'Candidate assessment and voter matching system', 1);

-- Insert Initial Shared Metrics
INSERT INTO shared_metrics (metric_name, metric_type, calculation_method, current_value, projects_contributing) VALUES
('Institutional Integrity Rating', 'institutional_integrity', 'Trust and accountability metrics for governance', 0.0, ARRAY['true-to-oath', 'political-candidate-covenant']),
('Covenant Compliance Index', 'covenant_compliance', 'Aggregate adherence to renewal covenant tiers', 0.0, ARRAY['true-to-oath', 'political-candidate-covenant']),
('Positive-Sum Indicator', 'system_health', 'Frequency of win-win outcomes across PAC programs', 0.0, ARRAY['future-foundations']);
