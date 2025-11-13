import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "@/libs/password-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  useSecureCookies: process.env.NODE_ENV === "production", //cookie를 secure하게 할건지 말건지 => 모든 프로젝트에서 입력
  trustHost: true, //trustHost를 true로 하면 모든 프로젝트에서 입력
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET, //secret을 사용하는 이유는 모든 프로젝트에서 입력
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "이메일",
          type: "email",
          placeholder: "이메일을 입력해주세요.",
        },
        password: { label: "비밀번호", type: "password" },
      },
      //인증을 어떻게 처리할지 짜는 부분
      authorize: async (credentials) => {
        // 1. 모든 값들이 정상적으로 들어왔는가?
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }
        // 2. DB에서 유저를 찾기
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        if (!user) {
          throw new Error("존재하지 않는 이메일입니다.");
        }
        // 3. 비밀번호가 일치하는가?
        const passwordsMatch = comparePassword(
          credentials.password as string,
          user.hashedPassword as string
        );

        if (!passwordsMatch) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {},
  callbacks: {},
});
