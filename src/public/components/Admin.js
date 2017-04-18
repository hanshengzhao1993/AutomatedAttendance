import React from 'react';
import { Link } from 'react-router-dom';
import { getAttendanceRecords, getAttendanceRecordDate } from './requests/classes';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import tableHelpers from './helpers/tableHelpers.js'
import moment from 'moment';

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


  async deleteRecord() {
    const date = new Date();
    const momentDay = moment().format("YYYY-MM-DD");
    await getAttendanceRecordDate({date: momentDay});
  }

  async getTableData () {
    console.log('updating the table');
      const queryType = {queryType: 'allAttendance'};
      const attendanceRecords = await getAttendanceRecords(queryType);  
      attendanceRecords.forEach((item) => {
        item.date = tableHelpers.parseDateAndTime(item.date);
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
        let fullName = `${item.first_name} ${item.last_name}`;
        item.full_name = fullName;
        if (!this.state.emails[item.email]) {
          let thisEmail = this.state.emails;
          let thisStudent = this.state.students;
          thisEmail[item.email] = item.email;
          thisStudent[fullName] = fullName;
          this.setState({
            emails: thisEmail,
            students: thisStudent
          });
        }
      });
      this.setState({attendance: attendanceRecords});
  }

  componentWillMount() {
    this.getTableData();

    setInterval( ()=> {
      this.getTableData();
    }, 30000);
  }

  render() {
    return (
      <div>
        <BootstrapTable
          data = {this.state.attendance}
          csvFileName = {'Attendance.csv'}
          maxHeight = '750px'
          scrollTop = {'Top'}
          multiColumnSort = {5}
          striped
          hover
          condensed
          exportCSV
        >
          <TableHeaderColumn
            isKey
            dataField = 'class_name'
            width = '15%'
            dataSort
            filterFormatted
            filter = {{
              type: 'SelectFilter',
              options: this.state.classes
            }}
          >
            Class
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField = 'full_name'
            width = '25%'
            dataSort
            sortFunc = {tableHelpers.nameSort}
            filterFormatted
            filter = {{
              type: 'TextFilter'
            }}
          >
            Name
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField = 'date'
            width = '30%'
            dataAlign = 'right'
            dataFormat = {tableHelpers.dateFormatter}
            dataSort
            filterFormatted
            filter = {{
              type: 'TextFilter',
            }}
          >
            Date
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField = 'date'
            width = '15%'
            dataAlign = 'right'
            dataSort
            dataFormat = {tableHelpers.timeFormatter}
          >
            Time
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField = 'status'
            width = '15%'
            dataSort
            filterFormatted
            filter = {{
              type: 'SelectFilter',
              options: this.state.statuses
            }}
          >
            Status
          </TableHeaderColumn>
        </BootstrapTable>

        <div>          
          <button className="deleteRecord" onClick={this.deleteRecord.bind(this)}>Delete Record</button>
        </div>

      </div>
    );
  }
}
