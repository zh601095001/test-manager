import {IUser} from "../models/User";
import jwt from "jsonwebtoken";
import config from "../config/default"

const generateToken = (user: IUser) => {
    const accessToken = jwt.sign({sub: user._id, roles: user.roles}, config.JWT_SECRET, {expiresIn: '15m'});
    user.refreshToken = jwt.sign({sub: user._id}, config.REFRESH_SECRET, {expiresIn: '7d'});
    user.save();
    return accessToken;
};
export {
    generateToken
}