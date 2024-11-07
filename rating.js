document.addEventListener("DOMContentLoaded", function() {
    const stars = document.querySelectorAll("#rating-stars .star");
    const commentInput = document.getElementById("rating-comment");
    const submitButton = document.getElementById("submit-rating");
    let selectedRating = 0;
    const ADMIN_TOKEN = "CRISMORE2007";

    // Recuperar los comentarios y valoraciones previas desde el localStorage
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    let ratingData = JSON.parse(localStorage.getItem('ratingData')) || [0, 0, 0, 0, 0];  // Asegurarnos de que el array esté inicializado correctamente
    let hasRated = JSON.parse(localStorage.getItem('hasRated')) || false; // Para saber si el usuario ha valorado previamente

    // Verificar si el usuario ya ha enviado una valoración
    if (hasRated && comments.length > 0) {
        submitButton.disabled = true;
        alert("Ya has enviado una valoración.");
    }

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
        const userName = prompt("Ingresa tu nombre:");
        if (!userName) {
            alert("Por favor, ingresa tu nombre.");
            return;
        }

        // Guardar el comentario y la valoración
        comments.push({
            name: userName,
            rating: selectedRating,
            text: comment
        });

        ratingData[selectedRating - 1] += 1;
        updateChart(); // Actualizar el gráfico después de agregar una calificación

        localStorage.setItem('comments', JSON.stringify(comments));
        localStorage.setItem('ratingData', JSON.stringify(ratingData));
        localStorage.setItem('hasRated', JSON.stringify(true)); // Marcar como que el usuario ya ha valorado

        submitButton.disabled = true;
        selectedRating = 0;
        commentInput.value = "";
        updateStarSelection();
        renderComments();
    });

    let chart;
    function updateChart() {
        const ctx = document.getElementById("rating-chart").getContext("2d");

        // Si no hay comentarios, asegurarnos de que el gráfico esté en cero
        if (ratingData.every(val => val === 0)) {
            // Si no hay valoraciones, asegurarnos de que los datos sean 0
            ratingData = [0, 0, 0, 0, 0];
        }

        if (chart) {
            chart.destroy(); // Destruir el gráfico anterior
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

        // Si no hay comentarios, todos los usuarios pueden escribir.
        if (comments.length === 0) {
            submitButton.disabled = false;  // Habilitar el botón para que puedan escribir
        }

        comments.forEach((comment, index) => {
            const commentItem = document.createElement("li");
            commentItem.classList.add("comment-item");

            const userName = document.createElement("h4");
            userName.textContent = comment.name;

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
                    ratingData[comment.rating - 1] -= 1; // Actualizar la calificación en ratingData
                    comments.splice(index, 1);
                    localStorage.setItem('comments', JSON.stringify(comments));
                    localStorage.setItem('ratingData', JSON.stringify(ratingData));
                    renderComments();
                    updateChart(); // Actualizar el gráfico después de eliminar una calificación

                    // Permitir al usuario volver a escribir su comentario si lo ha eliminado
                    localStorage.setItem('hasRated', JSON.stringify(false));
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
    }

    // Inicializar el gráfico y los comentarios al cargar la página
    updateChart();if (ratingData.every(val => val === 0)) {
        ratingData = [0, 0, 0, 0, 0]; // Asegurarnos de que el gráfico empiece con valores cero
    }    
    renderComments();
});

// Configura la URL y las claves de la API de Supabase
const supabaseUrl = 'https://phndzfuiwmmpbzllyjrp.supabase.co';  // Asegúrate de que la URL sea correcta
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmR6ZnVpd21tcGJ6bGx5anJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NTE4NzAsImV4cCI6MjA0NjUyNzg3MH0.Mdf8Qvj-XwANZ0rMcuH1oNSHDremSVAe6--JV-capLg';  // Reemplaza con tu propia clave

// Crear cliente Supabase
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Estrellas seleccionadas
const stars = document.querySelectorAll("#rating-stars .star");
let selectedRating = 0;

// Manejo de la selección de estrellas
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

// Enviar la valoración
const submitButton = document.getElementById("submit-rating");
const commentInput = document.getElementById("rating-comment");

submitButton.addEventListener("click", async () => {
  if (selectedRating === 0) {
    alert("Por favor, selecciona una calificación.");
    return;
  }

  const comment = commentInput.value;
  const userName = prompt("Ingresa tu nombre:");
  if (!userName) {
    alert("Por favor, ingresa tu nombre.");
    return;
  }

  const { data, error } = await supabase
    .from('valoraciones')
    .insert([
      { name: userName, rating: selectedRating, text: comment }
    ]);

  if (error) {
    alert("Hubo un error al guardar tu valoración. Intenta de nuevo.");
  } else {
    alert("Valoración guardada correctamente.");
    commentInput.value = "";
    selectedRating = 0;
    updateStarSelection();
    fetchComments(); // Recarga los comentarios después de agregar uno nuevo
  }
});

// Mostrar los comentarios
async function fetchComments() {
  let { data: comments, error } = await supabase
    .from('valoraciones')
    .select('*')
    .order('created_at', { ascending: false });  // Ordena de más reciente a más antiguo

  if (error) {
    console.error('Error al cargar comentarios:', error);
  } else {
    renderComments(comments);
  }
}

function renderComments(comments) {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "";  // Limpiar lista de comentarios

  comments.forEach((comment) => {
    const commentItem = document.createElement("li");
    commentItem.classList.add("comment-item");

    const userName = document.createElement("h4");
    userName.textContent = comment.name;

    const stars = document.createElement("div");
    stars.classList.add("comment-stars");
    stars.textContent = "★".repeat(comment.rating) + "☆".repeat(5 - comment.rating);

    const userComment = document.createElement("p");
    userComment.textContent = comment.text;

    commentItem.appendChild(userName);
    commentItem.appendChild(stars);
    commentItem.appendChild(userComment);

    commentsList.appendChild(commentItem);
  });
}

fetchComments();  // Llamada inicial para cargar los comentarios










