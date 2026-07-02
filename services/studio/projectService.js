const pool = require("../../../../db/pool");

// =========================
// CREATE PROJECT
// =========================
exports.createProject = async ({ email, type, title }) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO writer_projects (email, type, title, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
      `,
      [email, type, title || "Untitled Project"]
    );

    return result.rows[0];
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    throw new Error("CREATE_PROJECT_FAILED");
  }
};

// =========================
// GET ALL PROJECTS
// =========================
exports.getProjects = async (email) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM writer_projects
      WHERE email = $1
      ORDER BY created_at DESC
      `,
      [email]
    );

    return result.rows;
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    throw new Error("GET_PROJECTS_FAILED");
  }
};

// =========================
// GET PROJECT BY ID
// =========================
exports.getProjectById = async ({ email, id }) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM writer_projects
      WHERE email = $1 AND id = $2
      `,
      [email, id]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error("GET PROJECT BY ID ERROR:", err);
    throw new Error("GET_PROJECT_FAILED");
  }
};

// =========================
// UPDATE PROJECT CONTENT
// =========================
exports.updateProject = async ({ email, id, content }) => {
  try {
    const result = await pool.query(
      `
      UPDATE writer_projects
      SET content = $1, updated_at = NOW()
      WHERE email = $2 AND id = $3
      RETURNING *
      `,
      [content, email, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    throw new Error("UPDATE_PROJECT_FAILED");
  }
};

// =========================
// DELETE PROJECT
// =========================
exports.deleteProject = async ({ email, id }) => {
  try {
    await pool.query(
      `
      DELETE FROM writer_projects
      WHERE email = $1 AND id = $2
      `,
      [email, id]
    );

    return { success: true };
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    throw new Error("DELETE_PROJECT_FAILED");
  }
};
