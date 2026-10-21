const taskForm = document.getElementById("taskForm");
const taskText = document.getElementById("taskText");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDue = document.getElementById("taskDue");
const taskError = document.getElementById("taskError");
const categoryError = document.getElementById("categoryError");
const dueError = document.getElementById("dueError");
const formResult = document.getElementById("formResult");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");


taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear errors

    taskError.textContent = "";
    categoryError.textContent = "";
    dueError.textContent = "";
    formResult.textContent = "";

    taskText.classList.remove("invalid");
    taskCategory.classList.remove("invalid");
    taskDue.classList.remove("invalid");

    // Trim values

    const text = taskText.value.trim();
    const category = taskCategory.value;
    const priority = taskPriority.value;
    const due = taskDue.value;

    // Today's date in the same "YYYY-MM-DD" format, so the two can be compared -- (Done with AI)
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${now.getFullYear()}-${month}-${day}`;



    // Validate and show errors

    let isValid = true; 

    if (text.length < 1 || text.length > 100) {
        taskError.textContent = "Task must be 1–100 characters.";
        taskText.classList.add("invalid");
        isValid = false;
    }
    if (category === "") {
        categoryError.textContent = "Please choose a category.";
        taskCategory.classList.add("invalid");
        isValid = false;
    }
    if (due === "") {
        dueError.textContent = "Please choose a due date.";
        taskDue.classList.add("invalid");
        isValid = false;
    } else if (due < today) {
        dueError.textContent = "Due date can't be in the past.";
        taskDue.classList.add("invalid");
        isValid = false;
    }

    // If valid, show the result

    if (isValid) {
        // formResult.textContent = `${text} – ${category} – ${priority} – ${due}`;

        const taskData = {
            task: text,
            category: category,
            priority: priority,
            due: due,
            done: false
        };

        tasks.push(taskData);
        saveTasks();
        renderTasks();

        taskForm.reset();
    }
});

// Removing the errors

taskText.addEventListener("input", function () {
    taskError.textContent = "";
    taskText.classList.remove("invalid");
});
taskCategory.addEventListener("change", function () {
    categoryError.textContent = "";
    taskCategory.classList.remove("invalid");
});
taskDue.addEventListener("change", function () {
    dueError.textContent = "";
    taskDue.classList.remove("invalid");
});



// localStorage

const STORAGE_KEY = "notepadTasks";

function loadTasks() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
        return [];
    }
    return JSON.parse(savedData);
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();

// Drag and drop: remembers the position of the task being dragged
let draggedIndex = null;

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet.";
    } else {
        emptyMessage.textContent = "";
    }

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const li = document.createElement("li");
        li.classList.add("taskItem");
        li.draggable = true;

        // Checkbox for "Completed"

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.id = "task" + i;

        // Clicking the text also ticks the checkbox

        const label = document.createElement("label");
        label.htmlFor = "task" + i;
        label.textContent = task.task;

        // Category, priority, and due date

        const details = document.createElement("span");
        details.classList.add("taskDetails");
        details.textContent = task.category + " · " + task.priority + " · Due " + task.due;

        // Completed tasks get their own class

        if (task.done) {
            li.classList.add("completed");
        }

        // When the checkbox changes, update the task and draw the list again

        checkbox.addEventListener("change", function () {
            task.done = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        // Remove button

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.classList.add("removeButton");
        removeButton.textContent = "Remove";

        // Remove this task from the array (splice removes 1 item at position i) (Done with AI)

        removeButton.addEventListener("click", function () {
            tasks.splice(i, 1);
            saveTasks();
            renderTasks();
        });

        // Drag and drop events, done with AI
        // 1. Drag starts: remember which task is moving and fade the row
        li.addEventListener("dragstart", function (event) {
            draggedIndex = i;
            event.dataTransfer.setData("text/plain", i); // Firefox needs this, or the drag won't start
            li.classList.add("dragging");
            taskList.classList.add("isDragging");
        });

        // 2. Drag ends (dropped or cancelled): remove the drag styles
        li.addEventListener("dragend", function () {
            li.classList.remove("dragging");
            taskList.classList.remove("isDragging");
        });

        // 3. Dragging over another row: allow dropping and highlight the row
        li.addEventListener("dragover", function (event) {
            event.preventDefault(); // without this the browser won't allow a drop
            li.classList.add("dragOver");
        });

        // 4. Leaving the row: remove the highlight
        li.addEventListener("dragleave", function () {
            li.classList.remove("dragOver");
        });

        // 5. Dropped on this row: move the task in the array, save and draw again
        li.addEventListener("drop", function (event) {
            event.preventDefault();
            const movedTask = tasks.splice(draggedIndex, 1)[0]; 
            tasks.splice(i, 0, movedTask);                      
            saveTasks();
            renderTasks();
        });

        // List item structure: checkbox, label, details, remove button

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(details);
        li.appendChild(removeButton);
        taskList.appendChild(li);
    }
}

renderTasks();