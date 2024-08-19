import * as crypto from "crypto";

const sanitizeString = (s, min, max) => {
  if (s.length < min || s.length > max) return "";
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (
      !(
        (c >= "a" && c <= "z") ||
        (c >= "A" && c <= "Z") ||
        (c >= "0" && c <= "9") ||
        c == "-" ||
        c == "_"
      )
    )
      return "";
  }
  return s;
};

const hash = (s, salt) => {
  return crypto.pbkdf2Sync(s, salt, 11235, 64, "sha256").toString("base64");
};

const createUser = (username, password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    username: username,
    hash: crypto.pbkdf2Sync(password, salt, 11235, 64, "sha256").toString("base64"),
    salt: salt,
  };
};

export { sanitizeString, hash, createUser };
