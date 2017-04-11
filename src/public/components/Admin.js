import React from 'react';
import { Link } from 'react-router-dom';
import { getAttendanceRecords } from './requests/classes';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attendance: [],
      classes: {},
      students: {},
      emails: {},
      statuses: {}
    };
  }

  async componentWillMount() {
    const queryType = {queryType: 'allAttendance'};
    const attendanceRecords = await getAttendanceRecords(queryType);      
    attendanceRecords.forEach((item) => {
      item = this.parseDateAndTime(item);
      if (!this.state.classes[item.class_name]) {
        let thisClass = this.state.classes;
        thisClass[item.class_name] = item.class_name;
        this.setState({
          classes: thisClass
        });
      }
      if (!this.state.statuses[item.status]) {
        let thisStatus = this.state.statuses;
        thisStatus[item.status] = item.status;
        this.setState({
          statuses: thisStatus
        });
      }
      if (!this.state.emails[item.email]) {
        let thisEmail = this.state.emails;
        let thisStudent = this.state.students;
        let fullName = `${item.first_name} ${item.last_name}`;
        thisEmail[item.email] = item.email;
        thisStudent[fullName] = fullName;
        item.full_name = fullName;
        this.setState({
          emails: thisEmail,
          students: thisStudent
        });
      }
    });
    this.setState({attendance: attendanceRecords});
  }

  parseDateAndTime(record) {
    var result = record;
    let timeStartIndex = result.date.indexOf('T');
    let hour = result.date.slice(++timeStartIndex, timeStartIndex + 2) - 7;
    let suffix = 'AM';
    if (hour > 12) {
      hour -= 12;
      suffix = 'PM';
    } else if (hour <= 0) {
      hour += 12;
      suffix = 'PM';
    }
    if (hour === 12) {
      suffix = suffix === 'AM' ? 'PM' : 'AM';
    }
    result.time = `${hour}${result.date.slice(timeStartIndex + 2, timeStartIndex + 8)} ${suffix}`;
    result.date = this.convertDate(result.date.slice(0, 10));
    return result;
  }

  convertDate(date) {
    var year = date.slice(0, 4);
    var month = date.slice(5, 7);
    var day = date.slice(8);
    if (month === '01') {
      month = 'January';
    } else if (month === '02') {
      month = 'February';
    } else if (month === '03') {
      month = 'March';
    } else if (month === '04') {
      month = 'April';
    } else if (month === '05') {
      month = 'May';
    } else if (month === '06') {
      month = 'June';
    } else if (month === '07') {
      month = 'July';
    } else if (month === '08') {
      month = 'August';
    } else if (month === '09') {
      month = 'September';
    } else if (month === '10') {
      month = 'October';
    } else if (month === '11') {
      month = 'November';
    } else if (month === '12') {
      month = 'December';
    }
    if (day.charAt(0) === '0') {
      day = day.slice(1);
    }
    return `${month} ${day}, ${year}`;
  }

  monthToNum(month) {
    if (month === 'January') {
      return 1;
    } else if (month === 'February') {
      return 2;
    } else if (month === 'March') {
      return 3;
    } else if (month === 'April') {
      return 4;
    } else if (month === 'May') {
      return 5;
    } else if (month === 'June') {
      return 6;
    } else if (month === 'July') {
      return 7;
    } else if (month === 'August') {
      return 8;
    } else if (month === 'September') {
      return 9;
    } else if (month === 'October') {
      return 10;
    } else if (month === 'November') {
      return 11;
    } else if (month === 'December') {
      return 12;
    }
  }

  nameSort(a, b, order) {   // order is desc or asc
    // console.log(a);
    console.log('SORT');
    console.log(a);
    console.log(b);
    console.log(a.first_name);
    console.log(b.first_name);
    console.log(a.first_name.localeCompare(b.first_name));
    // console.log(parseInt(b.first_name));
    console.log(a.first_name - b.first_name);
    // var aSpace = a.indexOf(' ');
    // var bSpace = b.indexOf(' ');
    // var aFirst = a.slice(0, aSpace);
    // var bFirst = b.slice(0, bSpace);
    // var aLast = a.slice(aSpace + 1);
    // var bLast = b.slice(bSpace + 1);
    if (order === 'desc') {
      if (a.last_name !== b.last_name) {
        return a.last_name.localeCompare(b.last_name) * -1;
      } else {
        return a.first_name.localeCompare(b.first_name) * -1;
      }
    } else {
      if (a.last_name !== b.last_name) {
        return b.last_name.localeCompare(a.last_name) * -1;
      } else {
        return b.first_name.localeCompare(a.first_name) * -1;
      }
    }
  }
  
  revertSortFunc(a, b, order) {   // order is desc or asc
    var aYear = a.date.slice(a.date.length - 4);
    var bYear = b.date.slice(b.date.length - 4);
    var aMonth = this.monthToNum(a.date.slice(0, a.date.indexOf(' ')));
    var bMonth = this.monthToNum(b.date.slice(0, b.date.indexOf(' ')));
    var aDay = a.date.slice(a.date.indexOf(' ') + 1, a.date.indexOf(','));
    var bDay = b.date.slice(b.date.indexOf(' ') + 1, b.date.indexOf(','));
    if (order === 'desc') {
      if (aYear !== bYear) {
        return aYear - bYear;
      } else if (aMonth !== bMonth) {
        return aMonth - bMonth;
      } else {
        return aDay - bDay;
      }
    } else {
      if (aYear !== bYear) {
        return bYear - aYear;
      } else if (aMonth !== bMonth) {
        return bMonth - aMonth;
      } else {
        return bDay - aDay;
      }
    }
  }

  render() {
    return (
      <div>

        <BootstrapTable data={this.state.attendance} height='250px' scrollTop={'Top'}  multiColumnSort={5} striped hover condensed>
          <TableHeaderColumn dataField='class_name' isKey filterFormatted filter={{type: 'SelectFilter', options: this.state.classes}} dataSort={true}>Class</TableHeaderColumn>
          <TableHeaderColumn dataField='full_name' filterFormatted filter={{type: 'SelectFilter', options: this.state.students}} dataSort sortFunc={this.nameSort}>Name</TableHeaderColumn>
          <TableHeaderColumn dataField='date' filter={{type: 'TextFilter'}} dataSort sortFunc={this.revertSortFunc.bind(this)}>Date</TableHeaderColumn>
          <TableHeaderColumn dataField='time' dataSort={true}>Time</TableHeaderColumn>
          <TableHeaderColumn dataField='status' filterFormatted filter={{type: 'SelectFilter', options: this.state.statuses}} dataSort={true}>Status</TableHeaderColumn>
        </BootstrapTable>

        <Link to="/AddStudent">Add Student</Link>
      </div>
    );
  }
}
