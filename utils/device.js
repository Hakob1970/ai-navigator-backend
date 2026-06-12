async function checkDevice(pool, email, deviceId) {
  const result = await pool.query(
    `SELECT 1 FROM user_devices WHERE email=$1 AND device_id=$2`,
    [email, deviceId]
  );

  return result.rowCount > 0;
}

module.exports = { checkDevice };
