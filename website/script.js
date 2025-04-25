document.addEventListener("DOMContentLoaded", () => {
    const calendarBody = document.getElementById("calendar-body");

    // Function to generate the calendar for the current month
    function generateCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        // Get the first day of the month and the number of days in the month
        const firstDay = new Date(year, month, 1).getDay();
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
                    cell.setAttribute("data-date", `${year}-${month + 1}-${date}`);
                    cell.classList.add("calendar-day");
                    date++;
                }

                row.appendChild(cell);
            }

            calendarBody.appendChild(row);
        }
    }

    // Function to load the CSV file and mark dates with "Crise potentielle"
    async function loadCSVAndMarkDates() {
        try {
            const response = await fetch("../fermetures_yeux.csv");
            const csvText = await response.text();
            const rows = csvText.split("\n").slice(1); // Skip the header row

            rows.forEach((row) => {
                const columns = row.split(",");
                const date = columns[0];
                const tag = columns[2]?.trim();

                if (tag === "Crise potentielle") {
                    const [year, month, day] = date.split(" ")[0].split("-");
                    const cell = document.querySelector(
                        `[data-date="${year}-${parseInt(month)}-${parseInt(day)}"]`
                    );

                    if (cell) {
                        cell.classList.add("crise");
                        cell.title = "Crise potentielle";
                    }
                }
            });
        } catch (error) {
            console.error("Error loading CSV file:", error);
        }
    }

    // Generate the calendar and mark dates
    generateCalendar();
    loadCSVAndMarkDates();
});