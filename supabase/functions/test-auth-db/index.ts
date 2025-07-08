// Supabase Edge Function لاختبار المصادقة وقاعدة البيانات
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // إنشاء عميل Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey,
      },
      tests: {
        anonymousAccess: { status: 'pending', data: null, error: null },
        authenticatedAccess: { status: 'pending', data: null, error: null },
        serviceRoleAccess: { status: 'pending', data: null, error: null },
        rlsCheck: { status: 'pending', data: null, error: null },
      }
    }

    // 1. اختبار الوصول المجهول
    try {
      const anonClient = createClient(supabaseUrl, supabaseAnonKey)
      const { data, error } = await anonClient
        .from('categories')
        .select('id, name')
        .limit(1)

      results.tests.anonymousAccess = {
        status: error ? 'failed' : 'success',
        data: data,
        error: error?.message || null
      }
    } catch (e) {
      results.tests.anonymousAccess = {
        status: 'error',
        data: null,
        error: e.message
      }
    }

    // 2. اختبار الوصول المصادق عليه
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: authHeader
            }
          }
        })

        // التحقق من المستخدم
        const { data: { user }, error: userError } = await authClient.auth.getUser(token)
        
        if (user) {
          // محاولة قراءة بيانات المستخدم
          const { data, error } = await authClient
            .from('users')
            .select('id, email, name')
            .eq('id', user.id)
            .single()

          results.tests.authenticatedAccess = {
            status: error ? 'failed' : 'success',
            data: { user: user.email, userData: data },
            error: error?.message || null
          }
        } else {
          results.tests.authenticatedAccess = {
            status: 'failed',
            data: null,
            error: userError?.message || 'Invalid token'
          }
        }
      } catch (e) {
        results.tests.authenticatedAccess = {
          status: 'error',
          data: null,
          error: e.message
        }
      }
    }

    // 3. اختبار Service Role (يتجاوز RLS)
    if (supabaseServiceKey) {
      try {
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
        const { data, error, count } = await serviceClient
          .from('users')
          .select('id', { count: 'exact', head: true })

        results.tests.serviceRoleAccess = {
          status: error ? 'failed' : 'success',
          data: { userCount: count },
          error: error?.message || null
        }
      } catch (e) {
        results.tests.serviceRoleAccess = {
          status: 'error',
          data: null,
          error: e.message
        }
      }
    }

    // 4. فحص RLS
    try {
      const { data, error } = await createClient(supabaseUrl, supabaseServiceKey)
        .rpc('check_rls_status')

      results.tests.rlsCheck = {
        status: error ? 'failed' : 'success',
        data: data,
        error: error?.message || null
      }
    } catch (e) {
      // إذا لم تكن الدالة موجودة، نتخطى
      results.tests.rlsCheck = {
        status: 'skipped',
        data: null,
        error: 'RLS check function not found'
      }
    }

    return new Response(
      JSON.stringify(results, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 