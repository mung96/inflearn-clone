import bcrypt from "bcryptjs";

export function saltAndHashPassword(password: string): string {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
}

// DB에 있는 비밀번호 vs 입력받은 비밀번호
export function comparePassword(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}
