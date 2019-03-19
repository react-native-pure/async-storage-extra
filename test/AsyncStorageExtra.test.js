jest.mock("react-native")
import "../__tests__/AsyncStorage.mock"
import AsyncStorageExtra from "../index"

describe(`test Storage`, () => {
    const storage = new AsyncStorageExtra();
    test(`restore`, (callback) => {
        new AsyncStorageExtra({
            onPreload: (self) => {
                const oldNumber = self.getItem("old_number");
                const oldString = self.getItem("old_string");
                const oldDate = self.getItem("old_date");
                expect(oldNumber).toBe(1);
                expect(oldString).toBe("hello");
                expect(oldDate.getFullYear()).toBe(2010);
                callback();
            }
        });
    });
    test(`setItem/getItem a number`, async () => {
        const key = "test_number";
        const value = 123
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(result).toBe(value);
        expect(typeof result).toBe("number")
    });
    test(`setItem/getItem NaN`, async () => {
        const key = "test_nan";
        const value = NaN;
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(isNaN(result));
        expect(typeof result).toBe("number");
    });
    test(`setItem/getItem a string`, async () => {
        const key = "test_string";
        const value = "abc";
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(result).toBe(value);
        expect(typeof result).toBe("string");
    });
    test(`getItem is null from a invalid key`, async () => {
        const key = Math.random().toString();
        const value = await storage.getItem(key);
        expect(value ? true : false).toBe(false);
    });
    test(`setItem/getItem a date`, async () => {
        const key = "test_date";
        const value = new Date();
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(result instanceof Date);
        expect(result.valueOf()).toBe(value.valueOf());
    });
    test(`setItem/getItem null`, async () => {
        const key = "test_null";
        const value = null;
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        // expect(result).toBeNull();
        expect(result).toBeNull();
    });
    test(`setItem/getItem a array`, async () => {
        const key = "test_array";
        const value = [1, 2];
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(typeof value).toBe("object");
        expect(result.length).toBe(2)
        expect(result[0]).toBe(value[0]);
    });
    test(`setItem/getItem a object`, async () => {
        const key = "test_object";
        const value = {
            name: "abc"
        }
        await storage.setItem(key, value);
        const result = await storage.getItem(key);
        expect(typeof result).toBe("object");
        expect(result.name).toBe(value.name);
    });
    test(`removeItem`, () => {
        const key = "abc";
        const value = 123;
        storage.setItem(key, value);
        const getValue = storage.getItem(key);
        expect(getValue).toBe(value);
        storage.removeItem(key);
        const nextGetValue = storage.getItem(key);
        expect(nextGetValue).toBeUndefined();
    });
    test(`clear`, () => {
        const key = "abc";
        const value = 123;
        storage.setItem(key, value);
        const getValue = storage.getItem(key);
        expect(getValue).toBe(value);
        storage.clear();
        const allKeys = storage.getAllKeys();
        expect(allKeys.length).toBe(0);
    });
    test(`getKeys`, () => {
        const key = "abc";
        const value = 123;
        storage.setItem(key, value);
        const findKey = storage.getKeys(/^a/);
        expect(findKey.length).toBe(1);
        expect(findKey[0]).toBe(key);
    });
    test(`search`, () => {
        storage.setItem("abc", 1);
        storage.setItem("def", 2);
        storage.setItem("ghi", 3);
        const result = storage.search(/^(a|d)/);
        expect(result.length).toBe(2);
        expect(result[0][0]).toBe("abc");
        expect(result[0][1]).toBe(1);
        expect(result[1][0]).toBe("def");
        expect(result[1][1]).toBe(2);
    });
    test(`multiSet/multiGet`, () => {
        storage.multiSet([
            ["key1", 1],
            ["key2", 2],
            ["key3", 3]
        ]);
        const keyValuePairs = storage.multiGet(["key1", "key2", "key3"]);
        expect(keyValuePairs.length).toBe(3);
        expect(keyValuePairs[0][0]).toBe("key1");
        expect(keyValuePairs[0][1]).toBe(1);
    });
    test(`listen`, () => {
        const key1Callback = jest.fn();
        storage.addListener("key1", key1Callback);
        const key2Callback = jest.fn();
        storage.once("key2", key2Callback);
        storage.setItem("key1", 1);
        storage.removeItem("key1");
        storage.setItem("key2", 2);
        storage.removeItem("key2");
        storage.multiSet([
            ["key1", 1],
            ["key2", 2]
        ]);
        expect(key1Callback.mock.calls.length).toBe(3);
        expect(key2Callback.mock.calls.length).toBe(1);
        storage.removeAllListeners("key1");
        storage.setItem("key1", 3);
        expect(key1Callback.mock.calls.length).toBe(3);
    });
})