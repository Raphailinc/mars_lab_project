#ifndef TASKQUEUE_H
#define TASKQUEUE_H

#include <queue>
#include <mutex>
#include <condition_variable>

struct Report {
    std::string scientistName;
    std::string content;
    std::string optionalFile;
    std::string creationDate;
    std::string status;
};

class TaskQueue {
public:
    TaskQueue() {}

    void addTask(const Report& report);
    Report getNextTask();
    bool isEmpty() const;

    void setReportStatus(const std::string& scientistName, const std::string& status);
    std::string getReportStatus(const std::string& scientistName) const;

private:
    std::queue<Report> tasks_;
    std::mutex mutex_;
    std::condition_variable condition_;
};

#endif