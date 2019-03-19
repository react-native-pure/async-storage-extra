import {AsyncStorage} from "react-native"
import type {IStorage, ValueItemType} from "./Types";

export default class EnhancedAsyncStorage implements IStorage {

    /**
     * 还原AsyncStorage中保存的真正的value
     * @param value - JSON.stringify(ValueItemType)
     * @returns {*}
     * @private
     */
    _restore(value: string): any {
        if (value) {
            const item: ValueItemType = JSON.parse(value);
            switch (item.type) {
                case "date":
                    return new Date(JSON.parse(item.value));
                case "number":
                    return parseFloat(item.value);// new Number(item.value);
                case "string":
                    return item.value;
                default:
                    return JSON.parse(item.value);
            }
        }
        return null;
    }

    /**
     * 将需要保存的值进行格式化处理
     * @param value -  是需要保存的值
     * @returns {string}
     * @private
     */
    _save(value: any): string {
        const item: ValueItemType = {
            type: typeof value,
            value: JSON.stringify(value)
        };
        return JSON.stringify(item);
    }

    async getItem(key) {
        const value = await AsyncStorage.getItem(key);
        return this._restore(value);
    }

    setItem(key, value) {
        return AsyncStorage.setItem(key, this._save(value));
    }

    removeItem(key) {
        return AsyncStorage.removeItem(key);
    }

    clear() {
        return AsyncStorage.clear();
    }

    getAllKeys() {
        return AsyncStorage.getAllKeys();
    }

    multiRemove(keys) {
        return AsyncStorage.multiRemove(keys);
    }

    multiSet(keyValuePairs) {
        const next = keyValuePairs.map(([key, value, option]) => {
            return [key, this._save(value, option)]
        });
        return AsyncStorage.multiSet(next);
    }

    async multiGet(keys) {
        const keyValuePairs = await AsyncStorage.multiGet(keys);
        const keyItemPairs = keyValuePairs.map(([key, value]) => {
            return [key, this._restore(value)];
        });
        return keyItemPairs;
    }

    async search(pattern) {
        const allKeys = await this.getAllKeys();
        const matchKeys = allKeys.filter(key => pattern.test(key));
        return this.multiGet(matchKeys);
    }
}