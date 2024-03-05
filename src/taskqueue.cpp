#include "taskqueue.h"
#include <iostream>

void TaskQueue::addTask(const Report& report) {
    std::unique_lock<std::mutex> lock(mutex_);
    tasks_.push(report);
    condition_.notify_one();
}

Report TaskQueue::getNextTask() {
    std::unique_lock<std::mutex> lock(mutex_);
    while (tasks_.empty()) {
        condition_.wait(lock);
    }
    Report nextTask = tasks_.front();
    tasks_.pop();
    return nextTask;
}

bool TaskQueue::isEmpty() const {
    std::unique_lock<std::mutex> lock(const_cast<std::mutex&>(mutex_));
    return tasks_.empty();
}

void TaskQueue::setReportStatus(const std::string& scientistName, const std::string& status) {
    std::unique_lock<std::mutex> lock(mutex_);
    bool reportFound = false;

    while (!tasks_.empty()) {
        Report& task = tasks_.front();
        if (task.scientistName == scientistName) {
            task.status = status;
            reportFound = true;
            break;
        }
        tasks_.pop();
        tasks_.push(task);
    }
    if (!reportFound) {
        std::cerr << "Report not found: " << scientistName << std::endl;
    }
}

std::string TaskQueue::getReportStatus(const std::string& scientistName) const {
    std::unique_lock<std::mutex> lock(const_cast<std::mutex&>(mutex_));

    std::queue<Report> tasksCopy = tasks_;
    while (!tasksCopy.empty()) {
        const Report& task = tasksCopy.front();
        if (task.scientistName == scientistName) {
            return task.status;
        }
        tasksCopy.pop();
    }
    return "Report not found";
}