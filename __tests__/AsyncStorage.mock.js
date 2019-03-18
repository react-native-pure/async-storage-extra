jest.mock("react-native", () => {
    let _value = {};
    return {
        AsyncStorage: {
            setItem: jest.fn((key, value) => {
                _value[key] = value;
                return Promise.resolve();
            }),
            getItem: jest.fn((key) => {
                return Promise.resolve(_value[key]);
            }),
            clear: jest.fn(),
            multiSet: jest.fn(),
            multiGet: jest.fn(),
            removeItem: jest.fn(),
            multiRemove: jest.fn(),
            getAllKeys: jest.fn()
        }
    }
})