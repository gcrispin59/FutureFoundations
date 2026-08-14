// utils/database.js
// Database utilities for Future Foundations PAC (TTO, PCC)

import { neon } from "@netlify/neon";

const sql = neon();

// ==================== CANDIDATE MANAGEMENT (PCC) ====================

export async function createCandidate(candidateData) {
  const {
    name, office, party_affiliation, election_cycle,
    policy_positions, virtue_metrics
  } = candidateData;

  const [candidate] = await sql`
    INSERT INTO candidates (name, office, party_affiliation, election_cycle, policy_positions, virtue_metrics)
    VALUES (${name}, ${office}, ${party_affiliation}, ${election_cycle},
            ${JSON.stringify(policy_positions)}, ${JSON.stringify(virtue_metrics)})
    RETURNING *
  `;

  return candidate;
}

export async function updateCandidateScores(candidateId, scores) {
  const { oath_framework_score, integrity_rating, transparency_score } = scores;

  const [updated] = await sql`
    UPDATE candidates
    SET
      oath_framework_score = COALESCE(${oath_framework_score}, oath_framework_score),
      integrity_rating = COALESCE(${integrity_rating}, integrity_rating),
      transparency_score = COALESCE(${transparency_score}, transparency_score),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${candidateId}
    RETURNING *
  `;

  return updated;
}

export async function getCandidatesByElectionCycle(electionCycle) {
  const candidates = await sql`
    SELECT * FROM candidates
    WHERE election_cycle = ${electionCycle}
    ORDER BY integrity_rating DESC, oath_framework_score DESC
  `;

  return candidates;
}

// ==================== OATH ASSESSMENTS (TTO) ====================

export async function recordOathAssessment(assessmentData) {
  const {
    candidate_id, assessment_period, oath_adherence_score,
    virtue_breakdown, accountability_metrics, transparency_data
  } = assessmentData;

  const [assessment] = await sql`
    INSERT INTO oath_assessments (
      candidate_id, assessment_period, oath_adherence_score,
      virtue_breakdown, accountability_metrics, transparency_data
    )
    VALUES (
      ${candidate_id}, ${assessment_period}, ${oath_adherence_score},
      ${JSON.stringify(virtue_breakdown)}, ${JSON.stringify(accountability_metrics)},
      ${JSON.stringify(transparency_data)}
    )
    RETURNING *
  `;

  return assessment;
}

// ==================== AI INTERACTION TRACKING ====================

export async function recordAIInteraction(interactionData) {
  const {
    project_context, interaction_type, ai_persona,
    interaction_data, agency_preservation_score, manipulation_risk_score,
    positive_sum_indicator
  } = interactionData;

  const [interaction] = await sql`
    INSERT INTO ai_interactions (
      project_context, interaction_type, ai_persona,
      interaction_data, agency_preservation_score, manipulation_risk_score,
      positive_sum_indicator
    )
    VALUES (
      ${project_context}, ${interaction_type}, ${ai_persona},
      ${JSON.stringify(interaction_data)}, ${agency_preservation_score},
      ${manipulation_risk_score}, ${positive_sum_indicator}
    )
    RETURNING *
  `;

  return interaction;
}

// ==================== CROSS-PROJECT COORDINATION ====================

export async function updateSharedMetric(metricName, newValue, contributingProjects = []) {
  const [updated] = await sql`
    UPDATE shared_metrics
    SET
      current_value = ${newValue},
      historical_values = COALESCE(historical_values, '[]'::jsonb) ||
        jsonb_build_object(
          'timestamp', CURRENT_TIMESTAMP,
          'value', current_value
        ),
      projects_contributing = ${contributingProjects},
      last_calculated = CURRENT_TIMESTAMP
    WHERE metric_name = ${metricName}
    RETURNING *
  `;

  return updated;
}

export async function getSharedMetricsSnapshot() {
  const metrics = await sql`
    SELECT
      metric_name,
      metric_type,
      current_value,
      projects_contributing,
      last_calculated
    FROM shared_metrics
    ORDER BY metric_type, metric_name
  `;

  return metrics;
}

export async function recordFeedbackLoop(loopData) {
  const {
    source_project, target_project, loop_type,
    data_elements, loop_strength, health_indicators
  } = loopData;

  const [loop] = await sql`
    INSERT INTO feedback_loops (
      source_project, target_project, loop_type,
      data_elements, loop_strength, health_indicators,
      last_cycle_completion
    )
    VALUES (
      ${source_project}, ${target_project}, ${loop_type},
      ${JSON.stringify(data_elements)}, ${loop_strength},
      ${JSON.stringify(health_indicators)}, CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  return loop;
}

export async function getFeedbackLoopHealth(sourceProject, targetProject) {
  const [loop] = await sql`
    SELECT * FROM feedback_loops
    WHERE source_project = ${sourceProject} AND target_project = ${targetProject}
    ORDER BY last_cycle_completion DESC
    LIMIT 1
  `;

  return loop;
}

// ==================== INTERVENTION POINT MANAGEMENT ====================

export async function createInterventionPoint(interventionData) {
  const {
    project_context, intervention_type, trigger_conditions,
    human_choice_preservation, automated_vs_human_control
  } = interventionData;

  const [intervention] = await sql`
    INSERT INTO intervention_points (
      project_context, intervention_type, trigger_conditions,
      human_choice_preservation, automated_vs_human_control,
      activation_history
    )
    VALUES (
      ${project_context}, ${intervention_type}, ${JSON.stringify(trigger_conditions)},
      ${JSON.stringify(human_choice_preservation)}, ${automated_vs_human_control},
      '[]'::jsonb
    )
    RETURNING *
  `;

  return intervention;
}

export async function activateInterventionPoint(interventionId, activationContext) {
  const [intervention] = await sql`
    UPDATE intervention_points
    SET activation_history = activation_history ||
      jsonb_build_object(
        'timestamp', CURRENT_TIMESTAMP,
        'context', ${JSON.stringify(activationContext)}
      )
    WHERE id = ${interventionId}
    RETURNING *
  `;

  return intervention;
}

export async function getActiveInterventionPoints(projectContext) {
  const interventions = await sql`
    SELECT * FROM intervention_points
    WHERE project_context = ${projectContext}
    ORDER BY created_at DESC
  `;

  return interventions;
}

// ==================== SYSTEM HEALTH MONITORING ====================

export async function recordSystemHealth(healthData) {
  const {
    component, health_metrics, risk_indicators,
    cascade_failure_risk, emergence_indicators,
    goodhart_law_violations
  } = healthData;

  const [health] = await sql`
    INSERT INTO system_health (
      component, health_metrics, risk_indicators,
      cascade_failure_risk, emergence_indicators,
      goodhart_law_violations, last_health_check
    )
    VALUES (
      ${component}, ${JSON.stringify(health_metrics)}, ${JSON.stringify(risk_indicators)},
      ${cascade_failure_risk}, ${JSON.stringify(emergence_indicators)},
      ${JSON.stringify(goodhart_law_violations)}, CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  return health;
}

export async function getSystemHealthOverview() {
  const health = await sql`
    SELECT
      component,
      health_metrics,
      cascade_failure_risk,
      last_health_check,
      CASE
        WHEN cascade_failure_risk > 0.7 THEN 'critical'
        WHEN cascade_failure_risk > 0.4 THEN 'warning'
        ELSE 'healthy'
      END as status
    FROM system_health
    WHERE last_health_check = (
      SELECT MAX(last_health_check)
      FROM system_health s2
      WHERE s2.component = system_health.component
    )
    ORDER BY cascade_failure_risk DESC
  `;

  return health;
}

export async function detectGoodhartViolations() {
  const violations = await sql`
    SELECT
      component,
      goodhart_law_violations,
      last_health_check
    FROM system_health
    WHERE goodhart_law_violations != '{}'::jsonb
      AND last_health_check >= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY last_health_check DESC
  `;

  return violations;
}

// ==================== ANALYTICS & INSIGHTS ====================

export async function getProjectIntegrationHealth() {
  const integration = await sql`
    SELECT
      pr.source_project_id,
      pr.target_project_id,
      p1.slug as source_project,
      p2.slug as target_project,
      pr.relationship_strength,
      pr.data_flow_direction,
      fl.health_indicators,
      fl.last_cycle_completion
    FROM project_relationships pr
    JOIN projects p1 ON pr.source_project_id = p1.id
    JOIN projects p2 ON pr.target_project_id = p2.id
    LEFT JOIN feedback_loops fl ON (
      fl.source_project = p1.slug AND fl.target_project = p2.slug
    )
    ORDER BY pr.relationship_strength DESC
  `;

  return integration;
}

export async function generateAnonymizedInsights(category, aggregationLevel = 'cohort') {
  let insights;

  switch (category) {
    case 'ai_interaction_patterns':
      insights = await sql`
        SELECT
          project_context,
          ai_persona,
          AVG(agency_preservation_score) as avg_agency_preservation,
          AVG(manipulation_risk_score) as avg_manipulation_risk,
          COUNT(*) as interaction_count
        FROM ai_interactions
        WHERE interaction_timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY project_context, ai_persona
        HAVING COUNT(*) >= 5
        ORDER BY avg_agency_preservation DESC
      `;
      break;

    default:
      return null;
  }

  await sql`
    INSERT INTO anonymized_insights (
      insight_category, aggregation_level, insight_data,
      privacy_protection_level, contributing_projects
    )
    VALUES (
      ${category}, ${aggregationLevel}, ${JSON.stringify(insights)},
      'k_anonymous', ARRAY['future-foundations']
    )
  `;

  return insights;
}

// ==================== UTILITY FUNCTIONS ====================

export async function getProjectBySlug(slug) {
  const [project] = await sql`
    SELECT * FROM projects WHERE slug = ${slug}
  `;

  return project;
}

export async function getProjectHierarchy() {
  const projects = await sql`
    WITH RECURSIVE project_tree AS (
      SELECT id, name, slug, description, parent_project_id, 0 as level
      FROM projects
      WHERE parent_project_id IS NULL

      UNION ALL

      SELECT p.id, p.name, p.slug, p.description, p.parent_project_id, pt.level + 1
      FROM projects p
      JOIN project_tree pt ON p.parent_project_id = pt.id
    )
    SELECT * FROM project_tree ORDER BY level, name
  `;

  return projects;
}

export async function healthCheck() {
  try {
    await sql`SELECT 1 as status`;
    return { healthy: true, timestamp: new Date() };
  } catch (error) {
    return { healthy: false, error: error.message, timestamp: new Date() };
  }
}
