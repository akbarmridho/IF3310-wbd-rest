import {users} from "../database/schema"
import {JWT_ALGORITHM, getSecret} from "../config/jwt"
import {sign} from "jsonwebtoken"

export const signJwtToken = (userid: number, expiresIn?: number | string): string => {
    const payload = {
        id: userid
    }
    
    if (expiresIn === undefined) {
        return sign(payload, getSecret(), {
            algorithm: JWT_ALGORITHM
        });
    } else {
        return sign(payload, getSecret(), {
            algorithm: JWT_ALGORITHM,
            expiresIn
        })
    }
}