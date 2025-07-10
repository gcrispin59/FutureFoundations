// netlify/functions/api.js
// Main API router for Future Foundations ecosystem

import {
  createIndividual, getIndividualByAnonymousId, updateIndividualScores,
  recordAssessment, getLatestAssessment,
  createJourney, updateJourneyProgress, getActiveJourneys,
  createCandidate, updateCandidateScores, getCandidatesByElectionCycle,
  recordARTIAssessment, getHighRiskARTIAssessments, getARTITrends,
  recordAIInteraction, getAgencyPreservationMetrics,
  updateSharedMetric, getSharedMetricsSnapshot,
  calculateHumanFlourishingIndex, generateAnonymizedInsights,
  healthCheck
} from '../../utils/database.js';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Response helper
function response(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
    body: JSON.stringify(body)
  };
}

// Error handler
function errorResponse(message, status = 500) {
  console.error('API Error:', message);
  return response({ error: message }, status);
}

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return response({}, 200);
  }

  const { httpMethod, path, body: requestBody, queryStringParameters } = event;
  const body = requestBody ? JSON.parse(requestBody) : {};
  const query = queryStringParameters || {};
  
  // Extract API path (remove /api prefix if present)
  const apiPath = path.replace(/^\/\.netlify\/functions\/api\/?/, '');
  const pathSegments = apiPath.split('/').filter(Boolean);
  
  try {
    // Route handling based on path segments
    const [resource, id, subResource] = pathSegments;
    
    switch (resource) {
      // ==================== HEALTH CHECK ====================
      case 'health':
        return response(await healthCheck());
      
      // ==================== INDIVIDUALS ====================
      case 'individuals':
        if (httpMethod === 'POST') {
          const individual = await createIndividual(body);
          return response(individual, 201);
        }
        
        if (httpMethod === 'GET' && id) {
          const individual = await getIndividualByAnonymousId(id);
          if (!individual) return errorResponse('Individual not found', 404);
          return response(individual);
        }
        
        if (httpMethod === 'PUT' && id && subResource === 'scores') {
          const updated = await updateIndividualScores(parseInt(id), body);
          return response(updated);
        }
        
        if (httpMethod === 'GET' && id && subResource === 'flourishing') {
          const index = await calculateHumanFlourishingIndex(parseInt(id));
          return response({ flourishing_index: index });
        }
        
        break;
      
      // ==================== ASSESSMENTS ====================
      case 'assessments':
        if (httpMethod === 'POST') {
          const assessment = await recordAssessment(body);
          return response(assessment, 201);
        }
        
        if (httpMethod === 'GET' && query.individual_id && query.type) {
          const assessment = await getLatestAssessment(
            parseInt(query.individual_id), 
            query.type
          );
          return response(assessment);
        }
        
        break;
      
      // ==================== JOURNEYS ====================
      case 'journeys':
        if (httpMethod === 'POST') {
          const journey = await createJourney(body);
          return response(journey, 201);
        }
        
        if (httpMethod === 'PUT' && id) {
          const updated = await updateJourneyProgress(parseInt(id), body);
          return response(updated);
        }
        
        if (httpMethod === 'GET' && query.individual_id) {
          const journeys = await getActiveJourneys(parseInt(query.individual_id));
          return response(journeys);
        }
        
        break;
      
      // ==================== CANDIDATES ====================
      case 'candidates':
        if (httpMethod === 'POST') {
          const candidate = await createCandidate(body);
          return response(candidate, 201);
        }
        
        if (httpMethod === 'PUT' && id && subResource === 'scores') {
          const updated = await updateCandidateScores(parseInt(id), body);
          return response(updated);
        }
        
        if (httpMethod === 'GET' && query.election_cycle) {
          const candidates = await getCandidatesByElectionCycle(query.election_cycle);
          return response(candidates);
        }
        
        break;
      
      // ==================== ARTI SCALE ====================
      case 'arti':
        if (httpMethod === 'POST') {
          const assessment = await recordARTIAssessment(body);
          return response(assessment, 201);
        }
        
        if (httpMethod === 'GET' && id === 'high-risk') {
          const minThreat = query.min_threat_level || 7;
          const assessments = await getHighRiskARTIAssessments(parseInt(minThreat));
          return response(assessments);
        }
        
        if (httpMethod === 'GET' && id === 'trends') {
          const targetType = query.target_type;
          const days = query.days || 30;
          const trends = await getARTITrends(targetType, parseInt(days));
          return response(trends);
        }
        
        break;
      
      // ==================== AI INTERACTIONS ====================
      case 'ai-interactions':
        if (httpMethod === 'POST') {
          const interaction = await recordAIInteraction(body);
          return response(interaction, 201);
        }
        
        if (httpMethod === 'GET' && id === 'metrics') {
          const individualId = query.individual_id;
          const days = query.days || 30;
          const metrics = await getAgencyPreservationMetrics(
            parseInt(individualId), 
            parseInt(days)
          );
          return response(metrics);
        }
        
        break;
      
      // ==================== SHARED METRICS ====================
      case 'metrics':
        if (httpMethod === 'GET') {
          const metrics = await getSharedMetricsSnapshot();
          return response(metrics);
        }
        
        if (httpMethod === 'PUT' && id) {
          const { value, contributing_projects } = body;
          const updated = await updateSharedMetric(id, value, contributing_projects);
          return response(updated);
        }
        
        break;
      
      // ==================== ANALYTICS ====================
      case 'analytics':
        if (httpMethod === 'GET' && id === 'insights') {
          const category = query.category;
          const aggregationLevel = query.aggregation_level || 'cohort';
          const insights = await generateAnonymizedInsights(category, aggregationLevel);
          return response(insights);
        }
        
        break;
      
      // ==================== PERSONA SELECTION ====================
      case 'persona':
        if (httpMethod === 'POST') {
          const { project_context, user_context, interaction_type } = body;
          const persona = await selectPersona(project_context, user_context, interaction_type);
          return response({ recommended_persona: persona });
        }
        
        break;
      
      default:
        return errorResponse('Endpoint not found', 404);
    }
    
    return errorResponse('Method not allowed', 405);
    
  } catch (error) {
    return errorResponse(error.message);
  }
}

// ==================== PERSONA SELECTION LOGIC ====================

async function selectPersona(projectContext, userContext, interactionType) {
  // This implements your strategic persona selection matrix
  // Based on the project context and user needs
  
  const personaMap = {
    'arti-scale': {
      'risk-assessment': 'analytical-strategic',
      'threat-modeling': 'analytical-strategic',
      'monitoring': 'analytical-strategic'
    },
    'individual-responsibility': {
      'assessment': 'empathetic-supportive',
      'goal-setting': 'empathetic-supportive',
      'progress-tracking': 'adaptive-hybrid'
    },
    'agency': {
      'identity-discovery': 'empathetic-supportive',
      'wellbeing': 'empathetic-supportive',
      'empowerment': 'adaptive-hybrid'
    },
    'journey': {
      'mapping': 'empathetic-supportive',
      'adjustment': 'adaptive-hybrid',
      'milestone-tracking': 'analytical-strategic'
    },
    'true-to-oath': {
      'assessment': 'institutional-professional',
      'transparency': 'institutional-professional',
      'accountability': 'institutional-professional'
    },
    'political-candidate-covenant': {
      'candidate-profiling': 'institutional-professional',
      'voter-matching': 'adaptive-hybrid',
      'policy-analysis': 'analytical-strategic'
    }
  };
  
  // Get base persona recommendation
  const basePersona = personaMap[projectContext]?.[interactionType] || 'adaptive-hybrid';
  
  // Apply user context modifiers
  let recommendedPersona = basePersona;
  
  if (userContext?.preferences?.interaction_style === 'direct') {
    recommendedPersona = 'analytical-strategic';
  } else if (userContext?.emotional_state === 'stressed') {
    recommendedPersona = 'empathetic-supportive';
  } else if (userContext?.expertise_level === 'expert') {
    recommendedPersona = 'institutional-professional';
  }
  
  // Record the persona selection for analysis
  await recordAIInteraction({
    individual_id: userContext?.individual_id,
    project_context: projectContext,
    interaction_type: 'persona_selection',
    ai_persona: recommendedPersona,
    interaction_data: {
      base_recommendation: basePersona,
      user_context_modifiers: userContext,
      final_selection: recommendedPersona
    },
    agency_preservation_score: 9.0, // High score for transparent persona selection
    manipulation_risk_score: 1.0,   // Low risk for user-controlled selection
    positive_sum_indicator: true
  });
  
  return recommendedPersona;
}

// ==================== CONFIG ====================

export const config = {
  path: "/api/*"
};