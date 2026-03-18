const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (username, passwordAsli) => {
  const cekQuery = "SELECT * FROM users WHERE username = $1";
  const cekResult = await pool.query(cekQuery, [username]);

  if (cekResult.rowCount > 0) {
    return { error: "Username sudah terdaftar!" };
  }

  const hashedPassword = await bcrypt.hash(passwordAsli, 10);

  const insertQuery =
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
  const insertResult = await pool.query(insertQuery, [
    username,
    hashedPassword,
  ]);

  return { data: insertResult.rows[0] };
};

const loginUser = async (username, passwordKetik) => {
  const query = "SELECT * FROM users WHERE username = $1";
  const result = await pool.query(query, [username]);

  if (result.rowCount === 0) {
    return { error: "Username tidak terdaftar!" };
  }

  const user = result.rows[0];

  const passwordCocok = await bcrypt.compare(passwordKetik, user.password);

  if (!passwordCocok) {
    return { error: "Password salah, Bos!" };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { data: { token, username: user.username } };
};

module.exports = { registerUser, loginUser };
