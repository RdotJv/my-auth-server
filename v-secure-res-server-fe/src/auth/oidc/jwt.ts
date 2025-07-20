export function decodeJwt(token: string): any {
  const [, payload] = token.split('.');
  const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
  return JSON.parse(decodeURIComponent(
    json.split('').map(c => {
      const code = c.charCodeAt(0);
      return '%' + ('00' + code.toString(16)).slice(-2);
    }).join('')
  ));
}
