export type StorageOption = {
    /**
     * key前缀
     */
    prefix?: string,
    /**
     * 是否预加载到内存中
     */
    preload?: boolean
};

export type ValueItemOptionType = {
    /**
     * 是否允许预加载
     */
    preload?: boolean
};

export type ValueItemType = {
    /**
     * 值的类型
     */
    type: string,
    /**
     * 值
     */
    value: string
};

export interface IStorage {
    getItem(key: string): any,

    setItem(key: string, value: any, option?: ValueItemOptionType): void,

    removeItem(key: string): void,

    clear(): void,

    getAllKeys(): Array<string>,

    multiRemove(keys: Array<string>): void,

    multiSet(keyValuePairs: Array<Array>): void,

    multiGet(keys: Array<string>): Array<Array>,

    search(pattern: RegExp): Array
}