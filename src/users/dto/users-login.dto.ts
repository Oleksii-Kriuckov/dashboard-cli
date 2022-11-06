import { IsEmail, IsString } from "class-validator";

export class UserLoginDto {
	@IsEmail({}, { message: "Email is wrong" })
	email: string;

	@IsString()
	password: string;
}
