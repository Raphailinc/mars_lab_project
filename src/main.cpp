#include <iostream>
#include "taskqueue.h"

int main() {
    TaskQueue taskQueue;

    Report report1 = {"Scientist 1", "Content 1", "File 1", "2024-03-05 10:00:00", "Pending"};
    Report report2 = {"Scientist 2", "Content 2", "File 2", "2024-03-05 10:30:00", "Pending"};

    taskQueue.addTask(report1);
    taskQueue.addTask(report2);

    std::cout << "Next task: " << taskQueue.getNextTask().scientistName << std::endl;
    std::cout << "Next task: " << taskQueue.getNextTask().scientistName << std::endl;

    return 0;
}