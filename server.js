const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const {
  dapatkanSemuaTodo,
  tambahTodo,
  hapusTodo,
  ubahTodo,
} = require("./todoService");
const { registerUser, loginUser } = require("./authService");
const { verifikasiToken } = require("./authMiddleware");

const port = process.env.PORT || 3000;

app.get("/todos", verifikasiToken, async (req, res) => {
  const userId = req.user.id;
  const todos = await dapatkanSemuaTodo(userId);
  res.json(todos);
});

app.post("/todos", verifikasiToken, async (req, res) => {
  console.log("Yang lagi nambah tugas adalah:", req.user.username);
  const { tugas } = req.body;
  const userId = req.user.id;
  if (!tugas) {
    return res.status(400).json({ pesan: "Nama tugas tidak boleh kosong!" });
  }
  const todoBaru = await tambahTodo(tugas, userId);
  res.status(201).json({
    pesan: "todo berhasil ditambahkan!",
    data: todoBaru,
  });
});

app.delete("/todos/:id", verifikasiToken, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;
  const berhasil = await hapusTodo(id, userId);
  if (!berhasil) {
    res.status(404).json({ pesan: `Todo dengan id: ${id} tidak ditemukan` });
  } else {
    res.status(200).json({
      pesan: `Todo dengan id: ${id} berhasil dihapus!`,
      data: berhasil,
    });
  }
});

app.put("/todos/:id", verifikasiToken, async (req, res) => {
  const id = Number(req.params.id);
  const { tugas, selesai } = req.body;
  const userId = req.user.id;

  if (tugas === undefined && selesai === undefined) {
    return res.status(400).json({
      pesan: "Minimal kirim tugas atau status selesai yang mau diubah!",
    });
  }

  const berhasil = await ubahTodo(id, tugas, selesai, userId);
  if (!berhasil) {
    res.status(404).json({ pesan: `Todo dengan id: ${id} tidak ditemukan` });
  } else {
    res
      .status(200)
      .json({ pesan: `Todo dengan id: ${id} berhasil diubah`, data: berhasil });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ pesan: "Username dan password wajib diisi!" });
  }

  const result = await registerUser(username, password);

  if (result.error) {
    return res.status(400).json({ pesan: result.error });
  }

  res.status(201).json({
    pesan: "Registrasi berhasil!",
    user: result.data,
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ pesan: "Username dan password wajib diisi!" });
  }

  const result = await loginUser(username, password);

  if (result.error) {
    return res.status(401).json({ pesan: result.error });
  }

  res.status(200).json({
    pesan: "Login berhasil!",
    token: result.data.token,
  });
});

app.listen(port, () => {
  console.log(`Server sedang berjalan di http://localhost:${port}`);
});

module.exports = app;
