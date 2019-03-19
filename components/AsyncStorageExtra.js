import {AsyncStorage} from "react-native"
import {EventEmitter} from "fbemitter"
import type {IStorage, StorageOption, ValueItemOptionType} from "./Types";
import Storage from "./Storage";
import EnhancedAsyncStorage from "./EnhancedAsyncStorage";

const DefaultStorageOption: StorageOption = {
    prefix: "",
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
            this._option = option;
        }
    }

    _getRealKey(key: String): String {
        return `${this._option.prefix}${key}`;
    }

    _getKey(realKey: String): String {
        const len = this._option.prefix.length;
        return realKey.substring(len + 1);
    }

    _isValidKey(key: String): Boolean {
        return new RegExp(`^${this._prefix}-`).test(key);
    }

    getItem(key) {
        const realKey = this._getRealKey(key);
        return this._storage.getItem(realKey);
    }

    setItem(key, value, option: ValueItemOptionType = {preload: true}) {
        this._emitter.emit(key, value);
        this._asyncStorage.setItem(key, value, option);
        this._storage.setItem(key, value, option);
    }

    removeItem(key: String) {
        this._emitter.emit(key);
        this._storage.removeItem(key);
        this._asyncStorage.removeItem(key);
    }

    clear(): Promise {
        const allKeys = this._storage.getAllKeys().map(key => this._getKey(key));
        allKeys.forEach(key => this._emitter.emit(key));
        this._storage.clear();
        this._asyncStorage.clear();
    }

    getAllKeys(): Promise {
        return this._storage.getAllKeys().map(key => this._getKey(key));
    }

    getKeys(pattern: RegExp) {
        const allKeys = this.getAllKeys();
        if (pattern) {
            return allKeys.filter(key => pattern.test(key));
        }
        return allKeys;
    }

    multiRemove(keys: Array) {
        keys.forEach(key => this._emitter.emit(key));
        this._storage.multiRemove(keys);
        this._asyncStorage.multiRemove(keys);
    }

    multiSet(keyValuePairs) {
        keyValuePairs.forEach(([key, value]) => this._emitter.emit(key, value));
        this._storage.multiSet(keyValuePairs);
        this._asyncStorage.multiSet(keyValuePairs);
    }

    multiGet(keys: Array) {
        return this._storage.multiGet(keys);
    }


    async search(pattern): Promise {
        return this._storage.search(pattern);
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
    connect(keys, mapStateToProps) {
        return {
            scope: this,
            keys,
            mapStateToProps
        };
    }
}