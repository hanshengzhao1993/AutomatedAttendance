import db from './index';

exports.addToClass =  async (req, res, next) => {
  try {
    const { studentUserName, selectedClass, imageLink } = req.body

    const addUserClass = `INSERT INTO class_user (class_id, user_id) 
    SELECT classes.classes_id, users.users_id FROM classes, users 
    WHERE users.user_name='${studentUserName}' 
    AND classes.class_name='${selectedClass}'`;

    const updateUser = `UPDATE users SET photo='${imageLink}' 
    WHERE user_name='${studentUserName}';`

    await db.queryAsync(updateUser);
    await db.queryAsync(addUserClass);
    next();
  } catch (err) {
    res.status(500).send(err);
  }
};