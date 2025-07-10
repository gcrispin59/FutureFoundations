// netlify/functions/api.js
// Modern Netlify function for Future Foundations

export default async function handler(request, context) {
  // Get URL and method from request
  const url = new URL(request.url);
  const method = request.method;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  // Extract path segments
  const pathSegments = url.pathname.replace('/api/', '').split('/').filter(Boolean);
  const [resource] = pathSegments;

  console.log('API Request:', { method, pathname: url.pathname, resource });

  try {
    let responseData;

    switch (resource) {
      case 'health':
        responseData = {
          healthy: true,
          timestamp: new Date().toISOString(),
          message: 'Future Foundations API is operational',
          database: 'Connected (placeholder)',
          version: '1.0.0'
        };
        break;

      case 'metrics':
        responseData = [
          {
            metric_name: 'Human Flourishing Index',
            metric_type: 'human_flourishing',
            current_value: 7.5,
            last_calculated: new Date().toISOString()
          },
          {
            metric_name: 'Agency Preservation Score',
            metric_type: 'agency_preservation',
            current_value: 8.2,
            last_calculated: new Date().toISOString()
          },
          {
            metric_name: 'Institutional Integrity Rating',
            metric_type: 'institutional_integrity',
            current_value: 6.8,
            last_calculated: new Date().toISOString()
          }
        ];
        break;

      case 'persona':
        if (method === 'POST') {
          const body = await request.json();
          const { project_context, user_context, interaction_type } = body;
          
          // Simple persona selection logic
          let recommendedPersona = 'adaptive-hybrid';
          
          if (project_context === 'arti-scale') {
            recommendedPersona = 'analytical-strategic';
          } else if (project_context === 'agency' || project_context === 'individual-responsibility') {
            recommendedPersona = 'empathetic-supportive';
          } else if (project_context === 'true-to-oath' || project_context === 'political-candidate-covenant') {
            recommendedPersona = 'institutional-professional';
          }
          
          responseData = {
            recommended_persona: recommendedPersona,
            context: {
              project_context,
              interaction_type,
              user_context_applied: user_context ? 'yes' : 'no'
            },
            timestamp: new Date().toISOString()
          };
        } else {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: `Endpoint '${resource}' not found` }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export const config = {
  path: "/api/*"
};