document.addEventListener("DOMContentLoaded", function() {
    const stars = document.querySelectorAll("#rating-stars .star");
    const commentInput = document.getElementById("rating-comment");
    const submitButton = document.getElementById("submit-rating");
    let selectedRating = 0;
    const ADMIN_TOKEN = "CRISMORE2007";

    // Recuperar comentarios y valoraciones desde Firebase
    const db = firebase.firestore();
    const commentsRef = db.collection("comments");
    const ratingDataRef = db.collection("ratingData").doc("ratings");
    const usersRef = db.collection("users");  // Nueva colección para gestionar usuarios

    let ratingData = [0, 0, 0, 0, 0];  // Inicializar la estructura de ratingData

    // Verificar si el usuario ya ha enviado una valoración
    const userName = prompt("Ingresa tu nombre:");
    if (!userName) {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    // Verificar si el usuario ha valorado previamente
    usersRef.doc(userName).get().then(doc => {
        if (doc.exists && doc.data().hasRated) {
            submitButton.disabled = true;
            alert("Ya has enviado una valoración.");
        }
    });

    // Obtener los datos de las valoraciones almacenadas
    ratingDataRef.get().then(doc => {
        if (doc.exists) {
            ratingData = doc.data().ratings;
            updateChart();  // Actualizar el gráfico
        }
    });

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            selectedRating = index + 1;
            updateStarSelection();
        });
    });

    function updateStarSelection() {
        stars.forEach((star, index) => {
            if (index < selectedRating) {
                star.classList.add("selected");
            } else {
                star.classList.remove("selected");
            }
        });
    }

    submitButton.addEventListener("click", () => {
        if (selectedRating === 0) {
            alert("Por favor, selecciona una calificación.");
            return;
        }

        const comment = commentInput.value;

        // Guardar el comentario y la valoración en Firebase
        commentsRef.add({
            userName: userName,
            rating: selectedRating,
            text: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            hasRated: true
        });

        // Actualizar la calificación en ratingData
        ratingData[selectedRating - 1] += 1;
        ratingDataRef.set({ ratings: ratingData });

        // Marcar que el usuario ha enviado una valoración
        usersRef.doc(userName).set({
            hasRated: true
        });

        // Actualizar gráfico
        updateChart();

        submitButton.disabled = true;
        selectedRating = 0;
        commentInput.value = "";
        updateStarSelection();
        renderComments();  // Volver a cargar los comentarios
    });

    let chart;
    function updateChart() {
        const ctx = document.getElementById("rating-chart").getContext("2d");

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["1 estrella", "2 estrellas", "3 estrellas", "4 estrellas", "5 estrellas"],
                datasets: [{
                    label: "Número de valoraciones",
                    data: ratingData,
                    backgroundColor: [
                        "#ff9999",
                        "#ffcc99",
                        "#ffff99",
                        "#99ff99",
                        "#99ccff"
                    ]
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderComments() {
        const commentsList = document.getElementById("comments-list");
        commentsList.innerHTML = "";

        commentsRef.orderBy("timestamp", "desc").get().then(snapshot => {
            snapshot.forEach(doc => {
                const comment = doc.data();
                const commentItem = document.createElement("li");
                commentItem.classList.add("comment-item");

                const userName = document.createElement("h4");
                userName.textContent = comment.userName;

                const stars = document.createElement("div");
                stars.classList.add("comment-stars");
                stars.textContent = "★".repeat(comment.rating) + "☆".repeat(5 - comment.rating);

                const userComment = document.createElement("p");
                userComment.textContent = comment.text;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Eliminar";
                deleteButton.classList.add("delete-button");

                deleteButton.addEventListener("click", () => {
                    const enteredToken = prompt("Ingresa el token de administración para eliminar el comentario:");
                    if (enteredToken === ADMIN_TOKEN) {
                        commentsRef.doc(doc.id).delete().then(() => {
                            ratingData[comment.rating - 1] -= 1;
                            ratingDataRef.set({ ratings: ratingData });

                            // Marcar que el usuario puede votar nuevamente
                            usersRef.doc(comment.userName).set({
                                hasRated: false
                            });

                            renderComments();
                            updateChart();  // Actualizar gráfico después de eliminar comentario
                        }).catch(error => {
                            console.error("Error al eliminar comentario: ", error);
                        });
                    } else {
                        alert("Token incorrecto. No tienes permiso para eliminar este comentario.");
                    }
                });

                commentItem.appendChild(userName);
                commentItem.appendChild(stars);
                commentItem.appendChild(userComment);
                commentItem.appendChild(deleteButton);

                commentsList.appendChild(commentItem);
            });
        });
    }

    // Inicializar el gráfico y los comentarios al cargar la página
    updateChart();
    renderComments();
});










