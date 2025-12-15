import BaseCache from "./Base.cache";

export default class TokenBlackList extends BaseCache {

    public constructor() {
        super('blacklist');
    }
}