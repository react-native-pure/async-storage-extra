import {EventEmitter} from "fbemitter"
import type {ConnectItemType, IStorage, StorageOption} from "./Types";
import Storage from "./Storage";
import EnhancedAsyncStorage from "./EnhancedAsyncStorage";

const DefaultStorageOption: StorageOption = {
    prefix: "@storage",
    preload: true
};

/**
 * AsyncStorage扩展
 */
export default class AsyncStorageExtra implements IStorage {
    _option: StorageOption;
    _emitter: EventEmitter = new EventEmitter();
    _storage: Storage = new Storage();
    _asyncStorage: EnhancedAsyncStorage = new EnhancedAsyncStorage();

    constructor(option: StorageOption = DefaultStorageOption) {
        if (typeof option === "string") {
            this._option = Object.assign({}, DefaultStorageOption, {prefix: option});
        }
        else {
            this._option = Object.assign({}, DefaultStorageOption, option);
        }
        if (this._option.preload) {
            this.restore();
        }
    }

    _getRealKey(key: String): String {
        return `${this._option.prefix}${key}`;
    }

    _getKey(realKey: String): String {
        const len = this._option.prefix.length;
        return realKey.substring(len);
    }

    getItem(key) {
        const realKey = this._getRealKey(key);
        return this._storage.getItem(realKey);
    }

    multiGet(keys: Array) {
        const realKeys = keys.map(key => this._getRealKey(key));
        const result = this._storage.multiGet(realKeys);
        return result.map(([key, value]) => [this._getKey(key), value]);
    }

    search(pattern) {
        const keys = this.getKeys(pattern);
        const result = this._storage.multiGet(keys.map(key => this._getRealKey(key)));
        return result.map(([key, value]) => [this._getKey(key), value]);
    }

    /**
     * @TODO 如果set的值和原值相等(deep equal),则不执行任何操作
     */
    setItem(key, value) {
        this._emitter.emit(key, value);
        const realKey = this._getRealKey(key);
        this._asyncStorage.setItem(realKey, value);
        this._storage.setItem(realKey, value);
    }

    /**
     * @TODO 如果set的值和原值相等(deep equal),则不执行任何操作
     */
    multiSet(keyValuePairs) {
        keyValuePairs.forEach(([key, value]) => this._emitter.emit(key, value));
        const next = keyValuePairs.map(([key, value]) => [this._getRealKey(key), value]);
        this._storage.multiSet(next);
        this._asyncStorage.multiSet(next);
    }

    removeItem(key: String) {
        this._emitter.emit(key);
        const realKey = this._getRealKey(key);
        this._storage.removeItem(realKey);
        this._asyncStorage.removeItem(realKey);
    }

    multiRemove(keys: Array) {
        keys.forEach(key => this._emitter.emit(key));
        this._storage.multiRemove(keys);
        this._asyncStorage.multiRemove(keys);
    }

    clear() {
        const allKeys = this._storage.getAllKeys().map(key => this._getKey(key));
        allKeys.forEach(key => this._emitter.emit(key));
        this._storage.clear();
        this._asyncStorage.clear();
    }

    getAllKeys() {
        return this._storage.getAllKeys().map(key => this._getKey(key));
    }

    getKeys(pattern: RegExp) {
        const allKeys = this.getAllKeys();
        if (pattern) {
            return allKeys.filter(key => pattern.test(key));
        }
        return allKeys;
    }

    addListener(key, callback) {
        return this._emitter.addListener(key, callback);
    }

    /**
     * 监听key/value的变化,只执行一次
     * @param key
     * @param callback
     * @returns {*}
     */
    once(key, callback) {
        return this._emitter.once(key, callback);
    }

    /**
     * 移除key/value的所有监听
     * @param key
     */
    removeAllListeners(key) {
        return this._emitter.removeAllListeners(key);
    }

    /**
     * storage的快捷设置
     * @param keys
     * @param mapStateToProps
     * @returns {{scope: Storage, keys: *, mapStateToProps: *}}
     */
    connect(keys, mapStateToProps): ConnectItemType {
        return {
            scope: this,
            keys,
            mapStateToProps
        };
    }

    async restore() {
        const allKeys = await this._asyncStorage.getAllKeys();
        const keyValuePairs = await this._asyncStorage.multiGet(allKeys);
        this._storage.multiSet(keyValuePairs);
        this._option.onPreload && this._option.onPreload(this);
    }
}