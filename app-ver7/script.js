document.addEventListener('DOMContentLoaded', function() {
    // Function to add a new medication entry
    function addMedicationEntry() {
        const medicationsContainer = document.querySelector('.medications');
        const index = medicationsContainer.querySelectorAll('.medication-group').length;
        const newMedicationGroup = document.createElement('div');
        newMedicationGroup.className = 'medication-group';
        newMedicationGroup.innerHTML = `
            <label>Medication Name:</label>
            <input type="text" class="medication-name" name="medicationName[]" required>

            <label>Dosage:</label>
            <input type="number" class="dosage" name="dosage[]" required>

            <label>Select Days to Take:</label>
            <div class="days">
                ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
                <label><input type="checkbox" name="days_${index}[]" value="${day}">${day}</label>`).join('')}
            </div>

            <label for="time">Time to Take:</label>
            <input type="time" class="time" name="time[]" required>
            
            <button type="button" class="remove-button">Remove</button>
        `;
        medicationsContainer.appendChild(newMedicationGroup);

        // Add remove button functionality
        newMedicationGroup.querySelector('.remove-button').addEventListener('click', function() {
            newMedicationGroup.remove();
        });
    }

    // Add new medication entry on button click
    document.getElementById('addMedication').addEventListener('click', addMedicationEntry);

    // Function to add a new allergy entry
    function addAllergyEntry() {
        const allergiesContainer = document.querySelector('.allergies');
        const newAllergyGroup = document.createElement('div');
        newAllergyGroup.className = 'allergy-group';
        newAllergyGroup.innerHTML = `
            <label>Allergy Name:</label>
            <input type="text" class="allergy-name" name="allergyName[]" required>
            <button type="button" class="remove-button">Remove</button>
        `;
        allergiesContainer.appendChild(newAllergyGroup);

        // Add remove button functionality
        newAllergyGroup.querySelector('.remove-button').addEventListener('click', function() {
            newAllergyGroup.remove();
        });
    }

    // Add new allergy entry on button click
    document.getElementById('addAllergy').addEventListener('click', addAllergyEntry);

    // Handle form submission
    document.getElementById('additionalInfoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const data = {
            medications: [],
            allergies: formData.getAll('allergyName[]')
        };

        // Extract medications with days and times
        const medicationNames = formData.getAll('medicationName[]');
        const dosages = formData.getAll('dosage[]');
        const times = formData.getAll('time[]');

        medicationNames.forEach((name, index) => {
            const days = formData.getAll(`days_${index}[]`);
            data.medications.push({
                medicationName: name,  // Correct key
                dosage: dosages[index],
                days: days,
                time: times[index]
            });
        });

        // Send the data to the server
        fetch('/update_medical_info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert('Data saved successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save data.');
        });
    });
});
