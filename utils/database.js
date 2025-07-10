// utils/database.js
// Core database utilities for Future Foundations ecosystem

import { neon } from "@netlify/neon";

const sql = neon();

// ==================== INDIVIDUAL MANAGEMENT ====================

export async function createIndividual(userData) {
  const { user_id, email, anonymous_id } = userData;
  
  const [individual] = await sql`
    INSERT INTO individuals (user_id, email, anonymous_id)
    VALUES (${user_id || null}, ${email || null}, ${anonymous_id})
    RETURNING *
  `;
  
  return individual;
}

export async function getIndividualByAnonymousId(anonymousId) {
  const [individual] = await sql`
    SELECT * FROM individuals 
    WHERE anonymous_id = ${anonymousId}
  `;
  
  return individual;
}

export async function updateIndividualScores(individualId, scores) {
  const { agency_score, authenticity_index, resiliency_rating } = scores;
  
  const [updated] = await sql`
    UPDATE individuals 
    SET 
      agency_score = COALESCE(${agency_score}, agency_score),
      authenticity_index = COALESCE(${authenticity_index}, authenticity_index),
      resiliency_rating = COALESCE(${resiliency_rating}, resiliency_rating),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${individualId}
    RETURNING *
  `;
  
  return updated;
}

// ==================== ASSESSMENT MANAGEMENT ====================

export async function recordAssessment(assessmentData) {
  const { individual_id, assessment_type, assessment_data, score } = assessmentData;
  
  const [assessment] = await sql`
    INSERT INTO individual_assessments (individual_id, assessment_type, assessment_data, score)
    VALUES (${individual_id}, ${assessment_type}, ${JSON.stringify(assessment_data)}, ${score})
    RETURNING *
  `;
  
  return assessment;
}

export async function getLatestAssessment(individualId, assessmentType) {
  const [assessment] = await sql`
    SELECT * FROM individual_assessments
    WHERE individual_id = ${individualId} AND assessment_type = ${assessmentType}
    ORDER BY assessment_date DESC
    LIMIT 1
  `;
  
  return assessment;
}

// ==================== JOURNEY MANAGEMENT ====================

export async function createJourney(journeyData) {
  const { individual_id, journey_name, goals, milestones } = journeyData;
  
  const [journey] = await sql`
    INSERT INTO journeys (individual_id, journey_name, goals, milestones, progress_metrics)
    VALUES (${individual_id}, ${journey_name}, ${JSON.stringify(goals)}, ${JSON.stringify(milestones)}, '{}')
    RETURNING *
  `;
  
  return journey;
}

export async function updateJourneyProgress(journeyId, progressData) {
  const { progress_metrics, adaptive_adjustments } = progressData;
  
  const [updated] = await sql`
    UPDATE journeys 
    SET 
      progress_metrics = ${JSON.stringify(progress_metrics)},
      adaptive_adjustments = COALESCE(${JSON.stringify(adaptive_adjustments)}, adaptive_adjustments),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${journeyId}
    RETURNING *
  `;
  
  return updated;
}

export async function getActiveJourneys(individualId) {
  const journeys = await sql`
    SELECT * FROM journeys
    WHERE individual_id = ${individualId} AND status = 'active'
    ORDER BY created_at DESC
  `;
  
  return journeys;
}

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

// ==================== ARTI SCALE MANAGEMENT ====================

export async function recordARTIAssessment(artiData) {
  const {
    assessment_scope, target_id, target_type, threat_level,
    threat_categories, risk_factors, mitigation_strategies
  } = artiData;
  
  const [assessment] = await sql`
    INSERT INTO arti_assessments (
      assessment_scope, target_id, target_type, threat_level,
      threat_categories, risk_factors, mitigation_strategies
    )
    VALUES (
      ${assessment_scope}, ${target_id}, ${target_type}, ${threat_level},
      ${JSON.stringify(threat_categories)}, ${JSON.stringify(risk_factors)}, 
      ${JSON.stringify(mitigation_strategies)}
    )
    RETURNING *
  `;
  
  return assessment;
}

export async function getHighRiskARTIAssessments(minThreatLevel = 7) {
  const assessments = await sql`
    SELECT * FROM arti_assessments
    WHERE threat_level >= ${minThreatLevel}
    ORDER BY threat_level DESC, assessment_date DESC
  `;
  
  return assessments;
}

export async function getARTITrends(targetType, days = 30) {
  const assessments = await sql`
    SELECT 
      DATE(assessment_date) as assessment_day,
      AVG(threat_level) as avg_threat_level,
      COUNT(*) as assessment_count
    FROM arti_assessments
    WHERE target_type = ${targetType} 
      AND assessment_date >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(assessment_date)
    ORDER BY assessment_day DESC
  `;
  
  return assessments;
}

// ==================== AI INTERACTION TRACKING ====================

export async function recordAIInteraction(interactionData) {
  const {
    individual_id, project_context, interaction_type, ai_persona,
    interaction_data, agency_preservation_score, manipulation_risk_score,
    positive_sum_indicator
  } = interactionData;
  
  const [interaction] = await sql`
    INSERT INTO ai_interactions (
      individual_id, project_context, interaction_type, ai_persona,
      interaction_data, agency_preservation_score, manipulation_risk_score,
      positive_sum_indicator
    )
    VALUES (
      ${individual_id}, ${project_context}, ${interaction_type}, ${ai_persona},
      ${JSON.stringify(interaction_data)}, ${agency_preservation_score}, 
      ${manipulation_risk_score}, ${positive_sum_indicator}
    )
    RETURNING *
  `;
  
  return interaction;
}

export async function getAgencyPreservationMetrics(individualId, days = 30) {
  const [metrics] = await sql`
    SELECT 
      AVG(agency_preservation_score) as avg_agency_preservation,
      AVG(manipulation_risk_score) as avg_manipulation_risk,
      COUNT(CASE WHEN positive_sum_indicator = true THEN 1 END) as positive_sum_count,
      COUNT(*) as total_interactions
    FROM ai_interactions
    WHERE individual_id = ${individualId} 
      AND interaction_timestamp >= CURRENT_DATE - INTERVAL '${days} days'
  `;
  
  return metrics;
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

export async function calculateHumanFlourishingIndex(individualId) {
  // Get latest scores for the individual
  const [individual] = await sql`
    SELECT agency_score, authenticity_index, resiliency_rating
    FROM individuals
    WHERE id = ${individualId}
  `;
  
  if (!individual) return null;
  
  // Calculate weighted average (you can adjust weights based on your framework)
  const weights = { agency: 0.4, authenticity: 0.35, resiliency: 0.25 };
  
  const flourishingIndex = (
    (individual.agency_score || 0) * weights.agency +
    (individual.authenticity_index || 0) * weights.authenticity +
    (individual.resiliency_rating || 0) * weights.resiliency
  );
  
  // Update the shared metric
  await updateSharedMetric('Human Flourishing Index', flourishingIndex, 
    ['individual-responsibility', 'agency', 'journey']);
  
  return flourishingIndex;
}

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

export async function generateCascadeRiskReport() {
  const risks = await sql`
    SELECT 
      sh.component,
      sh.cascade_failure_risk,
      sh.risk_indicators,
      COUNT(ai.id) as recent_interactions,
      AVG(ai.manipulation_risk_score) as avg_manipulation_risk
    FROM system_health sh
    LEFT JOIN ai_interactions ai ON (
      ai.project_context = sh.component AND
      ai.interaction_timestamp >= CURRENT_DATE - INTERVAL '24 hours'
    )
    WHERE sh.last_health_check >= CURRENT_DATE - INTERVAL '1 hour'
    GROUP BY sh.component, sh.cascade_failure_risk, sh.risk_indicators
    ORDER BY sh.cascade_failure_risk DESC
  `;
  
  return risks;
}

// ==================== PRIVACY-PRESERVING ANALYTICS ====================

export async function generateAnonymizedInsights(category, aggregationLevel = 'cohort') {
  let insights;
  
  switch (category) {
    case 'agency_trends':
      insights = await sql`
        SELECT 
          DATE_TRUNC('week', assessment_date) as week,
          AVG(score) as avg_agency_score,
          COUNT(DISTINCT individual_id) as participant_count
        FROM individual_assessments
        WHERE assessment_type = 'agency'
          AND assessment_date >= CURRENT_DATE - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', assessment_date)
        ORDER BY week DESC
      `;
      break;
      
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
        HAVING COUNT(*) >= 5  -- k-anonymity protection
        ORDER BY avg_agency_preservation DESC
      `;
      break;
      
    default:
      return null;
  }
  
  // Record the insight generation
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
    const [result] = await sql`SELECT 1 as status`;
    return { healthy: true, timestamp: new Date() };
  } catch (error) {
    return { healthy: false, error: error.message, timestamp: new Date() };
  }
}