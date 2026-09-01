export function getUsernameFromToken(email: boolean = false): string | null {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    

    /* {
        "jti": "2d6fe53e-9914-49c8-a613-25606ae5bc21",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "e7bd62fa-2eef-4134-a1dd-701fd7dff0a2",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "mazenturk",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname": "Mazen Turk",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/streetaddress": "MMMM from MM - M",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin",
        "exp": 1788596315,
        "iss": "http://localhost:5069/",
        "aud": "http://localhost:80/"
        }
    */ 
    

    return (
      email ? (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]  ??
      null) : (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]  ??
      null)
    );
  } catch {
    return null;
  }
}