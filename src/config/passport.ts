import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import env, { EnvKey } from "./env";


passport.use(new GoogleStrategy({
    clientID: env(EnvKey.OAUTH_CLIENT_ID)!,
    clientSecret: env(EnvKey.OAUTH_CLIENT_SECRET)!,
    callbackURL: env(EnvKey.ENV_TYPE) == "dev" ? 'http://localhost:3000/api/v1/auth/google/callback' : "https://lucis-api.onrender.com/api/v1/auth/google/callback",
}, (accessToken: any, refreshToken: any, profile: any, done: any) => {
    // console.log('Profile:', profile);
    return done(null, profile);
}));
// Serialize and deserialize user for session management
passport.serializeUser((user: any, done: any) => {
    done(null, user);
});
passport.deserializeUser((user: any, done: any) => {
    done(null, user);
});

export default passport;