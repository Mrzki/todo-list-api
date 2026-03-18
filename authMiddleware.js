const jwt = require("jsonwebtoken");

const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ pesan: "Akses ditolak! Kamu belum login (Token tidak ada)." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userDecoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDecoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ pesan: "Token tidak valid atau sudah kedaluwarsa!" });
  }
};

module.exports = { verifikasiToken };
