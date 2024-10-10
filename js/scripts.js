// Custom JS for Medical Task Manager

document.addEventListener('DOMContentLoaded', () => {
    // Handle Add Task Form submission
    const addTaskForm = document.getElementById('addTaskForm');
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const taskName = document.getElementById('taskName').value.trim();
        const assignedTo = document.getElementById('assignedTo').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const status = document.getElementById('status').value;

        // Validate form
        if (!taskName || !assignedTo || !dueDate || !status) {
            alert('Please fill in all fields.');
            return;
        }

        // Create a new table row
        const tableBody = document.querySelector('#tasksTable tbody');
        const newRow = document.createElement('tr');

        const statusBadge = getStatusBadge(status);

        newRow.innerHTML = `
            <td>${tableBody.children.length + 1}</td>
            <td>${taskName}</td>
            <td>${assignedTo}</td>
            <td>${dueDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-task">Edit</button>
                <button class="btn btn-sm btn-danger delete-task">Delete</button>
            </td>
        `;

        tableBody.appendChild(newRow);

        // Reset the form
        addTaskForm.reset();

        // Close the modal
        const addTaskModal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        addTaskModal.hide();
    });

    // Function to get status badge HTML
    function getStatusBadge(status) {
        switch(status) {
            case 'Completed':
                return '<span class="badge bg-success">Completed</span>';
            case 'In Progress':
                return '<span class="badge bg-warning text-dark">In Progress</span>';
            case 'Pending':
                return '<span class="badge bg-secondary">Pending</span>';
            default:
                return '<span class="badge bg-light text-dark">Unknown</span>';
        }
    }

    // Handle Delete Task
    document.querySelector('#tasksTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-task')) {
            if (confirm('Are you sure you want to delete this task?')) {
                const row = e.target.closest('tr');
                row.remove();
                updateTaskNumbers();
            }
        }
    });

    // Handle Edit Task (Basic Example)
    document.querySelector('#tasksTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-task')) {
            const row = e.target.closest('tr');
            const taskName = row.children[1].textContent;
            const assignedTo = row.children[2].textContent;
            const dueDate = row.children[3].textContent;
            const status = row.children[4].innerHTML;

            // Populate the modal with existing data (for editing)
            // For simplicity, we'll reuse the Add Task Modal as Edit Task Modal
            document.getElementById('addTaskModalLabel').textContent = 'Edit Task';
            document.getElementById('taskName').value = taskName;
            document.getElementById('assignedTo').value = assignedTo;
            document.getElementById('dueDate').value = dueDate;
            // Extract status text
            const statusText = status.replace(/<[^>]*>?/gm, '');
            document.getElementById('status').value = statusText;

            // Change form submission behavior
            addTaskForm.removeEventListener('submit', addTask);
            addTaskForm.addEventListener('submit', function editTask(e) {
                e.preventDefault();

                // Update row with new values
                row.children[1].textContent = document.getElementById('taskName').value.trim();
                row.children[2].textContent = document.getElementById('assignedTo').value.trim();
                row.children[3].textContent = document.getElementById('dueDate').value;
                row.children[4].innerHTML = getStatusBadge(document.getElementById('status').value);

                // Reset form and modal
                addTaskForm.reset();
                document.getElementById('addTaskModalLabel').textContent = 'Add New Task';
                addTaskForm.removeEventListener('submit', editTask);
                addTaskForm.addEventListener('submit', addTask);

                // Close the modal
                const addTaskModal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
                addTaskModal.hide();
            });
        }
    });

    // Function to update task numbers after deletion
    function updateTaskNumbers() {
        const rows = document.querySelectorAll('#tasksTable tbody tr');
        rows.forEach((row, index) => {
            row.children[0].textContent = index + 1;
        });
    }

    // Initial Add Task Form Submission Listener
    function addTask(e) {
        // Placeholder function; actual functionality is handled above
    }
});
