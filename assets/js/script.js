
let apiKey = "Bearer 7baffc4b-8828-47ff-8ef4-2e0f6bde86cf";
let editPromoElement = null;

function ajoutPromo() {
    document.getElementById('promoForm').reset();
    document.getElementById('promoId').value = '';
    editPromoElement = null;
    document.getElementById('promos').classList.add('hidden');
    document.getElementById('ajoutPromoDiv').classList.remove('hidden');
}

function resetErrorMessages() {
    document.getElementById('errorNamePromo').textContent = '';
    document.getElementById('errorStartDate').textContent = '';
    document.getElementById('errorEndDate').textContent = '';
}

function addOrUpdatePromo() {
    resetErrorMessages();

    let nameInput = document.getElementById('name');
    let startDateInput = document.getElementById('startDate');
    let endDateInput = document.getElementById('endDate');

    let promoName = nameInput.value;
    let startDate = startDateInput.value;
    let endDate = endDateInput.value;

    if (promoName === "" || startDate === "" || endDate === "") {
        return;
    }

    let promoData = {
        name: promoName,
        startDate: startDate,
        endDate: endDate
    };

    if (editPromoElement) {
        // Requête PUT pour mettre à jour une promo existante
        fetch('http://146.59.242.125:3009/promos/' + editPromoElement.dataset.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            body: JSON.stringify(promoData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw data;
                    });
                }
                return response.json();
            })
            .then(data => {
                editPromoElement.querySelector('h3').textContent = promoName;
                editPromoElement.querySelector('p.startDate').textContent = "Date de début: " + startDate;
                editPromoElement.querySelector('p.endDate').textContent = "Date de fin: " + endDate;

                // Réinitialiser les messages d'erreur après une mise à jour réussie
                resetErrorMessages();
            })
            .catch(error => {
                handleErrors(error);
            });
    } else {
        // Requête POST pour créer une nouvelle promo
        fetch('http://146.59.242.125:3009/promos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            body: JSON.stringify(promoData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw data;
                    });
                }
                return response.json();
            })
            .then(data => {
                // Réinitialiser les champs de formulaire
                nameInput.value = '';
                startDateInput.value = '';
                endDateInput.value = '';

                // Réinitialiser les messages d'erreur après une création réussie
                resetErrorMessages();

                // Réafficher la liste des promotions et masquer le formulaire
                document.getElementById('promos').classList.remove('hidden');
                document.getElementById('ajoutPromoDiv').classList.add('hidden');
                getPromos();
            })
            .catch(error => {
                handleErrors(error);
            });
    }
}

function handleErrors(error) {
    if (error.errors) {
        if (error.errors.name) {
            console.log(error.errors.name.message);
            let errorName = document.getElementById('errorNamePromo');
            errorName.textContent = error.errors.name.message;
        }
        if (error.errors.startDate) {
            console.log(error.errors.startDate.message);
            let errorStartDate = document.getElementById('errorStartDate');
            errorStartDate.textContent = error.errors.startDate.message;
        }
        if (error.errors.endDate) {
            console.log(error.errors.endDate.message);
            let errorEndDate = document.getElementById('errorEndDate');
            errorEndDate.textContent = error.errors.endDate.message;
        }
    }
}

function modifPromo(promoElement, name, startDate, endDate) {
    editPromoElement = promoElement;
    document.getElementById('promoId').value = promoElement.dataset.id;
    document.getElementById('name').value = name;
    document.getElementById('startDate').value = startDate;
    document.getElementById('endDate').value = endDate;

    document.getElementById('promos').classList.add('hidden');
    document.getElementById('ajoutPromoDiv').classList.remove('hidden');
}

function deletePromo(id, promoElement) {
    fetch('http://146.59.242.125:3009/promos/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': apiKey
        }
    }).then(response => {
        if (response.ok) {
            promoElement.remove();
        }
    });
}

function getPromos() {
    fetch('http://146.59.242.125:3009/promos', {
        method: 'GET',
        headers: {
            'Authorization': apiKey
        }
    }).then(response => response.json()).then(data => {
        document.getElementById('lespromos').innerHTML = ''
        data.forEach(promo => {
            createPromo(promo)
        });
    });
}

function createPromo(promo) {
    let promoDiv = document.createElement("div");
    promoDiv.classList.add("promo");
    promoDiv.dataset.id = promo._id;

    let promoTitle = document.createElement("h3");
    promoTitle.textContent = promo.name;
    promoDiv.appendChild(promoTitle);

    let startDate = new Date(promo.startDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    let endDate = new Date(promo.endDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    let startDatePara = document.createElement("p");
    startDatePara.classList.add("startDate");
    startDatePara.textContent = "Date de début: " + startDate;
    promoDiv.appendChild(startDatePara);

    let endDatePara = document.createElement("p");
    endDatePara.classList.add("endDate");
    endDatePara.textContent = "Date de fin: " + endDate;
    promoDiv.appendChild(endDatePara);

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener('click', function () {
        deletePromo(promo._id, promoDiv);
    });
    promoDiv.appendChild(deleteButton);

    let detailsButton = document.createElement("button");
    detailsButton.textContent = "Détails de la classe";
    detailsButton.addEventListener('click', function () {
        window.location.href = 'students.html?promoId=' + promo._id;
    });
    promoDiv.appendChild(detailsButton);

    let modifyButton = document.createElement("button");
    modifyButton.textContent = "Modifier";
    modifyButton.addEventListener('click', function () {
        modifPromo(promoDiv, promo.name, promo.startDate, promo.endDate);
    });
    promoDiv.appendChild(modifyButton);

    document.getElementById('lespromos').appendChild(promoDiv);
}
getPromos() // Fetch and display promos on page load

function afficherFormEleve() {
    document.getElementById('promos').classList.add('hidden');
    document.getElementById('eleveForm').reset();
    document.getElementById('ajoutEleveDiv').classList.remove('hidden');
}

function retour() {
    window.location.href = 'index.html';
}