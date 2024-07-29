import jwt from "jsonwebtoken";
import config from "../config";

const shouldGenerateNewRefreshToken = (user: IUser, currentRefreshToken: string): boolean => {
    if (!currentRefreshToken) return false;
    let isTokenValid = false;

    if (user.refreshTokens && user.refreshTokens.length > 0) {
        console.log(user.refreshTokens)
        user.refreshTokens = user.refreshTokens.filter(token => {
            if (token === currentRefreshToken) {
                // 解码刷新令牌，检查是否在2天内
                const decodedToken = jwt.decode(token);
                if (decodedToken && typeof decodedToken === 'object' && 'iat' in decodedToken) {
                    if (!decodedToken.iat) {
                        return false;
                    }
                    const currentTime = Math.floor(Date.now() / 1000);
                    const tokenAge = currentTime - decodedToken.iat;
                    const twoDaysInSeconds = 2 * 24 * 60 * 60;

                    // 如果令牌在2天内有效
                    if (tokenAge < twoDaysInSeconds) {
                        isTokenValid = true;
                        return true; // 保留此令牌
                    } else {
                        return false
                    }
                }
            }
            return true;
        });
    }
    return !isTokenValid;
}

const generateToken = async (
    {
        user,
        currentRefreshToken = "",
        forceRefreshToken = false
    }: {
        user: IUser,
        currentRefreshToken?: string,
        forceRefreshToken?: boolean
    }
) => {
    const accessToken = jwt.sign({sub: user._id, roles: user.roles}, config.JWT_SECRET, {expiresIn: '15m'});
    let newRefreshToken = currentRefreshToken;

    if (forceRefreshToken || shouldGenerateNewRefreshToken(user, currentRefreshToken)) {
        console.log("刷新")
        newRefreshToken = jwt.sign({sub: user._id}, config.REFRESH_SECRET, {expiresIn: '7d'});
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(newRefreshToken);
        const MAX_REFRESH_TOKENS = 5;
        if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
            user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
        }
        await user.save();
    }

    return {accessToken, newRefreshToken};
};

export {
    generateToken
};
