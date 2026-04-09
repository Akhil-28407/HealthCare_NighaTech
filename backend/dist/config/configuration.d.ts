declare const _default: (() => {
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    jwt: {
        secret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    frontendUrl: string;
    backendUrl: string;
    sms: {
        baseUrl: string;
        secret: string;
        sender: string;
        tempid: string;
        route: string;
        msgType: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    jwt: {
        secret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    frontendUrl: string;
    backendUrl: string;
    sms: {
        baseUrl: string;
        secret: string;
        sender: string;
        tempid: string;
        route: string;
        msgType: string;
    };
}>;
export default _default;
