// this coder contains the scheduler service that will be used to schedule the tasks

import { uiDelay } from "./helper";

class Scheduler {
  constructor(cpu, io, readyQueue, setUIReadyQueue, ioQueue, setUIIOQueue, endQueue, setUIEndQueue, delay) {
    this.cpu = cpu;
    this.io = io;
    this.readyQueue = readyQueue;
    this.setUIReadyQueue = setUIReadyQueue;
    this.ioQueue = ioQueue;
    this.setUIIOQueue = setUIIOQueue;
    this.endQueue = endQueue;
    this.setUIEndQueue = setUIEndQueue;
    this.delay = delay;
  }

  async run() {
    while (this.readyQueue.length > 0) {

      await uiDelay(this.delay);

      for (let i = 0; i < this.readyQueue.length; i++) {
        const task = this.dequeue();
        await this.cpu.run(task);
        await uiDelay(this.delay);
        
        if (task.cpuTime === 0 && task.ioTime === 0) {
          this.endQueue.push(task);
          this.setUIEndQueue(this.endQueue);

        } else if (task.cpuTime === 0 || task.ioTime !== 0) {
          this.ioQueue.push(task);
          this.setUIIOQueue(this.ioQueue);
          await this.io.run(task);
          const ioTask = this.ioDequeue();
          console.log("IO Task deq: ", ioTask);
          this.enqueue(ioTask);

        } else {
          this.enqueue(task);
        }
        
        await uiDelay(this.delay);
      };
    }
  }

  enqueue(task) {
    let newReadyQueue = []
    let isAdded = false

    if (this.readyQueue.length === 0) {
      newReadyQueue.push(task)
      this.setUIReadyQueue(newReadyQueue)
      return
    }
    for (let i = 0; i < this.readyQueue.length; i++) {
      if ((this.readyQueue[i].cpuTime >= task.cpuTime) && !isAdded) {
        newReadyQueue.push(task)
        isAdded = true
      }
      newReadyQueue.push(this.readyQueue[i])
    }
    if (!isAdded) {
      newReadyQueue.push(task)
    }
    console.log("New Ready Queue: ", newReadyQueue);
    
    this.readyQueue = newReadyQueue;
    this.setUIReadyQueue(newReadyQueue);
  }

  dequeue() {
    const task = this.readyQueue[0];
    this.readyQueue = this.readyQueue.slice(1);
    this.setUIReadyQueue(this.readyQueue);
    return task;
  }

  ioDequeue() {
    const task = this.ioQueue[0];
    this.ioQueue = this.ioQueue.slice(1);
    this.setUIIOQueue(this.ioQueue);
    return task;
  }
}

export default Scheduler;