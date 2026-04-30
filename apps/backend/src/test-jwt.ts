import { jwtVerify, createRemoteJWKSet } from 'jose'

const supabaseUrl = 'https://wkefqabdebihqbcdavwt.supabase.co'
const token =
  'eyJhbGciOiJFUzI1NiIsImtpZCI6IjcwODM3MjllLTdjZjYtNGY5ZS05ODc2LWY4N2I4MDBmY2JmNiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3drZWZxYWJkZWJpaHFiY2Rhdnd0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2MzBjNzkxMi01NmU5LTQ0OTEtYTA1MS04Mjk1NGY3MzlhNTAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc3NTY4Nzc4LCJpYXQiOjE3Nzc1NjUxNzgsImVtYWlsIjoidGVzdEBuZWFyd29ybGQuZGV2IiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzc1NjUxNzh9XSwic2Vzc2lvbl9pZCI6IjVkNGQ5ZGYyLWVlMTEtNDQ3ZS05OTczLTc4ZWEwOWJmNjJkYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.JBKTaMmFSJvgR1jMZBPFR_GpIN3TSYHoMlPZAQ2kXspKHW9wPZ4H5mBlmKK2jSPcAp8GrtB8TM2UgMX-Q0e6eg'

async function test() {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    })

    console.log('✅ Token verified!')
    console.log('sub:', payload.sub)
    console.log('email:', payload.email)
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message)
    console.error('Code:', error.code)
    console.error('Full error:', error)
  }
}

test()
