import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from '../../../../lib/prisma';
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        lozinka: { label: "Lozinka", type: "password" },
      },
      async authorize(credentials) {
        console.log("Pristigle kredencijale:", credentials);
        if (!credentials?.email || !credentials?.lozinka) return null;
        const korisnik = await prisma.korisnik.findUnique({ where: { email: credentials.email } });
        console.log("Pronađen korisnik:", korisnik);
        if (!korisnik || !korisnik.lozinka) return null;
        const isValid = await bcrypt.compare(credentials.lozinka, korisnik.lozinka);
        console.log("Validnost lozinke:", isValid);
        if (!isValid) return null;
        return { id: String(korisnik.id), email: korisnik.email, name: korisnik.ime, uloga: korisnik.uloga };
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/auth/prijava",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };