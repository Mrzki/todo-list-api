const pool = require("./db");

const dapatkanSemuaTodo = async (userId) => {
  const query = "SELECT * FROM todos WHERE user_id = $1 ORDER BY id ASC";
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const tambahTodo = async (tugas, userId) => {
  const query =
    "INSERT INTO todos (tugas, user_id) VALUES ($1, $2) RETURNING *";
  const result = await pool.query(query, [tugas, userId]);
  return result.rows[0];
};

const hapusTodo = async (id, userId) => {
  const query = "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *";
  const result = await pool.query(query, [id, userId]);
  if (result.rowCount === 0) {
    return false;
  } else {
    return result.rows[0];
  }
};

const ubahTodo = async (id, tugas, selesai, userId) => {
  let result = null;
  if (tugas === undefined) {
    const query =
      "UPDATE todos SET selesai = $1 WHERE id = $2 AND user_id = $3 RETURNING *";
    result = await pool.query(query, [selesai, id, userId]);
  } else if (selesai === undefined) {
    const query =
      "UPDATE todos SET tugas = $1 WHERE id = $2 AND user_id = $3 RETURNING *";
    result = await pool.query(query, [tugas, id, userId]);
  } else {
    const query =
      "UPDATE todos SET tugas = $1, selesai = $2 WHERE id = $3 AND user_id = $4 RETURNING *";
    result = await pool.query(query, [tugas, selesai, id, userId]);
  }
  if (result.rowCount === 0) {
    return false;
  }
  return result.rows[0];
};

module.exports = {
  dapatkanSemuaTodo,
  tambahTodo,
  hapusTodo,
  ubahTodo,
};
