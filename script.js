const KEY = "certiflow_requests_v2";

let requests = JSON.parse(
    localStorage.getItem(KEY) || "[]"
);

const role = localStorage.getItem("role");


// ===============================
// LOGIN CHECK
// ===============================

if (!role) {
    location.href = "index.html";
}


// ===============================
// ELEMENTS
// ===============================

const roleLabel =
    document.getElementById("roleLabel");

const studentArea =
    document.getElementById("studentArea");

const adminArea =
    document.getElementById("adminArea");

const requestForm =
    document.getElementById("requestForm");

const requestBody =
    document.getElementById("requestBody");

const search =
    document.getElementById("search");

const filter =
    document.getElementById("filter");


// ===============================
// ROLE DISPLAY
// ===============================

if (roleLabel) {
    roleLabel.textContent =
        role === "admin"
        ? "🛡️ Admin"
        : "👨‍🎓 Student";
}

if (role === "admin") {

    if (studentArea)
        studentArea.style.display = "none";

    if (adminArea)
        adminArea.style.display = "block";

} else {

    if (studentArea)
        studentArea.style.display = "block";

    if (adminArea)
        adminArea.style.display = "none";
}


// ===============================
// SAVE
// ===============================

function save() {

    localStorage.setItem(
        KEY,
        JSON.stringify(requests)
    );

}


// ===============================
// REQUEST ID
// ===============================

function createRequestId() {

    return "REQ-" +
        Date.now().toString().slice(-6);

}


// ===============================
// CERTIFICATE ID
// ===============================

function createCertificateId() {

    return "CERT-" +
        Date.now().toString().slice(-8);

}


// ===============================
// ESCAPE HTML
// ===============================

function esc(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================
// RENDER
// ===============================

function render() {

    if (!requestBody) return;

    const searchText =
        search
        ? search.value.toLowerCase()
        : "";

    const selectedFilter =
        filter
        ? filter.value
        : "All";


    let list = requests.filter(function(r) {

        const matchesSearch =
            (
                r.name +
                " " +
                r.regno +
                " " +
                r.type +
                " " +
                r.id
            )
            .toLowerCase()
            .includes(searchText);


        const matchesFilter =
            selectedFilter === "All" ||
            r.status === selectedFilter;


        return matchesSearch &&
               matchesFilter;

    });


    requestBody.innerHTML =
        list.map(function(r) {

            let action = "";


            // ADMIN ACTIONS

            if (role === "admin") {

                if (r.status === "Pending") {

                    action = `
                        <button
                            class="actionBtn"
                            onclick="setStatus('${r.id}','Approved')">
                            ✅ Approve
                        </button>

                        <button
                            class="actionBtn"
                            onclick="rejectRequest('${r.id}')">
                            ❌ Reject
                        </button>
                    `;

                } else {

                    action = `
                        <button
                            class="actionBtn"
                            onclick="view('${r.id}')">
                            👁️ View
                        </button>
                    `;

                }

            }


            // STUDENT ACTIONS

            if (role === "student") {

                if (r.status === "Approved") {

                    action = `
                        <button
                            class="actionBtn"
                            onclick="downloadCertificate('${r.id}')">
                            📥 Certificate
                        </button>
                    `;

                } else {

                    action = `
                        <button
                            class="actionBtn"
                            onclick="view('${r.id}')">
                            👁️ View
                        </button>
                    `;

                }

            }


            return `

                <tr>

                    <td>
                        ${esc(r.id)}
                    </td>

                    <td>
                        ${esc(r.name)}
                    </td>

                    <td>
                        ${esc(r.type)}
                    </td>

                    <td>
                        ${esc(r.date)}
                    </td>

                    <td>
                        <strong>
                            ${esc(r.status)}
                        </strong>
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;

        }).join("");


    updateStats();

}


// ===============================
// STATS
// ===============================

function updateStats() {

    const total =
        requests.length;

    const pending =
        requests.filter(
            r => r.status === "Pending"
        ).length;

    const approved =
        requests.filter(
            r => r.status === "Approved"
        ).length;

    const rejected =
        requests.filter(
            r => r.status === "Rejected"
        ).length;


    document.getElementById(
        "totalCount"
    ).textContent = total;


    document.getElementById(
        "pendingCount"
    ).textContent = pending;


    document.getElementById(
        "approvedCount"
    ).textContent = approved;


    document.getElementById(
        "rejectedCount"
    ).textContent = rejected;

}


// ===============================
// NEW REQUEST
// ===============================

if (requestForm) {

    requestForm.onsubmit =
        function(e) {

            e.preventDefault();


            const newRequest = {

                id:
                    createRequestId(),

                name:
                    document
                    .getElementById("name")
                    .value
                    .trim(),

                regno:
                    document
                    .getElementById("regno")
                    .value
                    .trim(),

                dept:
                    document
                    .getElementById("dept")
                    .value
                    .trim(),

                year:
                    document
                    .getElementById("year")
                    .value,

                type:
                    document
                    .getElementById("type")
                    .value,

                purpose:
                    document
                    .getElementById("purpose")
                    .value
                    .trim(),

                notes:
                    document
                    .getElementById("notes")
                    .value
                    .trim(),

                date:
                    new Date()
                    .toLocaleDateString("en-IN"),

                status:
                    "Pending",

                rejectionReason:
                    "",

                certificateId:
                    "",

                issueDate:
                    ""

            };


            requests.push(newRequest);

            save();

            requestForm.reset();

            render();

            alert(
                "✅ Certificate request submitted successfully!"
            );

        };

}


// ===============================
// CHANGE STATUS
// ===============================

function setStatus(id, status) {

    if (role !== "admin") {
        return;
    }


    const r =
        requests.find(
            item => item.id === id
        );


    if (!r) return;


    r.status = status;


    if (status === "Approved") {

        r.certificateId =
            createCertificateId();

        r.issueDate =
            new Date()
            .toLocaleDateString("en-IN");

        r.rejectionReason = "";

    }


    save();

    render();

    alert(
        "✅ Request approved successfully!"
    );

}


// ===============================
// REJECT REQUEST
// ===============================

function rejectRequest(id) {

    if (role !== "admin") {
        return;
    }


    const reason =
        prompt(
            "Enter rejection reason:"
        );


    if (!reason) {
        return;
    }


    const r =
        requests.find(
            item => item.id === id
        );


    if (!r) return;


    r.status = "Rejected";

    r.rejectionReason =
        reason.trim();


    save();

    render();

    alert(
        "❌ Request rejected."
    );

}


// ===============================
// VIEW REQUEST
// ===============================

function view(id) {

    const r =
        requests.find(
            item => item.id === id
        );


    if (!r) return;


    const modal =
        document.getElementById("modal");

    const modalContent =
        document.getElementById(
            "modalContent"
        );


    modalContent.innerHTML = `

        <h2>📄 Request Details</h2>

        <p>
            <b>Request ID:</b>
            ${esc(r.id)}
        </p>

        <p>
            <b>Student:</b>
            ${esc(r.name)}
        </p>

        <p>
            <b>Register Number:</b>
            ${esc(r.regno)}
        </p>

        <p>
            <b>Department:</b>
            ${esc(r.dept)}
        </p>

        <p>
            <b>Year:</b>
            ${esc(r.year)}
        </p>

        <p>
            <b>Certificate:</b>
            ${esc(r.type)}
        </p>

        <p>
            <b>Purpose:</b>
            ${esc(r.purpose)}
        </p>

        <p>
            <b>Notes:</b>
            ${esc(r.notes)}
        </p>

        <p>
            <b>Status:</b>
            ${esc(r.status)}
        </p>

        ${
            r.rejectionReason
            ? `
                <p>
                    <b>Rejection Reason:</b>
                    ${esc(r.rejectionReason)}
                </p>
              `
            : ""
        }

        ${
            r.certificateId
            ? `
                <p>
                    <b>Certificate ID:</b>
                    ${esc(r.certificateId)}
                </p>
              `
            : ""
        }

    `;


    modal.style.display = "flex";

}


// ===============================
// CLOSE MODAL
// ===============================

function closeModal() {

    const modal =
        document.getElementById("modal");

    if (modal) {
        modal.style.display = "none";
    }

}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("role");

    location.href =
        "index.html";

}


// ===============================
// CLEAR ALL
// ===============================

function clearAll() {

    if (role !== "admin") {
        return;
    }


    if (
        !confirm(
            "Delete all certificate requests?"
        )
    ) {
        return;
    }


    requests = [];

    save();

    render();

}


// ===============================
// DEMO REQUEST
// ===============================

function seed() {

    if (role !== "admin") {
        return;
    }


    requests.push({

        id:
            createRequestId(),

        name:
            "Demo Student",

        regno:
            "AAGC001",

        dept:
            "Computer Science",

        year:
            "3rd Year",

        type:
            "Bonafide Certificate",

        purpose:
            "Education Purpose",

        notes:
            "Demo request",

        date:
            new Date()
            .toLocaleDateString("en-IN"),

        status:
            "Pending",

        rejectionReason:
            "",

        certificateId:
            "",

        issueDate:
            ""

    });


    save();

    render();

}


// ===============================
// DOWNLOAD CERTIFICATE
// ===============================

function downloadCertificate(id) {

    if (role !== "student") {

        alert(
            "Only students can download certificates."
        );

        return;
    }


    const r =
        requests.find(
            item => item.id === id
        );


    if (!r) return;


    if (r.status !== "Approved") {

        alert(
            "Certificate is available only after approval."
        );

        return;
    }


    if (!r.certificateId) {

        r.certificateId =
            createCertificateId();

        r.issueDate =
            new Date()
            .toLocaleDateString("en-IN");

        save();

    }


    const certificate = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Certificate</title>

<style>

body {
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    padding: 40px;
}

.certificate {
    background: white;
    border: 8px solid #222;
    padding: 50px;
    text-align: center;
    max-width: 850px;
    margin: auto;
}

h1 {
    font-size: 38px;
}

h2 {
    margin-top: 30px;
}

p {
    font-size: 18px;
    line-height: 1.7;
}

.info {
    text-align: left;
    margin-top: 30px;
}

</style>

</head>

<body>

<div class="certificate">

    <h1>🎓 CERTIFICATE</h1>

    <h2>
        ${esc(r.type)}
    </h2>

    <p>
        This is to certify that
    </p>

    <h2>
        ${esc(r.name)}
    </h2>

    <p>
        Register Number:
        <b>${esc(r.regno)}</b>
    </p>

    <p>
        Department:
        <b>${esc(r.dept)}</b>
    </p>

    <p>
        has been issued this certificate
        for the requested purpose.
    </p>

    <div class="info">

        <p>
            <b>Certificate ID:</b>
            ${esc(r.certificateId)}
        </p>

        <p>
            <b>Issue Date:</b>
            ${esc(r.issueDate)}
        </p>

    </div>

    <br>

    <p>
        CertiFlow -
        Student Certificate Request System
    </p>

</div>

</body>

</html>

`;


    const blob =
        new Blob(
            [certificate],
            {
                type: "text/html"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;

    a.download =
        r.certificateId +
        "_" +
        r.name
        .replace(/\s+/g, "_") +
        ".html";


    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

}


// ===============================
// SEARCH / FILTER
// ===============================

if (search) {
    search.oninput = render;
}

if (filter) {
    filter.onchange = render;
}


// ===============================
// INITIAL LOAD
// ===============================

render();