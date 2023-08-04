export declare function executeStrJs(str: string, out_function?: string[]): {};
export declare function getResponseBody<T = any>(code: number, message: string, data?: T | null): {
    code: number;
    data: T | null;
    message: string;
};
