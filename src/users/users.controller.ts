import { injectable, inject } from "inversify";
import { BaseController } from "../common/base.controller";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors/http-error.class";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";
import "reflect-metadata";
import { IUsersController } from "./users.controller.interface";
import { UserLoginDto } from "./dto/users-login.dto";
import { UserRegisterDto } from "./dto/users-register.dto";
import { ValidateMiddleWare } from "../common/validate.middleware";
import { sign } from "jsonwebtoken";
import { IConfigService } from "../config/config.service.interface";
import { IUsersService } from "./users.service.interface";

@injectable()
export class UserController extends BaseController implements IUsersController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRouter([
			{
				path: "/register",
				method: "post",
				func: this.register,
				middleWares: [new ValidateMiddleWare(UserRegisterDto)],
			},
			{
				path: "/login",
				method: "post",
				func: this.login,
				middleWares: [new ValidateMiddleWare(UserLoginDto)],
			},
			{
				path: "/info",
				method: "get",
				func: this.info,
				middleWares: [],
			},
		]);
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUSer(req.body);
		if (!result) {
			return next(new HTTPError(401, "authorization error", "login"));
		}
		const jwt = await this.signJWT(req.body.email, this.configService.get("SECRET"));
		this.ok(res, { jwt });
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, "This user already exist"));
		}
		this.ok(res, { email: result.email, id: result.id });
	}

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		this.ok(res, { email: user });
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{ algorithm: "HS256" },
				(err, token) => {
					if (err) {
						return reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
