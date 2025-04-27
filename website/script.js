document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and DOM fully loaded.");
    
    const calendarBody = document.getElementById("calendar-body");
    const modal = document.getElementById("day-details-modal");
    const modalText = document.getElementById("day-details-text");
    const closeModal = document.getElementById("close-modal");

    let crisisData = {}; // Object to store crisis data by date

    // Function to generate the calendar for the current month
    function generateCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
    
        // Set the current month heading
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentMonthElement = document.getElementById("current-month");
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
        // Get the first day of the month and adjust for Monday as the first day
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1; // Adjust Sunday (0) to 6 and shift other days
    
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        // Clear the calendar body
        calendarBody.innerHTML = "";
    
        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");
    
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement("td");
    
                if (i === 0 && j < firstDay) {
                    // Empty cells before the first day of the month
                    cell.innerHTML = "";
                } else if (date > daysInMonth) {
                    // Empty cells after the last day of the month
                    cell.innerHTML = "";
                } else {
                    // Fill the cell with the date
                    cell.innerHTML = date;
                    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
                    cell.setAttribute("data-date", formattedDate);
                    cell.classList.add("calendar-day");
                    cell.addEventListener("click", () => showDayDetails(formattedDate));
                    date++; // Increment the date only for valid days
                }
    
                row.appendChild(cell);
            }
    
            calendarBody.appendChild(row);
        }
        console.log("Calendar generated.");
    }

    // Function to load the CSV file and mark dates with "Crise potentielle"
    async function loadCSVAndMarkDates() {
        try {
            const response = await fetch("./fermetures_yeux.csv");
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log("CSV file loaded.");
            const rows = csvText.split("\n").slice(1); // Skip the header row

            rows.forEach((row) => {
                const columns = row.split(",");
                const timestamp = columns[0];
                const duration = columns[1];
                const tag = columns[2]?.trim();

                if (tag === "Crise potentielle") {
                    const [date] = timestamp.split(" ");
                    const [year, month, day] = date.split("-");
                    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    if (!crisisData[formattedDate]) {
                        crisisData[formattedDate] = [];
                    }
                    crisisData[formattedDate].push({ timestamp, duration });

                    const cell = document.querySelector(`[data-date="${formattedDate}"]`);
                    if (cell) {
                        cell.classList.add("crise");
                        cell.title = "Crise potentielle";
                    }
                }
            });

            console.log("Crisis Data:", crisisData); // Debugging output
        } catch (error) {
            console.error("Error loading CSV file:", error);
        }
    }

    // Function to show details for a specific day
    function showDayDetails(date) {
        console.log("Clicked date:", date);
        console.log("Crisis data for date:", crisisData[date]); // Debugging output

        if (crisisData[date]) {
            const details = crisisData[date]
                .map((crisis) => `A crisis occured at : ${crisis.timestamp}, and lasted for ${crisis.duration}`)
                .join("<br>");
            modalText.innerHTML = details;
        } else {
            modalText.innerHTML = "No crisis registered for this day.";
        }
        modal.style.display = "block";
    }

    // Close the modal when the close button is clicked
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Generate the calendar and mark dates
    generateCalendar();
    loadCSVAndMarkDates();
});