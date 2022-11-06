import { UserModel } from "@prisma/client";
import { UserLoginDto } from "./dto/users-login.dto";
import { UserRegisterDto } from "./dto/users-register.dto";
import { User } from "./user.entity";

export interface IUsersService {
	createUser: (dto: UserRegisterDto) => Promise<UserModel | null>;
	validateUSer: (dto: UserLoginDto) => Promise<boolean>;
}
