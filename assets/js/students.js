let apiKey = "Bearer 7baffc4b-8828-47ff-8ef4-2e0f6bde86cf";
let currentPromoId = new URLSearchParams(window.location.search).get('promoId');

function getstudents() {
    fetch('http://146.59.242.125:3009/promos/' + currentPromoId, {
        method: 'GET',
        headers: {
            'Authorization': apiKey,
        }
    })
    .then(response => response.json())
    .then(promo => {
        document.getElementById('titlePromo').textContent = 'Bienvenue dans la promo ' + promo.name + ' !';
        document.getElementById('students').innerHTML = '';
        promo.students.forEach(student => {
            createstudentElement(student);
        });
    })
    .catch(error => {
        console.error('Error fetching students:', error);
    });
}

function createstudentElement(student) {
    let studentDiv = document.createElement('div');
    studentDiv.classList.add('student');
    studentDiv.id = student._id; // Use _id for student ID

    let studentImg = document.createElement("img")
    studentImg.src = "../assets/img/femme.png";
    studentImg.classList.add("image")
    studentDiv.appendChild(studentImg)

    let studentNom = document.createElement('p');
    studentNom.textContent = 'Nom: ' + student.lastName;
    studentNom.classList.add('studentNom');
    studentDiv.appendChild(studentNom);

    let studentPrenom = document.createElement('p');
    studentPrenom.textContent = 'Prénom: ' + student.firstName;
    studentPrenom.classList.add('studentPrenom');
    studentDiv.appendChild(studentPrenom);

    let studentAge = document.createElement('p');
    studentAge.textContent = 'Âge: ' + student.age;
    studentAge.classList.add('studentAge');
    studentDiv.appendChild(studentAge);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.onclick = function() {
        deletestudent(student._id);
    };
    studentDiv.appendChild(deleteButton);

    let modifyButton = document.createElement('button');
    modifyButton.textContent = 'Modifier';
    modifyButton.onclick = function() {
        openModifyForm(student);
        document.getElementById('students').classList.add('hiddenimportant');
        getstudents()
    };
    studentDiv.appendChild(modifyButton);

    let divbutton = document.createElement('div')
    divbutton.classList.add('lesbuttons')
    divbutton.appendChild(modifyButton)
    divbutton.appendChild(deleteButton)
    
    studentDiv.appendChild(divbutton)
    

    document.getElementById('students').appendChild(studentDiv);

}

function openModifyForm(student) {
    // Fill the form with current student data
    document.getElementById('studentId').value = student._id;
    document.getElementById('studentNom').value = student.lastName;
    document.getElementById('studentPrenom').value = student.firstName;
    document.getElementById('studentAge').value = student.age;

    // Change button text to "Envoyer" and update onclick function
    let submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Envoyer';
    submitBtn.onclick = function() {
        addOrUpdateStudent('PUT');
        
    };

    // Show the modification form
    document.getElementById('ajoutstudentDiv').classList.remove('hidden');
}

function addstudent() {
    document.getElementById('studentId').value = ''; // Clear studentId field for adding new student

    document.getElementById('students').classList.add('hiddenimportant');
    document.getElementById('ajoutstudentDiv').classList.remove('hidden');

    // Change button text to "Ajouter" and update onclick function
    let submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Ajouter';
    submitBtn.onclick = function() {
        addOrUpdateStudent('POST');
    };
    // Show the modification form
    document.getElementById('ajoutstudentDiv').classList.remove('hidden');
    getstudents();
}

function resetErrorMessages() {
    document.getElementById('errorFirstName').textContent = '';
    document.getElementById('errorLastName').textContent = '';
    document.getElementById('errorAge').textContent = '';
}

function addOrUpdateStudent(method) {
    resetErrorMessages();

    let studentId = document.getElementById('studentId').value; // Get student ID from hidden field
    let studentNomInput = document.getElementById('studentNom');
    let studentPrenomInput = document.getElementById('studentPrenom');
    let studentAgeInput = document.getElementById('studentAge');

    let studentNom = studentNomInput.value.trim();
    let studentPrenom = studentPrenomInput.value.trim();
    let studentAge = studentAgeInput.value.trim();

    console.log(`Nom: ${studentNom}, Prénom: ${studentPrenom}, Âge: ${studentAge}`);

    if (studentNom === "" || studentPrenom === "" || studentAge === "") {
        return;
    }

    let studentData = {
        lastName: studentNom,
        firstName: studentPrenom,
        age: studentAge
    };

    let url = 'http://146.59.242.125:3009/promos/' + currentPromoId + '/students/';
    if (method === 'PUT' && studentId) {
        url += studentId;
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey
        },
        body: JSON.stringify(studentData)
    })
    .then(response => {
        response.json()
        .then(data => {
            if (!response.ok) {
                throw data;
            }
            console.log(data);
            if (method === 'POST') {
                // Add new student to UI
                createstudentElement(data);
                document.getElementById('studentForm').reset();
            } else if (method === 'PUT' && studentId) {
                // Update existing student in UI
                let studentDiv = document.getElementById(studentId);
                studentDiv.querySelector('.studentNom').textContent = 'Nom: ' + data.lastName;
                studentDiv.querySelector('.studentPrenom').textContent = 'Prénom: ' + data.firstName;
                studentDiv.querySelector('.studentAge').textContent = 'Âge: ' + data.age;
            }
            // Hide ajoutstudentDiv and show students div after submission
            document.getElementById('ajoutstudentDiv').classList.add('hidden');
            document.getElementById('students').classList.remove('hiddenimportant');
            resetErrorMessages();
            getstudents()

        })
        .catch(error => {
            handleErrors(error);
        });
    })
    .catch(error => {
        console.error('Error adding/updating student:', error);
    });
}

function handleErrors(error) {
    if (error.errors) {
        if (error.errors.firstName) {
            console.log(error.errors.firstName.message);
            let errorFirstName = document.getElementById('errorFirstName');
            errorFirstName.textContent = error.errors.firstName.message;
        }
        if (error.errors.lastName) {
            console.log(error.errors.lastName.message);
            let errorLastName = document.getElementById('errorLastName');
            errorLastName.textContent = error.errors.lastName.message;
        }
        if (error.errors.age) {
            console.log(error.errors.age.message);
            let errorAge = document.getElementById('errorAge');
            errorAge.textContent = error.errors.age.message;
        }
    }
}

function retour() {
    window.location.href = 'index.html';
}

function deletestudent(studentId) {
    console.log(`Attempting to delete student with ID: ${studentId}`);
    
    fetch('http://146.59.242.125:3009/promos/' + currentPromoId + '/students/' + studentId, {
        method: 'DELETE',
        headers: {
            'Authorization': apiKey
        }
    })
    .then(response => {
        if (response.ok) {
            console.log(`Successfully deleted student with ID: ${studentId}`);
            document.getElementById(studentId).remove(); // Remove student from UI
        } else {
            console.error('Failed to delete student');
        }
    })
    .catch(error => {
        console.error('Error deleting student:', error);
    });
    getstudents();
}

getstudents();
