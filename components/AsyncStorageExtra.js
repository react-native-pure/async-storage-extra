import {EventEmitter} from "fbemitter"
import type {ConnectItemType, IStorage, StorageOption} from "./Types";
import Storage from "./Storage";
import EnhancedAsyncStorage from "./EnhancedAsyncStorage";
import equal from "fast-deep-equal"

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

    setItem(key, value) {
        const old = this.getItem(key);
        if (!equal(old, value)) {
            this._emitter.emit(key, value);
            const realKey = this._getRealKey(key);
            this._asyncStorage.setItem(realKey, value);
            this._storage.setItem(realKey, value);
        }
    }

    multiSet(keyValuePairs) {
        const keys = keyValuePairs.map(([key, value]) => key);
        const olds = this.multiGet(keys);
        const nextKeyValuePairs = keyValuePairs.filter(([key, value]) => {
            const oldKeyValue = olds.find(([oKey, oValue]) => oKey === key);
            if (oldKeyValue) {
                return equal(value, oldKeyValue[1]) ? false : true
            }
            return true;
        });
        if (nextKeyValuePairs.length > 0) {
            nextKeyValuePairs.forEach(([key, value]) => this._emitter.emit(key, value));
            const next = nextKeyValuePairs.map(([key, value]) => [this._getRealKey(key), value]);
            this._storage.multiSet(next);
            this._asyncStorage.multiSet(next);
        }
    }

    removeItem(key: String) {
        this._emitter.emit(key);
        const realKey = this._getRealKey(key);
        this._storage.removeItem(realKey);
        this._asyncStorage.removeItem(realKey);
    }

    multiRemove(keys: Array) {
        keys.forEach(key => this._emitter.emit(key));
        const realKeys = keys.map(key => this._getRealKey(key));
        this._storage.multiRemove(realKeys);
        this._asyncStorage.multiRemove(realKeys);
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
     */
    once(key, callback) {
        return this._emitter.once(key, callback);
    }

    /**
     * 移除key/value的所有监听
     */
    removeAllListeners(key) {
        return this._emitter.removeAllListeners(key);
    }

    /**
     * connect storage
     */
    connect(keys, mapStateToProps): ConnectItemType {
        return {
            scope: this,
            keys,
            mapStateToProps
        };
    }

    /**
     * 将AsyncStorage中的数据恢复到内存中
     */
    async restore() {
        const allKeys = await this._asyncStorage.getAllKeys();
        const keyValuePairs = await this._asyncStorage.multiGet(allKeys);
        this._storage.multiSet(keyValuePairs);
        this._option.onPreload && this._option.onPreload(this);
    }

    /**
     * 释放掉内存中的数据
     */
    release() {
        this._storage.clear();
    }
}