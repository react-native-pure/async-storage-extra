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
            clear: jest.fn(() => {
                _value = {};
                return Promise.resolve();
            }),
            multiSet: jest.fn((keyValuePairs) => {
                keyValuePairs.forEach(([key, value]) => _value[key] = value);
                return Promise.resolve();
            }),
            multiGet: jest.fn((keys) => {
                return Promise.resolve(keys.map(key => [key, _value[key]]));
            }),
            removeItem: jest.fn((key) => {
                delete _value[key];
                return Promise.resolve();
            }),
            multiRemove: jest.fn((keys) => {
                keys.forEach(key => delete _value[key]);
                return Promise.resolve();
            }),
            getAllKeys: jest.fn(() => {
                return Promise.resolve(Object.keys(_value));
            })
        }
    }
})