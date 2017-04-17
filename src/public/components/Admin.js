import React from 'react';
import { Link } from 'react-router-dom';
import { getAttendanceRecords } from './requests/classes';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import tableHelpers from './helpers/tableHelpers.js'
import Select from 'react-select';
import Spinner from './Spinner';
import 'react-select/dist/react-select.css';
import 'react-widgets/lib/less/react-widgets.less';
import DateTime from 'react-widgets/lib/DateTimePicker';
import Moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { storeAttendanceRecord, emailLateStudents } from './requests/students';
import MomentTZ from 'moment-timezone';

momentLocalizer(Moment);

export default class Admin extends React.Component {
  constructor(props) {
    super(props);

    ['updateSelectedTimeCutoff'].forEach((method) => {
      this[method] = this[method].bind(this);
    });


    this.state = {
      attendance: [],
      classes: {},
      students: {},
      emails: {},
      selectedTimeCutoff: null,
      statuses: {}
    };
  }

  updateSelectedTimeCutoff(e) {
    let date = MomentTZ.tz(new Date(e), "America/Los_angeles").format();
    this.setState({ selectedTimeCutoff: date });
  }

  async componentWillMount() {
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

  render() {
    return (
      <div>

        <DateTime 
          defaultValue={new Date()}
          onChange={this.updateSelectedTimeCutoff}
        />

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
      </div>
    );
  }
}
