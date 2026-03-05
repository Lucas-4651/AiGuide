// ============================================================
//  src/config/passport.js
//  Strategies : Local + Google OAuth + GitHub OAuth
// ============================================================
// NOTE : ce fichier exporte une fonction qui recoit passport
// Usage dans app.js : require('./src/config/passport')(passport)
// ============================================================
const LocalStrategy  = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt         = require('bcryptjs');
const db             = require('./database');

module.exports = (passport) => {

  // Serialisation : on stocke seulement l'id en session
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db('users').where({ id }).first();
      done(null, user || false);
    } catch (e) { done(e); }
  });

  // ── Strategy locale ──────────────────────────────────────
  passport.use('local', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await db('users').where({ email: email.toLowerCase() }).first();
        if (!user)              return done(null, false, { message: 'Email introuvable' });
        if (!user.password_hash) return done(null, false, { message: 'Utilisez OAuth pour ce compte' });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)                return done(null, false, { message: 'Mot de passe incorrect' });
        if (!user.is_active)    return done(null, false, { message: 'Compte desactive' });
        await db('users').where({ id: user.id }).update({ last_login_at: new Date().toISOString() });
        return done(null, user);
      } catch (e) { return done(e); }
    }
  ));

  // ── Strategy Google ──────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID) {
    passport.use('google', new GoogleStrategy({
      clientID    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL : process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db('users').where({ oauth_provider: 'google', oauth_id: profile.id }).first();
        if (!user) {
          const email = profile.emails[0].value;
          user = await db('users').where({ email }).first();
          if (user) {
            await db('users').where({ id: user.id }).update({ oauth_provider: 'google', oauth_id: profile.id });
          } else {
            const [id] = await db('users').insert({
              email,
              username      : profile.displayName,
              oauth_provider: 'google',
              oauth_id      : profile.id,
              avatar_url    : profile.photos[0] ? profile.photos[0].value : null,
              role          : 'user',
              is_active     : true,
              created_at    : new Date().toISOString()
            });
            user = await db('users').where({ id }).first();
          }
        }
        return done(null, user);
      } catch (e) { return done(e); }
    }));
  }

  // ── Strategy GitHub ──────────────────────────────────────
  if (process.env.GITHUB_CLIENT_ID) {
    passport.use('github', new GitHubStrategy({
      clientID    : process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL : process.env.GITHUB_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db('users').where({ oauth_provider: 'github', oauth_id: String(profile.id) }).first();
        if (!user) {
          const email = profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : (profile.username + '@github.noemail');
          const [id] = await db('users').insert({
            email,
            username      : profile.username || profile.displayName,
            oauth_provider: 'github',
            oauth_id      : String(profile.id),
            avatar_url    : profile.photos[0] ? profile.photos[0].value : null,
            role          : 'user',
            is_active     : true,
            created_at    : new Date().toISOString()
          });
          user = await db('users').where({ id }).first();
        }
        return done(null, user);
      } catch (e) { return done(e); }
    }));
  }
};