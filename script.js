document.addEventListener("DOMContentLoaded", () => {
    // Dark Mode Toggle - Fixed to work on all pages
    const themeToggle = document.getElementById("theme-toggle");
    
    // Check local storage for theme preference
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
        if (themeToggle) {
            themeToggle.textContent = "☀️ Light Mode";
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDarkMode = document.body.classList.contains("dark-mode");
            themeToggle.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
            localStorage.setItem("darkMode", isDarkMode);
        });
    }

    // Skill Search
    const skillSearch = document.getElementById("skill-search");
    if (skillSearch) {
        skillSearch.addEventListener("input", () => {
            const query = skillSearch.value.toLowerCase();
            document.querySelectorAll("#skill-list li").forEach(skill => {
                skill.style.display = skill.textContent.toLowerCase().includes(query) ? "block" : "none";
            });
        });
    }

    // Fetch and Display Projects
    const projectList = document.getElementById("project-list");
    if (projectList) {
        fetch("projects.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch projects");
                }
                return response.json();
            })
            .then(projects => {
                if (projects && projects.length) {
                    projects.forEach(project => {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>${project.name}</strong> - ${project.language}`;
                        projectList.appendChild(li);
                    });
                } else {
                    projectList.innerHTML = "<li>No projects found</li>";
                }
            })
            .catch(error => {
                console.error("Error fetching projects:", error);
                projectList.innerHTML = "<li>Failed to load projects. Please try again later.</li>";
            });
    }

    // Fetch Weather Data - simulated
    const weatherInfo = document.getElementById("weather-info");
    if (weatherInfo) {
        // Simulated weather data since we don't have a real API key
        setTimeout(() => {
            const weatherData = {
                name: "Halifax",
                main: {
                    temp: 12.5,
                    humidity: 65
                }
            };
            weatherInfo.textContent = `${weatherData.name}: ${weatherData.main.temp}°C, Humidity: ${weatherData.main.humidity}%`;
        }, 1000);
    }

    // Contact Form Handling
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        // Form validation patterns
        const patterns = {
            name: /^[a-zA-Z\s\-'àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆŠŽ∂ð]+$/,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            subject: /^[a-zA-Z\s]+$/,
            message: /^[^<>]+$/
        };

        // Load saved draft from localStorage
        const loadFormDraft = () => {
            try {
                const formDraft = JSON.parse(localStorage.getItem("contactFormDraft") || "{}");
                
                if (formDraft.name) document.getElementById("name").value = formDraft.name;
                if (formDraft.email) document.getElementById("email").value = formDraft.email;
                if (formDraft.subject) document.getElementById("subject").value = formDraft.subject;
                if (formDraft.message) document.getElementById("message").value = formDraft.message;
                
                if (Object.keys(formDraft).length > 0) {
                    document.getElementById("draft-status").textContent = "Draft loaded";
                    setTimeout(() => {
                        document.getElementById("draft-status").textContent = "";
                    }, 3000);
                }
            } catch (error) {
                console.error("Error loading draft:", error);
            }
        };

        // Save form draft to localStorage
        const saveFormDraft = () => {
            try {
                const formData = {
                    name: document.getElementById("name").value,
                    email: document.getElementById("email").value,
                    subject: document.getElementById("subject").value,
                    message: document.getElementById("message").value
                };
                
                localStorage.setItem("contactFormDraft", JSON.stringify(formData));
                document.getElementById("draft-status").textContent = "Draft saved";
                
                setTimeout(() => {
                    document.getElementById("draft-status").textContent = "";
                }, 3000);
            } catch (error) {
                console.error("Error saving draft:", error);
            }
        };

        // Validate form fields
        const validateField = (field, pattern) => {
            const value = field.value.trim();
            const errorElement = document.getElementById(`${field.id}-error`);
            
            if (!errorElement) return true; // Skip if error element not found
            
            if (value === "") {
                errorElement.textContent = "This field is required";
                field.classList.add("invalid");
                return false;
            } else if (pattern && !pattern.test(value)) {
                let message = "Invalid format";
                
                if (field.id === "name") {
                    message = "Name can only contain letters, spaces, hyphens, apostrophes, and diacritical marks";
                } else if (field.id === "email") {
                    message = "Please enter a valid email address";
                } else if (field.id === "subject") {
                    message = "Subject can only contain letters and spaces";
                } else if (field.id === "message") {
                    message = "Message cannot contain HTML tags";
                }
                
                errorElement.textContent = message;
                field.classList.add("invalid");
                return false;
            } else {
                errorElement.textContent = "";
                field.classList.remove("invalid");
                return true;
            }
        };

        // Validate the consent checkbox
        const validateConsent = () => {
            const consentCheckbox = document.getElementById("consent");
            const errorElement = document.getElementById("consent-error");
            
            if (!consentCheckbox || !errorElement) return true; // Skip if elements not found
            
            if (!consentCheckbox.checked) {
                errorElement.textContent = "You must consent to proceed";
                return false;
            } else {
                errorElement.textContent = "";
                return true;
            }
        };

        // Add input event listeners to save draft
        ["name", "email", "subject", "message"].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return; // Skip if field not found
            
            field.addEventListener("input", () => {
                validateField(field, patterns[fieldId]);
                saveFormDraft();
            });
            
            // Also validate on blur
            field.addEventListener("blur", () => {
                validateField(field, patterns[fieldId]);
            });
        });

        // Handle form submission
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Validate all fields
            const nameValid = validateField(document.getElementById("name"), patterns.name);
            const emailValid = validateField(document.getElementById("email"), patterns.email);
            const subjectValid = validateField(document.getElementById("subject"), patterns.subject);
            const messageValid = validateField(document.getElementById("message"), patterns.message);
            const consentValid = validateConsent();
            
            if (nameValid && emailValid && subjectValid && messageValid && consentValid) {
                const formStatus = document.getElementById("form-status");
                formStatus.textContent = "Submitting...";
                formStatus.className = "";
                
                try {
                    // Sanitize data - additional layer of security
                    const sanitizeInput = (input) => {
                        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    };
                    
                    const formData = {
                        name: sanitizeInput(document.getElementById("name").value.trim()),
                        email: sanitizeInput(document.getElementById("email").value.trim()),
                        subject: sanitizeInput(document.getElementById("subject").value.trim()),
                        message: sanitizeInput(document.getElementById("message").value.trim()),
                        timestamp: new Date().toISOString()
                    };
                    
                    // Send data to backend API
                    const response = await fetch('/api/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    
                    // Clear the form and draft after successful submission
                    contactForm.reset();
                    localStorage.removeItem("contactFormDraft");
                    
                    formStatus.textContent = "Message sent successfully!";
                    formStatus.className = "success-message";
                    
                    setTimeout(() => {
                        formStatus.textContent = "";
                    }, 5000);
                    
                } catch (error) {
                    console.error("Error submitting form:", error);
                    
                    // Fallback to localStorage if server request fails
                    const messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
                    messages.push(formData);
                    localStorage.setItem("contactMessages", JSON.stringify(messages));
                    
                    formStatus.textContent = "Message saved locally due to server error.";
                    formStatus.className = "error-message";
                    
                    // Clear the form and draft
                    contactForm.reset();
                    localStorage.removeItem("contactFormDraft");
                }
            }
        });

        // Load saved draft when page loads
        loadFormDraft();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const messagesList = document.getElementById("messages-list");
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");
    const form = document.getElementById("contact-form");
    const submitButton = document.getElementById("submit-btn");

    // Display messages on the messages page
    if (messagesList) {
        displayMessages();
    }

    // Handle message form submission on the index page
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent the form from reloading the page

            const name = form.name.value;
            const email = form.email.value;
            const subject = form.subject.value;
            const message = form.message.value;

            try {
                const newMessage = {
                    name,
                    email,
                    subject,
                    message,
                    timestamp: new Date().toISOString(),
                };

                // Retrieve existing messages and append the new one
                const existingMessages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
                existingMessages.push(newMessage);

                // Save the updated messages back to localStorage
                localStorage.setItem("contactMessages", JSON.stringify(existingMessages));

                // Reset the form and show success message
                form.reset();
                alert("Message submitted successfully!");
                window.location.href = "messages.html"; // Redirect to the messages page
            } catch (error) {
                console.error("Error submitting message:", error);
                alert("Failed to submit message. Please try again.");
            }
        });
    }

    // Function to display messages from localStorage
    const displayMessages = () => {
        loadingMessage.style.display = "block";

        try {
            const messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
            loadingMessage.style.display = "none";

            if (!messages || messages.length === 0) {
                messagesList.innerHTML = "<li>No messages yet.</li>";
                return;
            }

            messagesList.innerHTML = "";
            messages.forEach((message) => {
                const messageItem = document.createElement("li");
                messageItem.className = "message-card";

                // Format the date for display
                let displayDate = "Unknown date";
                try {
                    const date = new Date(message.timestamp);
                    displayDate = date.toLocaleString();
                } catch (e) {
                    console.error("Date parsing error:", e);
                }

                messageItem.innerHTML = `
                    <h3>From: ${message.name}</h3>
                    <div class="message-subject">Subject: ${message.subject}</div>
                    <div class="message-date">Date: ${displayDate}</div>
                    <div class="message-content">${message.message}</div>
                `;

                messagesList.appendChild(messageItem);
            });
        } catch (error) {
            console.error("Error loading messages:", error);
            loadingMessage.style.display = "none";
            errorMessage.style.display = "block";
        }
    };
});
