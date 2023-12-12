export function getValueFromKeyIfTypeCompatibleMandatory<T>(key: string, jsonObject: {[key: string]: any}, type: any, isArray: boolean = false): T {
    if (!jsonObject.hasOwnProperty(key)) {
        throw new Error('Missing key "' + key + '" in input');
    }
    return <T>getValueFromKeyIfTypeCompatible<T>(key, jsonObject, type, isArray);
}

export function getValueFromKeyIfTypeCompatible<T>(key: string, jsonObject: {[key: string]: any}, type: any, isArray: boolean = false): T|undefined {
    if (jsonObject[key] === undefined) {
        return undefined;
    }
    if (isArray) {
        try {
            return jsonObject[key].map((iteration: any) => getValueFromKeyIfTypeCompatible<T>('key', {key: iteration}, type));
        } catch (e) {
            throw e;
        }
    }
    if (typeof type !== 'function') {
        if (typeof jsonObject[key] !== type) {
            try {
                if (type === 'number') {
                    const ret = Number(jsonObject[key]);
                    if (isNaN(ret)) { throw new Error(); }
                    return <T><unknown>ret;
                }
                if (type === 'boolean') {
                    const ret = Boolean(JSON.parse(typeof jsonObject[key] === 'string' ? jsonObject[key].toLowerCase() : jsonObject[key]));
                    return <T><unknown>ret;
                }
                if (typeof type === 'object') {
                    if (Object.values(type).slice(Object.values(type).length / 2).every(value => typeof value === 'number')) {
                        const ret = Number(jsonObject[key]);
                        if (isNaN(ret)) { throw new Error(); }
                        return <T><unknown>ret;
                    }
                }
                if (type === 'string') {
                    return <T><unknown>String(jsonObject[key]);
                }
            } catch (e) {
                throw new Error('Wrong type for key "' + key + '", should be: ' + type);
            }
        }
    } else if (!(jsonObject[key] instanceof type)) {
        try {
            if (type === Date) {
                let val = jsonObject[key];
                if (!isNaN(Number(val))) {
                    val = Number(val);
                }
                const ret = new Date(val);
                if (isNaN(ret.getTime())) { throw new Error(); }
                return <T><unknown>ret;
            }
        } catch (e) {
            throw new Error('Wrong type for key "' + key + '", should be: ' + type);
        }
    }
    return <T>jsonObject[key];
}
