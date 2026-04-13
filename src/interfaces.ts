import { Moment } from "moment"

export interface TaskTemplate {
  name: string
  duration: number // seconds
  isFlexible: boolean
  
  color?: string
  miniContexts: [] // ids of the contexts involved
  projects: []
  conexts: []
}

export interface Task extends TaskTemplate{
  startTime: Moment
  endTime: Moment
  completed: boolean
  started: boolean
  timeStarted: Moment
}

export interface ContextTemplate{ // define the base context, not the actual implimentation
  name: string
  icon: string
  color: string
  tasks: TaskTemplate[]

}

export interface MiniContext { // contexts like walking or being in a meeting or driving or gaming or coding. accessible and switchable. 
  startTime: Moment
  endTime: Moment
  flexiStart: boolean
  flexiEnd: boolean


}


export interface Context { // like at home, at work, at dads, geraldine.. and other common overarching influences on daily activities
  startTime: Moment
  endTime: Moment
  

}

