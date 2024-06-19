import {Request, Response, NextFunction} from 'express';
import {logError} from "../services/errorLogService";

export const errorHandler = (
    err: any,  // 通常错误可以是任何类型，但你可以根据需要使用更具体的类型或自定义错误类型
    req: Request,
    res: Response,
    next: NextFunction  // 即使你在函数中没有使用 `next`, 也需要包括它来符合错误处理中间件的函数签名
): void => {
    console.error(err.stack);  // 记录错误栈
    logError(err, "global")
    res.status(500).send({
        message: err.message,
        stack: err.stack  // 只在开发环境中发送错误堆栈
    });
};
