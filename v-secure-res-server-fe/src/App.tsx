import { useEffect } from 'react';
import { useAuth } from './auth/oidc/AuthContext';

export default function App () {
  const { isAuthenticated, login, logout, register, claims, accessToken } = useAuth();

  useEffect(()=>{
    console.log("access token", accessToken)
    console.log("claims", claims)
    console.log('isAuthenticated', isAuthenticated)
  }, [])
  
  async function testApiCall() {
    fetch("http://localhost:8081/test", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(data=>data.text()).then(ldata=>console.log(ldata))
    console.log("access token", accessToken)
    console.log("claims", claims)
    console.log('isAuthenticated', isAuthenticated)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white shadow rounded p-6 space-y-6">
        <h1 className="text-2xl font-bold">Demo SPA</h1>
        <button onClick={testApiCall}>
          test
        </button>
        {!isAuthenticated && (
          <div className="space-x-2">
            <button
              onClick={login}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              onClick={register}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Register
            </button>
          </div>
        )}
        {isAuthenticated && (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">ID Token Claims</h2>
              <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(claims, null, 2)}
              </pre>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Access Token (truncated)</h2>
              <code className="break-all text-sm">
                {accessToken?.slice(0,60)}...
              </code>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};
