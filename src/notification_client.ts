import * as requests from "./requests.ts";
import NotificationConfig from "./notification_config.ts";

class NotificationClient {
	public config: any;

    constructor(options) {
        this.config = new NotificationConfig(options);
    }

    notify(interests, notification) {
        if (!Array.isArray(interests)) {
            throw new Error("Interests must be an array");
        }
        if (interests.length == 0) {
            throw new Error("Interests array must not be empty");
        }
        const body = Object.assign({ interests }, notification);
        return requests.send(this.config, {
            method: "POST",
            body,
            path: "/notifications",
        });
    }
}

export default NotificationClient;
