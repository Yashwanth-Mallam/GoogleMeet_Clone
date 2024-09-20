// Sample user data
const user = {
    name: "User Name",
    avatar: "images/default-avatar.png",
    micStatus: false,
    meetingCode: "zex-wmrz-aha",
};

// Function to dynamically update meeting room UI
function updateMeetingRoom(userData) {
    // Set user avatar
    document.getElementById('user-avatar').src = userData.avatar || 'default-avatar.png';

    // Set user name
    document.getElementById('user-name').textContent = userData.name || '[User Name]';

    // Set meeting code and time
    document.getElementById('meeting-code').textContent = userData.meetingCode;
    document.getElementById('meeting-time').textContent = userData.meetingTime;

    // Update mic status icon based on micStatus
    const micStatusIcon = document.getElementById('mic-status');
    if (userData.micStatus) {
        micStatusIcon.src = "images/mic-on-icon.png";  // Mic On icon
    } else {
        micStatusIcon.src = "images/mic-off-icon.png";  // Mic Off icon
    }
}


function updateTime() {
    const timeElement = document.getElementById('meeting-time');
    const now = new Date();
    
    // Format time as HH:MM AM/PM
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

    // Update the time in the interface
    timeElement.textContent = formattedTime;
}

// Call function to update user data
updateMeetingRoom(user);

// Update the time every second
setInterval(updateTime, 1000);