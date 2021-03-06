import { createHash } from "https://deno.land/std@0.77.0/hash/mod.ts";
function toOrderedArray(map) {
    return Object.keys(map)
        .map(function (key) {
        return [key, map[key]];
    })
        .sort(function (a, b) {
        if (a[0] < b[0]) {
            return -1;
        }
        if (a[0] > b[0]) {
            return 1;
        }
        return 0;
    })
        .map(function (pair) {
        return pair[0] + "=" + pair[1];
    });
}
function getMD5(body) {
    return createHash("md5").update(body).toString("hex");
}
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (const i in a) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
function isEncryptedChannel(channel) {
    return channel.startsWith("private-encrypted-");
}
export { toOrderedArray };
export { getMD5 };
export { secureCompare };
export { isEncryptedChannel };
