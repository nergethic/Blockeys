import * as React from 'react';
import '../styles/main.scss';

export class DragDrop extends React.Component {
    state = {
        tasks: [
          {id: "1", taskName:"text1",type:"inProgress", backgroundColor: "red"},
          {id: "2", taskName:"text2", type:"inProgress", backgroundColor:"green"},
          {id: "3", taskName:"text3", type:"Done", backgroundColor:"blue"},
          {id: "4", taskName:"text4", type:"Done", backgroundColor:"green"}
        ]
    }

	onDragStart = (event: any, taskName: any) => {
    	console.log('dragstart on div: ', taskName);
    	event.dataTransfer.setData("taskName", taskName);
	}
	onDragOver = (event: any) => {
	    event.preventDefault();
	}

	onDrop = (event: any, cat: any) => {
	    let taskName = event.dataTransfer.getData("taskName");

	    let tasks = this.state.tasks.filter((task) => {
	        if (task.taskName == taskName) {
	            task.type = cat;
	        }
	        return task;
	    });

	    this.setState({
	        ...this.state,
	        tasks
	    });
    }
    
	render() {
		let tasks = {
	      inProgress: new Array(),
	      Done: new Array()
	    }

		this.state.tasks.forEach ((task) => {
            let t = task.type == "inProgress" ? tasks.inProgress : tasks.Done
		  t.push(
		    <div key={task.id} 
		      onDragStart = {(event) => this.onDragStart(event, task.taskName)}
		      draggable
		      className="draggable"
		      style = {{backgroundColor: task.backgroundColor}}>
		      {task.taskName}
		    </div>
		  );
		});

	    return (
	      <div className="drag-container">
	        <h2 className="head">To Do List Drag & Drop</h2>
		    <div className="inProgress"
                onDragOver={(event)=>this.onDragOver(event)}
                onDrop={(event)=>{this.onDrop(event, "inProgress")}}>
                <span className="group-header">In Progress</span>
                {tasks.inProgress}
            </div>
	        <div className="droppable"
	        	onDragOver={(event)=>this.onDragOver(event)}
          		onDrop={(event)=>this.onDrop(event, "Done")}>
	          <span className="group-header">Done</span>
	          {tasks.Done}
	        </div>	        
	      </div>
	    );
  	}
}