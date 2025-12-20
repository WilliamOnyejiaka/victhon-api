import { AppDataSource } from "../data-source";
import {HttpStatus, UserType} from "../types/constants";
import Service from "./Service";
import { User as UserEntity } from "../entities/User";
import UserCache from "../cache/UserCache";
import UserSocket from "../cache/UserSocket";


export default class User extends Service {
    private readonly socketCache = new UserSocket();
    private readonly userCache: UserCache = new UserCache(UserType.USER);

    public async setSocketId(userId: string, socketId: string) {
        return await this.socketCache.set(UserType.USER, userId, socketId);
    }

    public async deleteSocketId(userId: string) {
        return await this.socketCache.delete(UserType.USER, userId);
    }

    public async getSocketId(userId: string) {
        return await this.socketCache.get(UserType.USER, userId);
    }



    public async profile(userId: string) {
        try {
            const userRepo = AppDataSource.getRepository(UserEntity);

            let user = await userRepo.findOneBy({ id: userId });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `User was not found.`);
            // const coords = (user.location as any).replace("POINT(", "").replace(")", "").split(" ");

            const data = {
                ...user,
                // longitude: parseFloat(coords[0]),
                // latitude: parseFloat(coords[1]),
                location: undefined,
                password: undefined
            };
            return this.responseData(HttpStatus.OK, false, `User was retrieved successfully.`, data);

        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async uploadProfilePicture(userId: string, publicId: string, url: string) {
        try {
            const userRepo = AppDataSource.getRepository(UserEntity);

            let user = await userRepo.findOneBy({ id: userId });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `User was not found.`);

            if (user.profilePicture) return this.responseData(HttpStatus.BAD_REQUEST, true, `User already has a profile picture.`);

            user.profilePicture = {
                publicId,
                url
            };

            await userRepo.save(user);

            return this.responseData(HttpStatus.OK, false, `User was updated successfully.`, user);

        } catch (error) {
            return this.handleTypeormError(error);
        }
    }
}