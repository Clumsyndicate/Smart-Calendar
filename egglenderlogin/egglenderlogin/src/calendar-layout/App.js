import React from 'react';
import moment from "moment";
import Scheduler, { Editing } from 'devextreme-react/scheduler';
import SelectBox from 'devextreme-react/select-box';
import CheckBox from 'devextreme-react/check-box';
import List, { ItemDragging } from 'devextreme-react/list';
import { events } from './events.js';

import { data, locations } from './data.js';
import timeZoneUtils from 'devextreme/time_zone_utils';

const currentDate = new Date(moment().format("YYYY"), parseInt(moment().format("MM")) -1,  moment().format('DD'));
var txt = new String(moment().format("ddd[,] MMM DD"));

const views = ['week', 'month', 'day'];


function getLocations(date) {
  const timeZones = timeZoneUtils.getTimeZones(date);
  return timeZones.filter((timeZone) => {
    return locations.indexOf(timeZone.id) !== -1;
  });
}

const demoLocations = getLocations(currentDate);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeZone: demoLocations[0].id,
      demoLocations: demoLocations,
      //for list
      deleteType: 'slideItem',
      events,
    };
    this.onValueChanged = this.onValueChanged.bind(this);
    this.onAppointmentFormOpening = this.onAppointmentFormOpening.bind(this);
    this.onOptionChanged = this.onOptionChanged.bind(this);
    //for list
    this.onSelectedItemsChange = this.onSelectedItemsChange.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onReorder = this.onReorder.bind(this);
  }

  onValueChanged(e) {
    this.setState({
      timeZone: e.value
    });
  }
  onAppointmentFormOpening(e) {
    const form = e.form;

    const startDateTimezoneEditor = form.getEditor('startDateTimeZone');
    const endDateTimezoneEditor = form.getEditor('endDateTimeZone');
    const startDateDataSource = startDateTimezoneEditor.option('dataSource');
    const endDateDataSource = endDateTimezoneEditor.option('dataSource');

    startDateDataSource.filter(['id', 'contains', 'Europe']);
    endDateDataSource.filter(['id', 'contains', 'Europe']);

    startDateDataSource.load();
    endDateDataSource.load();
  }
  onOptionChanged(e) {
    if(e.name === 'currentDate') {
      this.setState({
        demoLocations: getLocations(e.value)
      });
    }
  }

// for list

  onSelectedItemsChange(args) {
    if(args.name === 'selectedItems') {
      this.setState({
        selectedItems: args.value
      });
    }
  }
  onDragStart(e) {
    e.itemData = 
    this.state[e.fromData][e.fromIndex];
  }
  onAdd(e) {
    const tasks = this.state[e.toData];
    this.setState({
      [e.toData]: [...tasks.slice(0, e.toIndex), e.itemData, ...tasks.slice(e.toIndex)]
    });
  }
  onRemove(e) {
    const tasks = this.state[e.fromData];
    this.setState({
      [e.fromData]: [...tasks.slice(0, e.fromIndex), ...tasks.slice(e.fromIndex + 1)]
    });
  }
  onReorder(e) {
    this.onRemove(e);
    this.onAdd(e);
  }

  render() {
    const { timeZone, demoLocations, events } = this.state;
    return (
      <React.Fragment>

        <div class="aParent">

          <div className="calendar-layout">
            <div className="option">
              <span className="caption">{txt} 「 Time Zone 」:</span>
              <SelectBox
                items={demoLocations}
                displayExpr="title"
                valueExpr="id"
                width={240}
                value={timeZone}
                onValueChanged={this.onValueChanged}
              />
            </div>
            <Scheduler
              dataSource={data}
              views={views}
              defaultCurrentView="week"
              startDayHour={0}
              defaultCurrentDate={currentDate}
              timeZone={timeZone}
              height={800}
              onAppointmentFormOpening={this.onAppointmentFormOpening}
              onOptionChanged={this.onOptionChanged}>
              <Editing
                allowTimeZoneEditing={true}
              />
            </Scheduler>
          </div>

          <div className="widget-container">

            <div className="header">
              <span className="caption">Upcoming Dues !!! </span>
              <div>( Slide left to delete, or drag to change 
               priority, or just put a check in the box !) 
              </div>
            </div>

            <List
              items={events}
              height={800}
              keyExpr="id"
              repaintChangesOnly={true}
              allowItemDeleting={true}
              itemDeleteMode={this.state.deleteType}
              showSelectionControls={true}
              selectionMode="multiple"
              onOptionChanged={this.onSelectedItemsChange}>
              <ItemDragging
                allowReordering={true}
                data="events"
                onDragStart={this.onDragStart}
                onAdd={this.onAdd}
                onRemove={this.onRemove}
                onReorder={this.onReorder}>
              </ItemDragging>
            </List>
          </div>

        </div>

      </React.Fragment>
    );
  }
}



export default App;
