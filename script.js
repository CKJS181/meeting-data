// Add your Firebase configuration here
const firebaseConfig = {
    apiKey: "AIzaSyAAVQrb6L0eqnwQBaf0l0W7knCs7POMe7I",
    authDomain: "meetingtracker-b702b.firebaseapp.com",
    projectId: "meetingtracker-b702b",
    storageBucket: "meetingtracker-b702b.firebasestorage.app",
    messagingSenderId: "165389367671",
    appId: "1:165389367671:web:f8e9bb53cbe9fddf73c972"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Load district-to-subdistrict mapping
fetch('mapping.csv')
    .then(response => response.text())
    .then(data => {
        const lines = data.split("\n");
        let mapping = {};
        lines.forEach(line => {
            const [district, subDistrict] = line.split(",");
            if (!mapping[district]) mapping[district] = [];
            mapping[district].push(subDistrict);
        });

        const districtDropdown = document.getElementById("district");
        Object.keys(mapping).forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtDropdown.appendChild(option);
        });

        districtDropdown.addEventListener("change", function() {
            const selectedDistrict = this.value;
            const subDistrictDropdown = document.getElementById("sub-district");
            subDistrictDropdown.innerHTML = '<option value="">Select Sub-District</option>';
            if (mapping[selectedDistrict]) {
                mapping[selectedDistrict].forEach(sub => {
                    const option = document.createElement("option");
                    option.value = sub;
                    option.textContent = sub;
                    subDistrictDropdown.appendChild(option);
                });
            }
        });
    });

document.getElementById("meeting-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const meetingData = {
        jsid: document.getElementById("jsid").value,
        district: document.getElementById("district").value,
        subDistrict: document.getElementById("sub-district").value,
        panchayat: document.getElementById("panchayat").value,
        village: document.getElementById("village").value,
        date: document.getElementById("meeting-date").value,
        time: document.getElementById("meeting-time").value,
        hostName: document.getElementById("host-name").value,
        hostNumber: document.getElementById("host-number").value,
        speakerNames: document.getElementById("speaker-names").value,
        status: "Scheduled"
    };

    db.collection("meetings").add(meetingData).then(() => {
        alert("Meeting recorded!");
        document.getElementById("meeting-form").reset();
    });
});

function downloadCSV() {
    db.collection("meetings").get().then(snapshot => {
        let csv = "JSID,District,Sub-District,Panchayat,Village,Date,Time,Host Name,Host Number,Speaker Names,Status\n";
        snapshot.forEach(doc => {
            const data = doc.data();
            csv += `${data.jsid},${data.district},${data.subDistrict},${data.panchayat},${data.village},${data.date},${data.time},${data.hostName},${data.hostNumber},${data.speakerNames},${data.status}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "meetings.csv";
        link.click();
    });
}
