import * as util from "./util.ts";
// @deno-types="https://unpkg.com/tweetnacl/nacl.d.ts"
import nacl from "https://jspm.dev/tweetnacl";
// @deno-types="https://unpkg.com/tweetnacl-util/nacl-util.d.ts"
import naclUtil from "https://jspm.dev/tweetnacl-util"
function encrypt(pusher, channel, data) {
    if (pusher.config.encryptionMasterKey === undefined) {
        throw new Error("Set encryptionMasterKey before triggering events on encrypted channels");
    }
    const nonceBytes = nacl.randomBytes(24);
    const ciphertextBytes = nacl.secretbox(naclUtil.decodeUTF8(JSON.stringify(data)), nonceBytes, pusher.channelSharedSecret(channel));
    return JSON.stringify({
        nonce: naclUtil.encodeBase64(nonceBytes),
        ciphertext: naclUtil.encodeBase64(ciphertextBytes),
    });
}
function ensureJSON(data) {
    return typeof data === "string" ? data : JSON.stringify(data);
}
export const trigger = function (pusher, channels, eventName, data, socketId) {
    if (channels.length === 1 && util.isEncryptedChannel(channels[0])) {
        const channel = channels[0];
        const event = {
            name: eventName,
            data: encrypt(pusher, channel, data),
            channels: [channel],
        } as any;
        if (socketId) {
            event.socket_id = socketId;
        }
        return pusher.post({ path: "/events", body: event });
    }
    else {
        for (let i = 0; i < channels.length; i++) {
            if (util.isEncryptedChannel(channels[i])) {
                // For rationale, see limitations of end-to-end encryption in the README
                throw new Error("You cannot trigger to multiple channels when using encrypted channels");
            }
        }
        const event = {
            name: eventName,
            data: ensureJSON(data),
            channels,
            socketId,
        } as any;
        if (socketId) {
            event.socket_id = socketId;
        }
        return pusher.post({ path: "/events", body: event });
    }
};
export const triggerBatch = function (pusher, batch) {
    for (let i = 0; i < batch.length; i++) {
        batch[i].data = util.isEncryptedChannel(batch[i].channel)
            ? encrypt(pusher, batch[i].channel, batch[i].data)
            : ensureJSON(batch[i].data);
    }
    return pusher.post({ path: "/batch_events", body: { batch } });
};
