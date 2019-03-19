import type {IStorage} from "./Types";

export default class Storage implements IStorage {
    _values = {};

    getItem(key) {
        return this._values[key];
    }

    setItem(key, value, option) {
        this._values[key] = value;
    }

    removeItem(key) {
        delete this._values[key];
    }

    clear() {
        this._values = {};
    }

    getAllKeys() {
        return Object.keys(this._values);
    }

    multiRemove(keys) {
        keys.forEach(key => delete this._values[key]);
    }

    /**
     * 设置多个key/value键值对
     *
     * @example
     * multiSet([["key1",value],["key2",value]])
     *
     * @param keyValuePairs
     */
    multiSet(keyValuePairs) {
        keyValuePairs.forEach(([key, value]) => this._values[key] = value);
    }

    multiGet(keys) {
        return keys.map(key => [key, this._values[key]]);
    }

    search(pattern) {
        const allKeys = this.getAllKeys();
        const matchKeys = allKeys.filter(key => pattern.test(key));
        return this.multiGet(matchKeys);
    }
}