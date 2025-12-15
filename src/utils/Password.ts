import crypto from "crypto";

export default class Password {

    static hashPassword(password: string, storedSalt: string) {
        // use this to generate the storedSalt crypto.randomBytes(16).toString('hex');
        return crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512')
            .toString('hex');
    }

    static compare(password: string, hashedPassword: string, storedSalt: string) {
        const derivedKey = crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512');
        return derivedKey.toString('hex') === hashedPassword;
    }
}
