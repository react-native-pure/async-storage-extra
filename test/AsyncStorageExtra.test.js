jest.mock("react-native")
import "../__tests__/AsyncStorage.mock"
import AsyncStorageExtra from "../index"

describe(`test Storage`, () => {
    const storage = new AsyncStorageExtra();
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
})