let events = [];

let WORKING_START_MINUTES = 480;  
let WORKING_END_MINUTES = 1080;   
let TOTAL_WORKING_DURATION = WORKING_END_MINUTES - WORKING_START_MINUTES;
const TIMELINE_HEIGHT = 600;     
let PIXELS_PER_MINUTE = TIMELINE_HEIGHT / TOTAL_WORKING_DURATION;

let draggedEventId = null;
let dragStartY = 0;
let dragStartOffset = 0;

// Utility functions
function timeToMinutes(timeString) {
    if (!timeString) return 0;
    const [h, m] = timeString.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes) {
    const safe = minutes % 1440;
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTimeDisplay(timeString) {
    const [h, m] = timeString.split(':').map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function minutesToPixels(mins) {
    return Math.max(0, (mins - WORKING_START_MINUTES) * PIXELS_PER_MINUTE);
}

function pixelsToMinutes(px) {
    return Math.floor(px / PIXELS_PER_MINUTE + WORKING_START_MINUTES);
}

// Conflict detection
function checkForConflicts(evts) {
    const conflicts = [];
    const sorted = [...evts].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    for(let i=0; i < sorted.length; i++) {
        for(let j=i+1; j < sorted.length; j++) {
            const a = sorted[i], b = sorted[j];
            if(timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(a.end) > timeToMinutes(b.start)) {
                if(!conflicts.some(x => x.id === a.id)) conflicts.push(a);
                if(!conflicts.some(x => x.id === b.id)) conflicts.push(b);
            }
        }
    }
    return conflicts;
}

function suggestResolution(conflicts) {
    if(conflicts.length === 0) return null;
    const toMove = conflicts[0];
    const dur = timeToMinutes(toMove.end) - timeToMinutes(toMove.start);

    const lastEnd = events.reduce((max, e) => Math.max(max, timeToMinutes(e.end)), WORKING_START_MINUTES);

    const newStart = lastEnd + 10; 

    if(newStart + dur > WORKING_END_MINUTES) return `Cannot resolve ${toMove.name}. No free slots.`

    return `Reschedule "${toMove.name}" to ${formatTimeDisplay(minutesToTime(newStart))} - ${formatTimeDisplay(minutesToTime(newStart + dur))}.`;
}

// Add event handler
function addEvent(e){
    e.preventDefault();

    const name = document.getElementById('event-name').value.trim();
    const start = document.getElementById('event-start').value;
    const end = document.getElementById('event-end').value;

    if(timeToMinutes(start) >= timeToMinutes(end)) {
        alertUser('error', 'Event start time must be before end time.');
        return;
    }

    events.push({
        id: Date.now(),
        name,
        start,
        end
    });
    e.target.reset();
    renderEvents();
}

// Drag & drop handlers
function handleDragStart(e) {
    e.dataTransfer.setDragImage(e.target, 0, 0);
    draggedEventId = Number(e.target.dataset.id);
    dragStartY = e.clientY;
    dragStartOffset = e.target.offsetTop;
    e.target.style.opacity = "0.7";
}

function handleDrag(e) {
    if (draggedEventId === null) return;
    e.preventDefault();

    if(e.clientY === 0) return; 

    const eventBlock = document.getElementById(`event-${draggedEventId}`);
    const deltaY = e.clientY - dragStartY;
    let newTop = dragStartOffset + deltaY;

    newTop = Math.max(0, Math.min(newTop, TIMELINE_HEIGHT - eventBlock.offsetHeight));

    eventBlock.style.top = newTop + "px";

    const newStartMinutes = pixelsToMinutes(newTop);
    const evt = events.find(x => x.id === draggedEventId);
    const dur = timeToMinutes(evt.end) - timeToMinutes(evt.start);
    const newEndMinutes = newStartMinutes + dur;

    const feedback = eventBlock.querySelector('.time-feedback');
    if(feedback) {
        feedback.textContent = `(${formatTimeDisplay(minutesToTime(newStartMinutes))} - ${formatTimeDisplay(minutesToTime(newEndMinutes))})`;
    }
}

function handleDragEnd(e) {
    if(draggedEventId === null) return;

    const eventBlock = document.getElementById(`event-${draggedEventId}`);
    eventBlock.style.opacity = "1";

    let finalTop = eventBlock.offsetTop;
    const minutesMoved = Math.round(finalTop / PIXELS_PER_MINUTE);
    const snappedMinutes = Math.round(minutesMoved / 5) * 5;
    finalTop = snappedMinutes * PIXELS_PER_MINUTE;

    const newStartMinutes = pixelsToMinutes(finalTop);
    const evt = events.find(x => x.id === draggedEventId);
    const dur = timeToMinutes(evt.end) - timeToMinutes(evt.start);
    const newEndMinutes = newStartMinutes + dur;

    

    const idx = events.findIndex(x => x.id === draggedEventId);
    if(idx !== -1) {
        events[idx].start = minutesToTime(newStartMinutes);
        events[idx].end = minutesToTime(newEndMinutes);
    }

    draggedEventId = null;
    renderEvents();
    alertUser('success', `Event "${evt.name}" rescheduled to ${formatTimeDisplay(events[idx].start)}.`);
}


function renderTimeLabels() {
    const labels = document.getElementById('time-labels');
    labels.innerHTML = '';

    for(let m = WORKING_START_MINUTES; m <= WORKING_END_MINUTES; m += 60) {
        const topPx = minutesToPixels(m);
        const timeStr = minutesToTime(m);

        const label = document.createElement('div');
        label.className = 'time-label';
        label.style.top = `${topPx - 10}px`;
        label.textContent = formatTimeDisplay(timeStr);

        labels.appendChild(label);

        // Hour lines in timeline grid
        const line = document.createElement('div');
        line.className = 'timeline-hour-line';
        line.style.top = `${topPx}px`;
        document.getElementById('timeline').appendChild(line);
    }
}

function renderEvents() {
    const eventsLayer = document.getElementById('events-layer');
    eventsLayer.innerHTML = '';

    const conflicts = checkForConflicts(events);
    const conflictIds = conflicts.map(e => e.id);

    const conflictMsg = document.getElementById('conflict-message');
    const resolutionMsg = document.getElementById('resolution-message');

    if(conflicts.length > 0) {
        conflictMsg.textContent = `🚨 Conflict Detected: ${conflicts.map(e => `"${e.name}"`).join(', ')}.`;
        conflictMsg.classList.remove('hidden');

        resolutionMsg.textContent = `💡 Suggested: ${suggestResolution(conflicts)}`;
        resolutionMsg.classList.remove('hidden');
    } else {
        conflictMsg.classList.add('hidden');
        resolutionMsg.classList.add('hidden');
    }

    events.forEach(evt => {
        const topPx = minutesToPixels(timeToMinutes(evt.start));
        const durationPx = (timeToMinutes(evt.end) - timeToMinutes(evt.start)) * PIXELS_PER_MINUTE;
        const isConflicting = conflictIds.includes(evt.id);
        const isOutside = timeToMinutes(evt.start) < WORKING_START_MINUTES || timeToMinutes(evt.end) > WORKING_END_MINUTES;

        const block = document.createElement('div');
        block.id = `event-${evt.id}`;
        block.dataset.id = evt.id;
        block.className = `event-block ${isConflicting ? 'event-conflict' : 'event-normal'} ${isOutside ? 'event-outside' : ''}`;
        block.style.top = `${topPx}px`;
        block.style.height = `${durationPx}px`;
        block.draggable = true;

        block.addEventListener('dragstart', handleDragStart);

        block.innerHTML = `
            <p class="event-name">${evt.name}</p>
            <p class="event-time time-feedback">
                ${formatTimeDisplay(evt.start)} - ${formatTimeDisplay(evt.end)}
            </p>
        `;

        eventsLayer.appendChild(block);
    });
}


function alertUser(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}


function updateWorkingHours() {
    const startInput = document.getElementById('working-start').value;
    const endInput = document.getElementById('working-end').value;

    const startM = timeToMinutes(startInput);
    const endM = timeToMinutes(endInput);

    if(startM >= endM) {
        alertUser('error', 'Working start time must be before end time.');
        return;
    }

    WORKING_START_MINUTES = startM;
    WORKING_END_MINUTES = endM;
    TOTAL_WORKING_DURATION = WORKING_END_MINUTES - WORKING_START_MINUTES;
    PIXELS_PER_MINUTE = TIMELINE_HEIGHT / TOTAL_WORKING_DURATION;

    document.getElementById('hours-text').textContent = `${formatTimeDisplay(minutesToTime(WORKING_START_MINUTES))} - ${formatTimeDisplay(minutesToTime(WORKING_END_MINUTES))}`;

    document.getElementById('time-labels').innerHTML = '';
    
    document.querySelectorAll('.timeline-hour-line').forEach(el => el.remove());

    renderTimeLabels();
    renderEvents();
}


function init() {
    document.getElementById('btn-update-hours').addEventListener('click', updateWorkingHours);

   
    document.getElementById('hours-text').textContent = `${formatTimeDisplay(minutesToTime(WORKING_START_MINUTES))} - ${formatTimeDisplay(minutesToTime(WORKING_END_MINUTES))}`;

   
    events = [
        { id: 101, name: "Meeting A", start: "09:00", end: "10:30" },
        { id: 102, name: "Workshop B", start: "10:00", end: "11:30" },
        { id: 103, name: "Lunch Break", start: "12:00", end: "13:00" },
        { id: 104, name: "Presentation C", start: "12:30", end: "14:00" },
    ];

    renderTimeLabels();
    renderEvents();

   
    const timeline = document.getElementById('timeline');
    timeline.addEventListener('dragover', handleDrag);
    timeline.addEventListener('drop', handleDragEnd);
    timeline.addEventListener('dragend', handleDragEnd);

    
    window.addEvent = addEvent;
}

init();
