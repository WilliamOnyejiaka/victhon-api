import TokenBlackList from "../cache/TokenBlacklist";
import env, {EnvKey} from "../config/env";
import {AppDataSource} from "../data-source";
import {Professional} from "../entities/Professional";
import {User} from "../entities/User";
import {FailedFiles, UploadedFiles} from "../types";
import {CdnFolders, HttpStatus, ResourceType, UserType} from "../types/constants";
import deleteFiles from "../utils/deleteFiles";
import Password from "../utils/Password";
import Cloudinary from "./Cloudinary";
import Service from "./Service";
import Token from "./Token";

export default class Authentication extends Service {

    protected readonly storedSalt: string = env(EnvKey.STORED_SALT)!;
    protected readonly tokenSecret: string = env(EnvKey.TOKEN_SECRET)!;
    protected readonly secretKey: string = env(EnvKey.SECRET_KEY)!;
    protected readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();

    private generateToken(data: any, role: string, expiresIn: string = "100y") {
        return Token.createToken(this.tokenSecret, data, [role], expiresIn);
    }

    protected generateOTPToken(email: string, role: string, expiresIn: string = "5m") {
        return this.generateToken({email: email}, role, expiresIn);
    }

    protected generateUserToken(data: any, role: UserType) {
        return this.generateToken(data, role);
    }

    // public async googleAuth(oathUser: any, userType: any) {
    //     try {

    //         const userData = {
    //             firstName: oathUser.name.givenName,
    //             lastName: oathUser.name.familyName,
    //             email: oathUser.emails[0].value,
    //             location: `POINT(${0} ${0})` as any,
    //             isVerified: oathUser.emails[0].verified,
    //             authProvider: AuthProvider.GOOGLE
    //         };

    //         if (userType == UserType.USER) {
    //             const userRepo = AppDataSource.getRepository(User);

    //             let user = await userRepo.findOneBy({ email: oathUser.emails[0].value });
    //             if (user) {
    //                 const token = this.generateUserToken({ id: user.id, userType: UserType.USER }, UserType.USER);

    //                 return this.responseData(200, false, "User has logged in successfully", { token });

    //             } else {
    //                 const newUser = userRepo.create(userData);

    //                 const savedUser: any = (await userRepo.save(newUser))
    //                 const token = this.generateUserToken({
    //                     id: savedUser.id,
    //                     userType: UserType.USER
    //                 }, UserType.USER);

    //                 return this.responseData(201, false, "User has been created successfully", { token });
    //             }

    //         } else {
    //             const professionalRepo = AppDataSource.getRepository(Professional);
    //             let user = await professionalRepo.findOneBy({ email: oathUser.emails[0].value });
    //             if (user) {
    //                 const token = this.generateUserToken({ id: user.id, userType: UserType.PROFESSIONAL }, UserType.PROFESSIONAL);

    //                 return this.responseData(200, false, "Professional has logged in successfully", { token });

    //             } else {
    //                 const newUser = professionalRepo.create({ ...userData });

    //                 const savedUser: any = (await professionalRepo.save(newUser))
    //                 const token = this.generateUserToken({
    //                     id: savedUser.id,
    //                     userType: UserType.PROFESSIONAL
    //                 }, UserType.PROFESSIONAL);

    //                 return this.responseData(201, false, "Professional has been created successfully", { token });
    //             }
    //         }
    //     } catch (error) {
    //         return super.handleTypeormError(error);
    //     }
    // }

    public async signUp(signUpData: any) {
        try {

            const userRepo = AppDataSource.getRepository(User);

            let userEmailExists = await userRepo.findOneBy({email: signUpData.email});
            if (userEmailExists) {
                if (signUpData.file) await deleteFiles(signUpData.file);
                return this.responseData(400, true, `Email already exists.`);
            }

            let userPhoneNumberExists = await userRepo.findOneBy({phone: signUpData.phone});
            if (userPhoneNumberExists) {
                if (signUpData.file) await deleteFiles(signUpData.file);
                return this.responseData(400, true, `Phone number already exists.`);
            }

            signUpData.password = Password.hashPassword(signUpData.password, this.storedSalt);
            const user = userRepo.create({
                ...signUpData,
                location: `POINT(${signUpData.lng} ${signUpData.lat})`
            });

            const savedUser: any = (await userRepo.save(user));

            const token = this.generateUserToken({id: savedUser.id, userType: UserType.USER}, UserType.USER);
            const data = {
                user: {
                    ...savedUser,
                    longitude: signUpData.lng,
                    latitude: signUpData.lat,
                    location: undefined,
                    password: undefined
                },
                token: token,
            };
            return this.responseData(201, false, "User has been created successfully", data);
        } catch (error) {
            return super.handleTypeormError(error);
        }
    }

    // * User(normal user) login service
    public async login(email: string, password: string) {
        try {
            const userRepo = AppDataSource.getRepository(User);

            let result = await userRepo
                .createQueryBuilder("user")
                .addSelect("user.password")
                .where("user.email = :email", { email })
                .getOne();

            if (result) {
                const user = result;
                const hashedPassword = user.password;
                const validPassword = Password.compare(password, hashedPassword, this.storedSalt);

                if (validPassword) {
                    const token = this.generateUserToken({id: user.id, userType: UserType.USER}, UserType.USER);

                    const data = {
                        user: {
                            ...user,
                            password: undefined
                        },
                        token: token,
                    };
                    return this.responseData(200, false, "User has been logged in successfully", data);
                }
                return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
            }
            return this.responseData(404, true, "User was not found")
        } catch (error) {
            return super.handleTypeormError(error);
        }
    }

    public async professionalSignUp(email: string, password: string) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let userEmailExists = await professionalRepo.findOneBy({email: email});
            if (userEmailExists) {
                return this.responseData(400, true, `Email already exists.`);
            }

            password = Password.hashPassword(password, this.storedSalt);

            const user = professionalRepo.create({
                email,
                password,
                location: `POINT(${0} ${0})` as any,
            });

            const savedUser: any = (await professionalRepo.save(user))

            const token = this.generateUserToken({
                id: savedUser.id,
                userType: UserType.PROFESSIONAL
            }, UserType.PROFESSIONAL);
            const data = {
                user: {
                    ...savedUser,
                    password: undefined
                },
                token: token,
            };

            return this.responseData(201, false, "User has been created successfully", data);
        } catch (error) {
            return super.handleTypeormError(error);
        }
    }

    // public async professionalSignUp(signUpData: any) {
    //     try {
    //         const professionalRepo = AppDataSource.getRepository(Professional);

    //         let userEmailExists = await professionalRepo.findOneBy({ email: signUpData.email });
    //         if (userEmailExists) {
    //             if (signUpData.files) await deleteFiles(signUpData.files);
    //             return this.responseData(400, true, `Email already exists.`);
    //         }

    //         let userPhoneNumberExists = await professionalRepo.findOneBy({ phone: signUpData.phone });
    //         if (userPhoneNumberExists) {
    //             if (signUpData.files) await deleteFiles(signUpData.files);
    //             return this.responseData(400, true, `Phone number already exists.`);
    //         }

    //         signUpData.password = Password.hashPassword(signUpData.password, this.storedSalt);

    //         const user = professionalRepo.create({
    //             ...signUpData,
    //             location: `POINT(${signUpData.longitude} ${signUpData.latitude})`,
    //         });

    //         const savedUser: any = (await professionalRepo.save(user))

    //         const token = this.generateUserToken({
    //             id: savedUser.id,
    //             userType: UserType.PROFESSIONAL
    //         }, UserType.PROFESSIONAL);
    //         const data = {
    //             user: {
    //                 ...savedUser,
    //                 longitude: signUpData.longitude,
    //                 latitude: signUpData.latitude,
    //                 location: undefined,
    //                 password: undefined
    //             },
    //             token: token,
    //         };

    //         return this.responseData(201, false, "User has been created successfully", data);
    //     } catch (error) {
    //         return super.handleTypeormError(error);
    //     }
    // }

    public async professionalLogin(email: string, password: string) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let result = await professionalRepo
                .createQueryBuilder("professional")
                .addSelect("professional.password")
                .where("professional.email = :email", {email})
                .getOne();

            if (result) {
                const user = result;
                const hashedPassword = user.password;
                const validPassword = Password.compare(password, hashedPassword, this.storedSalt);

                if (validPassword) {
                    const token = this.generateUserToken({
                        id: user.id,
                        userType: UserType.PROFESSIONAL
                    }, UserType.PROFESSIONAL);
                    const coords = (user.location as any).replace("POINT(", "").replace(")", "").split(" ");

                    const data = {
                        user: {
                            ...user,
                            longitude: parseFloat(coords[0]),
                            latitude: parseFloat(coords[1]),
                            location: undefined,
                            password: undefined
                        },
                        token: token,
                    };
                    return this.responseData(200, false, "User has been logged in successfully", data);
                }
                return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
            }
            return this.responseData(404, true, "User was not found")
        } catch (error) {
            return super.handleTypeormError(error);
        }
    }

}