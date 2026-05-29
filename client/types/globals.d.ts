export {}

   declare global {
     interface CustomJwtSessionClaims {
       role?: "doctor" | "patient";
       doctorVerified?: boolean;
     }
   }