const currentDate = new Date();
let selectedDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    populateYearSelector();
    renderCalendar(currentDate);
    renderYearlyCalendar(currentDate.getFullYear());

    document.getElementById('add-event-form').addEventListener('submit', addEvent);
    document.getElementById('toggle-view').addEventListener('click', toggleView);
    document.getElementById('year-select').addEventListener('change', handleYearChange);

    setupModal();
});

function populateYearSelector() {
    const yearSelect = document.getElementById('year-select');
    const currentYear = currentDate.getFullYear();

    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

function handleYearChange() {
    const selectedYear = parseInt(document.getElementById('year-select').value, 10);
    selectedDate.setFullYear(selectedYear);
    renderCalendar(selectedDate);
    renderYearlyCalendar(selectedYear);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar(date) {
    const monthYear = document.getElementById('month-year');
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        calendarDays.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-cell');

        const formattedDate = formatDate(new Date(year, month, day));
        const events = getEvents().filter(event => event.date === formattedDate);

        const dayText = document.createElement('span');
        dayText.textContent = day;
        dayDiv.appendChild(dayText);

        if (events.length > 0) {
            const eventDescription = document.createElement('div');
            eventDescription.classList.add('event-description');
            eventDescription.innerHTML = events.map((event) => `
                ${event.name} at ${event.time}: ${event.description}
                <button class="delete-btn" onclick="deleteEvent('${event.name}', '${event.date}', '${event.time}')">Supprimer</button>
            `).join('<br>');
            dayDiv.appendChild(eventDescription);
        }

        dayDiv.addEventListener('click', () => showAddEventForm(new Date(year, month, day)));

        if (day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            dayDiv.classList.add('selected-date');
        }

        calendarDays.appendChild(dayDiv);
    }
}

function renderYearlyCalendar(year) {
    const calendarYearly = document.getElementById('calendar-yearly');
    calendarYearly.innerHTML = '';

    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('yearly-month');

        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        monthDiv.innerHTML = `<h3>${monthName}</h3>`;

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('yearly-days');

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            daysDiv.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-cell');

            const formattedDate = formatDate(new Date(year, month, day));
            const events = getEvents().filter(event => event.date === formattedDate);

            const dayText = document.createElement('span');
            dayText.textContent = day;
            dayDiv.appendChild(dayText);

            if (events.length > 0) {
                const eventDescription = document.createElement('div');
                eventDescription.classList.add('event-description');
                eventDescription.innerHTML = events.map((event) => `
                    ${event.name} at ${event.time}: ${event.description}
                    <button class="delete-btn" onclick="deleteEvent('${event.name}', '${event.date}', '${event.time}')">Supprimer</button>
                `).join('<br>');
                dayDiv.appendChild(eventDescription);
            }

            dayDiv.addEventListener('click', () => showAddEventForm(new Date(year, month, day)));
            daysDiv.appendChild(dayDiv);
        }

        monthDiv.appendChild(daysDiv);
        calendarYearly.appendChild(monthDiv);
    }
}

function showAddEventForm(date) {
    selectedDate = date;
    document.getElementById('add-event-date').value = formatDate(date);
    document.getElementById('add-event-form').style.display = 'block';
}

function addEvent(e) {
    e.preventDefault();

    const eventName = document.getElementById('add-event-name').value;
    const eventDate = document.getElementById('add-event-date').value;
    const eventTime = document.getElementById('add-event-time').value;
    const eventDescription = document.getElementById('add-event-description').value;

    const events = getEvents();

    events.push({
        name: eventName,
        date: eventDate,
        time: eventTime,
        description: eventDescription,
    });

    localStorage.setItem('events', JSON.stringify(events));

    updateEventList();
    renderCalendar(selectedDate);
    renderYearlyCalendar(selectedDate.getFullYear());
    document.getElementById('add-event-form').reset();
    document.getElementById('add-event-form').style.display = 'none';
}

function updateEventList() {
    const eventList = document.getElementById('schedule-list');
    eventList.innerHTML = '';

    const events = getEvents();
    const formattedSelectedDate = formatDate(selectedDate);

    events.filter(event => event.date === formattedSelectedDate).forEach((event) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${event.name} - ${event.time}: ${event.description}</span> 
                        <button onclick="deleteEvent('${event.name}', '${event.date}', '${event.time}')">Supprimer</button>`;
        eventList.appendChild(li);
    });
}

function deleteEvent(name, date, time) {
    let events = getEvents();
    events = events.filter(event => !(event.name === name && event.date === date && event.time === time));
    localStorage.setItem('events', JSON.stringify(events));

    updateEventList();
    renderCalendar(selectedDate);
    renderYearlyCalendar(selectedDate.getFullYear());

    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

function getEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
}

function setupModal() {
    const modal = document.getElementById('event-modal');
    const span = document.getElementsByClassName('close')[0];

    span.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function toggleView() {
    const calendarMonthly = document.getElementById('calendar-monthly');
    const calendarYearly = document.getElementById('calendar-yearly');
    const toggleButton = document.getElementById('toggle-view');

    if (calendarMonthly.style.display === 'none') {
        calendarMonthly.style.display = 'block';
        calendarYearly.style.display = 'none';
        toggleButton.textContent = 'Switch to Yearly View';
    } else {
        calendarMonthly.style.display = 'none';
        calendarYearly.style.display = 'block';
        toggleButton.textContent = 'Switch to Monthly View';
    }
}
