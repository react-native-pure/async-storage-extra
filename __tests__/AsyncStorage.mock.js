jest.mock("react-native", () => {
    let _value = {
        "@storageold_number": JSON.stringify({type: "number", value: JSON.stringify(1)}),
        "userold_number": JSON.stringify({type: "number", value: JSON.stringify(1)}),
        "@storageold_string": JSON.stringify({type: "string", value: "hello"}),
        "@storageold_date": JSON.stringify({type: "date", value: JSON.stringify(new Date("2010-01-01 00:00:00"))}),
    };
    return {
        AsyncStorage: {
            setItem: jest.fn((key, value) => {
                return new Promise((resolve) => {
                    _value[key] = value;
                    setTimeout(resolve, 1);
                });
            }),
            getItem: jest.fn((key) => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(_value[key]), 1);
                });
            }),
            clear: jest.fn(() => {
                return new Promise((resolve) => {
                    _value = {};
                    setTimeout(resolve, 1);
                });
            }),
            multiSet: jest.fn((keyValuePairs) => {
                return new Promise((resolve) => {
                    keyValuePairs.forEach(([key, value]) => _value[key] = value);
                    setTimeout(resolve, 1);
                });
            }),
            multiGet: jest.fn((keys) => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(keys.map(key => [key, _value[key]])), 1);
                })
            }),
            removeItem: jest.fn((key) => {
                return new Promise((resolve) => {
                    delete _value[key];
                    setTimeout(resolve, 1);
                });
            }),
            multiRemove: jest.fn((keys) => {
                return new Promise((resolve) => {
                    keys.forEach(key => delete _value[key]);
                    setTimeout(resolve, 1);
                });
            }),
            getAllKeys: jest.fn(() => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(Object.keys(_value)), 1);
                })
            })
        }
    }
})