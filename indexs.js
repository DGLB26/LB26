
const _0x9e21 = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5bTF5My1XR1UxMVExNkN jWV9iYTQ1dkVnZk9kTFhVbWpUcUdlOU5zX1FlU3g0RnE5R1lnZGx1bGJYcEZCNUp0N1Jody9leGVj";
const SCRIPT_URL = atob(_0x9e21.replace(/\s/g, '')); 
const SECRET_TOKEN = "MY_SECRET_TOKEN_2026";

// --- ২. Minimal Protection (optional) ---
// --- Advanced Protection (Inspect, View Source, Save & Print Block) ---
document.addEventListener('contextmenu', e => e.preventDefault()); // Right-click block

document.addEventListener('keydown', function(e) {
    // 1. F12 (Developer Tools)
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // 2. Ctrl + Shift + I/J/C (Inspect / Console)
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }

    // 3. Ctrl + U (View Source) - ETAY SOMOSSYA HOCHCHILO
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }

    // 4. Ctrl + S (Save Page) - ETAY SOMOSSYA HOCHCHILO
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }

    // 5. Ctrl + P (Print Page - Optional)
    if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
    }
}, false);

// Text selection ebong drag block kora
document.ondragstart = function() { return false; };

// --- ৩. Image Auto Compression (≤ 1MB) ---
function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX = 1200;

        if (width > height && width > MAX) {
          height *= MAX / width;
          width = MAX;
        } else if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- ৪. UI Functions ---
function showContent(id, button) {
  document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  if (button) button.classList.add("active");
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
  document.getElementById("status").textContent = "";
  document.getElementById("regForm").reset();
}

// Auto uppercase
document.querySelectorAll(
  `
  #name,
  #father,
  #mother,
  #husband,
  #voter,
  #caste,
  #ifsc,
  input[name="Village"],
  input[name="Post_Office"],
  input[name="Gram_Panchayat"],
  input[name="Police_Station"],
  input[name="District"],
  input[name="Bank_Branch"],
  input[name="Ration_Number"]
  `
).forEach(input => {
  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase();
  });
});

// File to Base64 Conversion
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// --- Form Submission (Updated for Google Sheets) ---
document.getElementById("regForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const s = document.getElementById("status");
    const photoInput = document.getElementById("photo");
    
    // Validations
    const a = document.getElementById("aadhaar").value.trim();
    const m = document.getElementById("mobile").value.trim();
    const i = document.getElementById("ifsc").value.trim();

    if (!/^\d{12}$/.test(a)) { s.textContent = "❌ Aadhaar must be 12 digits."; return; }
    if (!/^\d{10}$/.test(m)) { s.textContent = "❌ Mobile must be 10 digits."; return; }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(i)) { s.textContent = "❌ IFSC format invalid."; return; }
    
    if (!photoInput.files || photoInput.files.length === 0) {
        s.textContent = "❌ Please upload a Photo.";
        return;
    }
    // Photo size validation (UNDER 1 MB)
if (photoInput.files[0].size > 1024 * 1024) {
  s.textContent = "❌ Photo size must be under 1 MB.";
  return;
}

    s.innerHTML = "⏳ Registering... Please wait.";
    
    try {
        const photoBase64Url = await compressImage(photoInput.files[0]);
        const formData = new FormData(form);
        const data = {action: 'register',token: SECRET_TOKEN}; // Action যোগ করা হয়েছে

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        delete data.Photo; 
        data.Photo_Upload = photoBase64Url;
        
        // Silent Fields
        data.LB_ID = '';
        data.Case_Status = 'Wait for Entry';
        data.Bank_Validation = 'Waiting';
        data.Payment_Agreement = '0';
        data.Payment_Status = 'No Payment';
        data.Note = '';
        
        // Submit to Google Sheets (Firestore এর বদলে)
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.result === 'success') {
            s.style.color = 'green';
            s.textContent = `✅ Registered Successfully!`;
            form.reset();
            setTimeout(() => { closeModal('registerModal'); }, 1500);
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        s.style.color = 'red';
        s.textContent = `❌ Submission Failed! Check Console.`;
        console.error('Error:', error);
    }
});

// 🎂 Auto Age Calculate (as on 01-01-2026)
document.getElementById("dob").addEventListener("change", function () {
  const dob = new Date(this.value);
  if (isNaN(dob)) return;

  const targetDate = new Date("2026-01-01");

  // Future DOB block
  if (dob > targetDate) {
    document.getElementById("ageDisplay").value = "";
    document.getElementById("ageValue").value = "";
    return;
  }

  let age = targetDate.getFullYear() - dob.getFullYear();
  const m = targetDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < dob.getDate())) {
    age--;
  }

  // 👁️ User will see
  document.getElementById("ageDisplay").value = age + " Years";

  // 📤 Sheet will get
  document.getElementById("ageValue").value = age;
});

["aadhaar","account","mobile","pin"].forEach(id => {
  document.getElementById(id).addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
});
const marital = document.querySelector('select[name="Marital_Status"]');
const husband = document.getElementById("husband");

marital.addEventListener("change", () => {
  if (marital.value !== "Married") {
    husband.value = "";
    husband.disabled = true;
  } else {
    husband.disabled = false;
  }
});
