document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and DOM fully loaded.");

    const calendarBody = document.getElementById("calendar-body");
    const modal = document.getElementById("day-details-modal");
    const modalText = document.getElementById("day-details-text");
    const closeModal = document.getElementById("close-modal");
    const crisisData = {}; // Object to store crisis data by date

    function generateCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        document.getElementById("current-month").textContent = `${monthNames[month]} ${year}`;

        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        calendarBody.innerHTML = "";

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement("td");
                if (i === 0 && j < firstDay || date > daysInMonth) {
                    cell.innerHTML = "";
                } else {
                    cell.innerHTML = date;
                    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
                    cell.setAttribute("data-date", formattedDate);
                    cell.classList.add("calendar-day");
                    cell.addEventListener("click", () => showDayDetails(formattedDate));
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
        console.log("Calendar generated.");
    }

    async function loadCSVAndMarkDates() {
        try {
            const response = await fetch("../fermetures_yeux.csv");
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log("CSV file loaded.");
            const rows = csvText.split("\n").slice(1);

            rows.forEach(row => {
                const columns = row.split(",");
                const timestamp = columns[0];
                const duration = columns[1];
                const tag = columns[2]?.trim();

                if (tag === "Crise potentielle") {
                    const [date] = timestamp.split(" ");
                    const [year, month, day] = date.split("-");
                    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

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

            console.log("Crisis Data:", crisisData);
            populateRecentCrises();
            createAnalyticsCharts();
            setupZoomOnGraphs(); // <<<<< ATTENTION : on ne met l'écouteur qu'après avoir créé les graphes
        } catch (error) {
            console.error("Error loading CSV file:", error);
        }
    }

    function showDayDetails(date) {
        if (crisisData[date]) {
            const details = crisisData[date]
                .map(crisis => `A crisis occurred at: ${crisis.timestamp}, lasting ${crisis.duration}s.`)
                .join("<br>");
            modalText.innerHTML = details;
        } else {
            modalText.innerHTML = "No crisis registered for this day.";
        }
        modal.style.display = "block";
    }

    function populateRecentCrises() {
        const crisesList = document.getElementById("crises-list");
        const recentCrises = Object.entries(crisisData)
            .flatMap(([date, crises]) => crises.map(crisis => ({ date, ...crisis })))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        crisesList.innerHTML = recentCrises.length
            ? recentCrises.map(crisis => `<li>${crisis.timestamp}: ${crisis.duration}s</li>`).join("")
            : "<li>No recent crises recorded.</li>";
    }

    function createAnalyticsCharts() {
        if (Object.keys(crisisData).length === 0) {
            console.warn("No data available for charts.");
            return;
        }
        createDurationDistributionChart();
        createTimeOfDayChart();
        createTrendOverTimeChart();
        createWeekdayPatternChart();
        updateSummaryStatistics();
    }

    function createDurationDistributionChart() {
        const durations = Object.values(crisisData).flat().map(c => parseFloat(c.duration));
        const bins = [], binCounts = [], binSize = 2;
        const maxDuration = Math.ceil(Math.max(...durations));

        for (let i = 0; i <= maxDuration; i += binSize) {
            bins.push(`${i}-${i + binSize}s`);
            binCounts.push(0);
        }

        durations.forEach(duration => {
            const binIndex = Math.floor(duration / binSize);
            if (binIndex < binCounts.length) binCounts[binIndex]++;
        });

        new Chart(document.getElementById('durationChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: bins,
                datasets: [{
                    label: 'Number of Crises',
                    data: binCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    function createTimeOfDayChart() {
        const hourBuckets = Array(24).fill(0);
        Object.values(crisisData).flat().forEach(c => {
            const hour = new Date(c.timestamp).getHours();
            hourBuckets[hour]++;
        });

        new Chart(document.getElementById('timeOfDayChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Crises by Hour',
                    data: hourBuckets,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    function createTrendOverTimeChart() {
        const dates = Object.keys(crisisData).sort();
        const counts = dates.map(date => crisisData[date].length);

        new Chart(document.getElementById('trendChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Crises over Time',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.2
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    function createWeekdayPatternChart() {
        const weekdays = Array(7).fill(0);
        Object.values(crisisData).flat().forEach(c => {
            const day = new Date(c.timestamp).getDay();
            weekdays[day]++;
        });

        new Chart(document.getElementById('weekdayChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                datasets: [{
                    label: 'Crises by Day',
                    data: weekdays,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    function updateSummaryStatistics() {
        const allDurations = Object.values(crisisData).flat().map(c => parseFloat(c.duration));
        const total = allDurations.length;
        const avg = total ? (allDurations.reduce((a, b) => a + b, 0) / total).toFixed(2) : 0;
        const max = total ? Math.max(...allDurations) : 0;

        const hourlyCounts = Array(24).fill(0);
        Object.values(crisisData).flat().forEach(c => {
            hourlyCounts[new Date(c.timestamp).getHours()]++;
        });
        const mostActiveHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));

        document.getElementById('total-crises').textContent = total;
        document.getElementById('avg-duration').textContent = avg;
        document.getElementById('max-duration').textContent = max;
        document.getElementById('most-active-time').textContent = `${mostActiveHour}:00`;
    }

    closeModal.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    document.querySelectorAll('#navbar a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    generateCalendar();
    loadCSVAndMarkDates();
});

// Zoom functionality
function setupZoomOnGraphs() {
    document.querySelectorAll('.chart-box canvas').forEach(canvas => {
        canvas.addEventListener('click', () => {
            const originalChart = Chart.getChart(canvas);
            const zoomOverlay = document.getElementById('zoom-overlay');
            const zoomContent = document.getElementById('zoom-content');

            const oldCanvas = zoomContent.querySelector('canvas.zoomed');
            if (oldCanvas) oldCanvas.remove();

            const newCanvas = document.createElement('canvas');
            newCanvas.classList.add('zoomed');
            zoomContent.appendChild(newCanvas);

            const ctx = newCanvas.getContext('2d');

            new Chart(ctx, {
                type: originalChart.config.type,
                data: JSON.parse(JSON.stringify(originalChart.data)),
                options: {
                    ...JSON.parse(JSON.stringify(originalChart.options)),
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            zoomOverlay.style.display = 'flex';
        });
    });

    document.getElementById('close-zoom').addEventListener('click', () => {
        document.getElementById('zoom-overlay').style.display = 'none';
    });

    document.getElementById('zoom-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'zoom-overlay') {
            document.getElementById('zoom-overlay').style.display = 'none';
        }
    });
}
