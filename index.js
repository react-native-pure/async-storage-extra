import {AsyncStorage} from "react-native"
import {EventEmitter} from "fbemitter"

/**
 * AsyncStorage扩展
 */
export default class AsyncStorageExtra {
    constructor(prefix: String = "ibuild") {
        this._prefix = prefix
        this._emitter = new EventEmitter();
    }

    /**
     * 根据当前Storage的key值生成AsyncStorage真正对应的key
     * @param key
     * @returns {string}
     * @private
     */
    _generateAsyncStorageKey(key: String): String {
        return `${this._prefix}-${key}`;
    }

    /**
     * 根据AsyncStorage的key值获取当前Storage的key
     * @param asyncStorageKey
     * @returns {string}
     * @private
     */
    _getKey(asyncStorageKey: String): String {
        const len = this._prefix.length;
        return asyncStorageKey.substring(len + 1);
    }

    /**
     * 测试key是否是当前Storage的key
     * @param key
     * @returns {boolean}
     * @private
     */
    _isValidKey(key: String): Boolean {
        return new RegExp(`^${this._prefix}-`).test(key);
    }

    /**
     * 获取对应key的值
     * @param key
     * @returns {Promise<*>}
     */
    async getItem(key: String, defaultValue): Promise {
        const realKey = this._generateAsyncStorageKey(key);
        const str = await AsyncStorage.getItem(realKey);
        // console.log(`AsyncStorage getItem key:${realKey},value=${str}`);
        if (str) {
            const {type, value} = JSON.parse(str);
            if (type === "date") {
                return new Date(JSON.parse(value));
            }
            else if (type === "number") {
                return value === "NaN" ? NaN : JSON.parse(value);
            }
            else if (type === "string") {
                return value;
            }
            else {
                return JSON.parse(value);
            }
        }
        return defaultValue;
    }

    /**
     * 设置多个key/value值
     * @param {Array<String>} keys
     * @returns {Promise<T[]>}
     */
    async multiGet(keys: Array): Promise {
        return Promise.all(keys.map(key => {
            return this.getItem(key);
        }))
    }

    /**
     * 设置item
     * @param key
     * @param value
     * @returns {*}
     */
    setItem(key: String, value: Object | Array | String | Number | Date): Promise {
        this._emitter.emit(key, value);
        let valueType = typeof value;
        let valueStr = "";
        if (value instanceof Date) {
            valueType = "date";
            valueStr = JSON.stringify(value);
        }
        else if (valueType === "object") {
            valueStr = JSON.stringify(value);
        }
        else {
            valueStr = value.toString();
        }
        const realKey = this._generateAsyncStorageKey(key);
        const realValue = JSON.stringify({
            type: valueType,
            value: valueStr
        })
        // console.log(`AsyncStorage setItem key:${realKey},value:${realValue}`);
        return AsyncStorage.setItem(realKey, realValue);
    }

    /**
     * 设置多个item
     * @param {Array} keyValuePairs
     * @param {String} keyValuePairs[].key
     * @param {any} keyValuePairs[].value
     * @returns {Promise<*>}
     */
    multiSet(keyValuePairs): Promise {
        return Promise.all(keyValuePairs.map(({key, value}) => {
            return this.setItem(key, value);
        }))
    }

    /**
     * 移除key/value
     * @param key
     * @returns {*}
     */
    removeItem(key: String): Promise {
        this._emitter.emit(key, null);
        return AsyncStorage.removeItem(this._generateAsyncStorageKey(key));
    }

    /**
     * 获取所有的key
     * @param pattern
     * @returns {Promise<*>}
     */
    async getAllKeys(pattern): Promise {
        const allAsyncStorageKeys = await AsyncStorage.getAllKeys();
        const asyncStorageKeys = allAsyncStorageKeys.filter(asyncStorageKey => this._isValidKey(asyncStorageKey));
        const keys = asyncStorageKeys.map(asyncStorageKey => {
            return this._getKey(asyncStorageKey);
        });
        if (pattern) {
            return keys.filter(f => pattern.test(f));
        }
        return keys;
    }

    /**
     * 清除所有的值
     * @returns {Promise}
     */
    async clear(): Promise {
        const allAsyncStorageKeys = await AsyncStorage.getAllKeys();
        const asyncStorageKeys = allAsyncStorageKeys.filter(asyncStorageKey => this._isValidKey(asyncStorageKey));
        const keys = asyncStorageKeys.map(asyncStorageKey => this._getKey(asyncStorageKey));
        keys.forEach(key => this._emitter.emit(key, null));
        if (asyncStorageKeys.length > 0) {
            return AsyncStorage.multiRemove(asyncStorageKeys);
        }
        return Promise.resolve();
    }

    /**
     * 移除多个key
     * @param keys
     * @returns {*}
     */
    multiRemove(keys: Array): Promise {
        const realKeys = keys.map(key => {
            this._emitter.emit(key, null);
            return this._generateAsyncStorageKey(key);
        });
        return AsyncStorage.multiRemove(realKeys);
    }

    /**
     * 模糊查找,只要key值包含str就会返回对应的值
     * @returns {Promise}
     * @param pattern
     */
    async search(pattern): Promise {
        const keys = await this.getAllKeys();
        const targetKeys = keys.filter(key => pattern.test(key));
        return this.multiGet(targetKeys);
    }

    /**
     * 监听key/value的变化
     * @param key
     * @param callback
     * @returns {*}
     */
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