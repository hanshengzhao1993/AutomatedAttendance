import AttendanceQueries from '../QuerySelectors/AttendanceQueries';
import Promise from 'bluebird';
import db from '../index.js';
import { sendAbsentEmails, sendWarningEmails } from '../../mailgun/mailgunHelpers';
import StudentQueries from '../QuerySelectors/StudentQueries'
import moment from 'moment';


Promise.promisifyAll(db);

const StudentQuery = new StudentQueries();

export default class AttendanceModel extends AttendanceQueries {

  constructor() {
    super();
  }

  async getStudentRecord(email) {
    const queryString = super.studentAttendance(email);
    return await db.queryAsync(queryString);
  }

  async getAllRecords() {
    const queryString = super.allAttendance();
    return await db.queryAsync(queryString);
  }

  // todo: find a way to parse dates for a common time, stores duplicate records after 5pm PDT
  async storeRecords(classes, time) {
    const userListQuery = super.usersByClass(classes);
    const [users] = await db.queryAsync(userListQuery);
    users.forEach(async (user) => {
      let insertQuery = super.insertRecord(user.users_id, time);
      let userDateQuery = super.userRecordDate(user.users_id);
      let [userDate] = await db.queryAsync(userDateQuery);
      if (userDate.length) {
        let existingDay = moment(userDate[0].cutoff_time).format('YYYY-MM-DD');
        let currentDay = moment().format('YYYY-MM-DD');
        if (existingDay !== currentDay) {
          db.queryAsync(insertQuery);  
        }
      } else {
        db.queryAsync(insertQuery);
      }
    });
  }

  async emailLateStudents() {
    const getLateUsersQuery = super.getPendingUsers();
    const getAllLateEmailsQuery = super.getAllLateUserEmails();
    const [users] = await db.queryAsync(getLateUsersQuery);
    users.forEach(async (user) => {
      let lateQuery = super.pendingToAbsent(user.user_id);
      await db.queryAsync(lateQuery);
    });
    const [emails] = await db.queryAsync(getAllLateEmailsQuery);
    await sendAbsentEmails(emails);
  }

  async deleteRecordDate({ date }) {
    const deleteQuery = super.deleteRecordByDay(date);
    await db.queryAsync(deleteQuery);
  }

  async emailWarningStudents() {
    let arrayOfUser = [];
    const getPendingUsersQuery = super.getPendingUsers();
    const [ users ] = await db.queryAsync(getPendingUsersQuery);

    await Promise.all(users.map(async (user) => {
      const userQuery = StudentQuery.getStudentInformation(user.user_id)
      const [ userInfo ] = await db.queryAsync(userQuery);
      arrayOfUser.push(userInfo);
    }));

    await sendWarningEmails(arrayOfUser);
  }
  async updateAttendanceStatus({ selectedDate, selectedStudent, selectedStatus }) {
    const selectedName = selectedStudent.value;
    const timeString = selectedDate.slice(0,10);
    const getQuery = super.updateUserStatus(selectedName, timeString, selectedStatus);
    await db.queryAsync(getQuery);
  }
}


