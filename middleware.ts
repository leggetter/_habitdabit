import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // `/admin` requires admin role
      // if (req.nextUrl.pathname === "/dashboard/") {
      //   return token?.userRole === "admin"
      // }
      return !!token
    },
  },
})

export const config = { matcher: ["/dashboard/"] }
